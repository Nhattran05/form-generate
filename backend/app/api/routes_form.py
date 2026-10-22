import base64
import json
import re
import unicodedata
from urllib.parse import quote
from typing import Any, Dict, Optional
from fastapi import APIRouter, BackgroundTasks, Body, HTTPException, Query
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse, Response

from app.core.config import REGISTRY_PATH, SHARED_SCHEMAS_DIR
from app.schemas.form_payload import RenderLatexRequest, RenderPdfRequest
from app.services.html_builder import (
    build_standalone_html_from_json,
    wrap_react_html_for_pdf,
)
from app.services.latex_builder import build_latex_from_json
from app.services.pdf_renderer import (
    cleanup_file_or_dir,
    render_latex_to_pdf_bytes,
    render_latex_to_temp_pdf_file,
)

router = APIRouter(prefix="/api/v1", tags=["Medical Forms"])


def _load_registry() -> Dict[str, Any]:
    if not REGISTRY_PATH.exists():
        raise HTTPException(status_code=500, detail="Không tìm thấy file registry.json")
    return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))


def _normalize_identifier(val: str) -> str:
    return re.sub(r"[^a-zA-Z0-9]", "", str(val or "")).lower()


def _resolve_template_and_sample(template_id: str) -> Dict[str, Any]:
    registry = _load_registry()
    templates = registry.get("templates", [])

    norm_target = _normalize_identifier(template_id)
    # 1. Tìm chính xác theo id hoặc code
    item = next(
        (t for t in templates if t["id"] == template_id or t["code"] == template_id),
        None,
    )
    # 2. Tìm không phân biệt ký tự đặc biệt (VD: '01bv1', '01noikhoa', '01')
    if not item:
        item = next(
            (
                t
                for t in templates
                if _normalize_identifier(t["id"]) == norm_target
                or _normalize_identifier(t["code"]) == norm_target
                or _normalize_identifier(t.get("officialCode", "")) == norm_target
                or norm_target in [t["id"][:2], t["code"][:2]]
            ),
            None,
        )

    if not item:
        raise HTTPException(
            status_code=404,
            detail=f"Không tìm thấy mẫu bệnh án '{template_id}'. Vui lòng kiểm tra danh sách tại GET /api/v1/templates",
        )

    schema_path = SHARED_SCHEMAS_DIR / item["schemaFile"]
    sample_path = SHARED_SCHEMAS_DIR / item["sampleFile"]

    if not schema_path.exists():
        # Fallback về schema nhóm tương ứng
        schema_path = SHARED_SCHEMAS_DIR / "templates" / "01_noi_khoa.json"
    if not sample_path.exists():
        sample_path = SHARED_SCHEMAS_DIR / "samples" / "01_noi_khoa.sample.json"

    schema_data = json.loads(schema_path.read_text(encoding="utf-8"))
    sample_data = json.loads(sample_path.read_text(encoding="utf-8"))

    schema_data["id"] = item["id"]
    schema_data["code"] = item["code"]
    schema_data["officialCode"] = item["officialCode"]
    schema_data["title"] = item["title"]

    if "header" in sample_data:
        sample_data["templateId"] = item["id"]
        sample_data["header"]["tenBenhAn"] = item["title"]
        sample_data["header"]["maSo"] = item["officialCode"]

    return {
        "meta": item,
        "schema": schema_data,
        "sample": sample_data,
    }


def _detect_template_id_from_data(data: Dict[str, Any], fallback: str = "01_noi_khoa") -> str:
    """Tự động phát hiện templateId từ các trường phổ biến trong dữ liệu JSON."""
    if "template_id" in data and data["template_id"]:
        return str(data["template_id"])
    if "templateId" in data and data["templateId"]:
        return str(data["templateId"])
    header = data.get("header", {})
    if "maSo" in header and header["maSo"]:
        return str(header["maSo"])
    if "tenBenhAn" in header and header["tenBenhAn"]:
        # Thử tìm theo tiêu đề
        registry = _load_registry()
        for t in registry.get("templates", []):
            if t["title"].lower() in header["tenBenhAn"].lower():
                return t["id"]
    return fallback


def _clean_patient_name(data: Dict[str, Any]) -> str:
    raw_name = (
        data.get("hanhChinh", {}).get("hoVaTen")
        or data.get("hoVaTen")
        or "BenhAn"
    )
    s = str(raw_name).replace("Đ", "D").replace("đ", "d")
    nfkd = unicodedata.normalize("NFKD", s)
    ascii_name = "".join(c for c in nfkd if not unicodedata.combining(c))
    clean = re.sub(r"[^\w\s-]", "", ascii_name).strip().replace(" ", "_")
    return clean or "BenhAn"


@router.get("/templates", summary="Lấy danh sách toàn bộ 29 mẫu bệnh án (Phụ lục XXVIII)")
def list_templates() -> Dict[str, Any]:
    """Trả về toàn bộ danh mục 29 mẫu bệnh án (01/BV1 -> 29/BV1) kèm mô tả và layout group."""
    return _load_registry()


@router.get("/templates/{template_id}", summary="Lấy thông tin Schema và JSON mẫu của bệnh án")
def get_template_detail(template_id: str) -> Dict[str, Any]:
    """Lấy chi tiết Metadata, Schema định dạng và Sample JSON của mẫu bệnh án."""
    return _resolve_template_and_sample(template_id)


@router.get("/templates/{template_id}/sample", summary="Lấy file JSON mẫu điền sẵn chuẩn xác")
def get_template_sample(template_id: str) -> Dict[str, Any]:
    """Trả về trực tiếp dữ liệu JSON mẫu đầy đủ để Client/HIS dễ dàng map dữ liệu."""
    bundle = _resolve_template_and_sample(template_id)
    return bundle["sample"]


@router.post(
    "/pdf",
    summary="[PUBLIC API] Nhận JSON bệnh án -> Trả về file PDF (Tự động xóa file tạm trên server)",
    response_description="File binary PDF chuẩn application/pdf hoặc JSON Base64",
)
def export_pdf_auto(
    background_tasks: BackgroundTasks,
    payload: Dict[str, Any] = Body(
        ...,
        description="Dữ liệu JSON bệnh án (có thể truyền trực tiếp hoặc bọc dạng {'template_id': '...', 'data': {...}})",
    ),
    format: str = Query("pdf", pattern="^(pdf|base64|tex)$", description="Định dạng trả về: pdf | base64 | tex"),
    download: bool = Query(True, description="Nếu true, trả về header Content-Disposition: attachment để trình duyệt tự tải"),
):
    """
    Endpoint đa năng cho Client (HIS/EMR):
    - Nhận dữ liệu JSON bệnh án ở Body.
    - Tự động nhận diện mẫu (qua `templateId`, `template_id`, `header.maSo` hoặc `header.tenBenhAn`).
    - Biên dịch LaTeX trên server ra file PDF.
    - Trả về luồng file PDF chuẩn cho Client.
    - **Tự động xóa sạch file PDF tạm khỏi server ngay sau khi gửi xong** (qua BackgroundTasks).
    """
    # Xử lý trường hợp bọc {'template_id', 'data'}
    if "data" in payload and isinstance(payload["data"], dict):
        tid = payload.get("template_id") or _detect_template_id_from_data(payload["data"])
        data_obj = payload["data"]
    else:
        tid = _detect_template_id_from_data(payload)
        data_obj = payload

    return _process_pdf_response(tid, data_obj, format, download, background_tasks)


@router.post(
    "/pdf/{template_id}",
    summary="[PUBLIC API] Nhận JSON với template_id chỉ định trên URL -> Trả về file PDF (Tự động xóa file tạm)",
    response_description="File binary PDF chuẩn application/pdf hoặc JSON Base64",
)
def export_pdf_by_template(
    template_id: str,
    background_tasks: BackgroundTasks,
    payload: Dict[str, Any] = Body(..., description="Dữ liệu JSON của bệnh án"),
    format: str = Query("pdf", pattern="^(pdf|base64|tex)$", description="Định dạng trả về: pdf | base64 | tex"),
    download: bool = Query(True, description="Nếu true, trả về header Content-Disposition: attachment"),
):
    """
    Endpoint gọi theo mẫu cụ thể trên URL (VD: `POST /api/v1/pdf/01_noi_khoa` hoặc `POST /api/v1/pdf/01/BV1`):
    - Body: Raw JSON bệnh án.
    - Trả về file PDF và xóa file tạm trên server ngay sau phản hồi.
    """
    data_obj = payload.get("data") if ("data" in payload and isinstance(payload["data"], dict)) else payload
    return _process_pdf_response(template_id, data_obj, format, download, background_tasks)


def _process_pdf_response(
    template_id: str,
    data: Dict[str, Any],
    format_type: str,
    download: bool,
    background_tasks: BackgroundTasks,
):
    bundle = _resolve_template_and_sample(template_id)
    actual_tid = bundle["meta"]["id"]
    tex_source = build_latex_from_json(bundle["schema"], data)

    # 1. Nếu client yêu cầu lấy mã nguồn LaTeX (.tex)
    if format_type == "tex":
        tex_filename = f"{actual_tid}.tex"
        headers = (
            {"Content-Disposition": f'attachment; filename="{tex_filename}"'}
            if download
            else {}
        )
        return PlainTextResponse(content=tex_source, headers=headers)

    patient_name = _clean_patient_name(data)
    filename = f"{actual_tid}_{patient_name}.pdf"

    # 2. Biên dịch ra file PDF tạm thời trên server
    try:
        temp_pdf_path = render_latex_to_temp_pdf_file(
            tex_source, filename_prefix=f"{actual_tid}_{patient_name}"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Lỗi khi biên dịch PDF cho mẫu {template_id}: {str(exc)}"
        ) from exc

    # 3. Nếu client yêu cầu dạng JSON Base64
    if format_type == "base64":
        try:
            pdf_bytes = temp_pdf_path.read_bytes()
            b64_str = base64.b64encode(pdf_bytes).decode("ascii")
            return {
                "success": True,
                "template_id": actual_tid,
                "template_code": bundle["meta"]["code"],
                "filename": filename,
                "size_bytes": len(pdf_bytes),
                "mime_type": "application/pdf",
                "pdf_base64": b64_str,
            }
        finally:
            cleanup_file_or_dir(temp_pdf_path)

    # 4. Trả về luồng file PDF (FileResponse) và kích hoạt xóa file tạm trên server ngay sau khi truyền xong
    background_tasks.add_task(cleanup_file_or_dir, temp_pdf_path)

    disposition = "attachment" if download else "inline"
    return FileResponse(
        path=str(temp_pdf_path),
        media_type="application/pdf",
        filename=filename,
        headers={"Content-Disposition": f'{disposition}; filename="{filename}"'},
    )


# ---------------- Giữ tương thích ngược với Frontend React Studio ----------------
@router.post("/render/pdf", summary="Chuyển đổi JSON -> PDF (Tương thích React Studio)")
def render_form_to_pdf(payload: RenderPdfRequest, background_tasks: BackgroundTasks) -> Response:
    bundle = _resolve_template_and_sample(payload.template_id)
    tex_source = build_latex_from_json(bundle["schema"], payload.data)
    try:
        temp_pdf = render_latex_to_temp_pdf_file(tex_source, filename_prefix=payload.template_id)
        background_tasks.add_task(cleanup_file_or_dir, temp_pdf)
        filename = f"{payload.template_id}.pdf"
        return FileResponse(
            path=str(temp_pdf),
            media_type="application/pdf",
            filename=filename,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/render/html", response_class=HTMLResponse, summary="Render JSON sang HTML chuẩn A4")
def render_form_to_html(payload: RenderPdfRequest) -> HTMLResponse:
    bundle = _resolve_template_and_sample(payload.template_id)
    if payload.rendered_html:
        full_html = wrap_react_html_for_pdf(payload.rendered_html, title=bundle["meta"]["title"])
    else:
        full_html = build_standalone_html_from_json(bundle["schema"], payload.data)
    return HTMLResponse(content=full_html)


@router.post("/render/latex", response_class=PlainTextResponse, summary="Chuyển đổi JSON sang file LaTeX (.tex)")
def render_form_to_latex(payload: RenderLatexRequest) -> PlainTextResponse:
    bundle = _resolve_template_and_sample(payload.template_id)
    tex_source = build_latex_from_json(bundle["schema"], payload.data)
    filename = f"{payload.template_id}.tex"
    return PlainTextResponse(
        content=tex_source,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
