import json
from typing import Any, Dict
from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse, PlainTextResponse, Response

from app.core.config import REGISTRY_PATH, SHARED_SCHEMAS_DIR
from app.schemas.form_payload import RenderLatexRequest, RenderPdfRequest
from app.services.html_builder import (
    build_standalone_html_from_json,
    wrap_react_html_for_pdf,
)
from app.services.latex_builder import build_latex_from_json
from app.services.pdf_renderer import render_latex_to_pdf_bytes

router = APIRouter(prefix="/api/v1", tags=["Medical Forms"])


def _load_registry() -> Dict[str, Any]:
    if not REGISTRY_PATH.exists():
        raise HTTPException(status_code=500, detail="Không tìm thấy file registry.json")
    return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))


def _resolve_template_and_sample(template_id: str) -> Dict[str, Any]:
    registry = _load_registry()
    item = next(
        (t for t in registry.get("templates", []) if t["id"] == template_id or t["code"] == template_id),
        None,
    )
    if not item:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy mẫu bệnh án '{template_id}'")

    schema_path = SHARED_SCHEMAS_DIR / item["schemaFile"]
    sample_path = SHARED_SCHEMAS_DIR / item["sampleFile"]

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


@router.get("/templates", summary="Lấy danh sách toàn bộ 29 mẫu bệnh án (Phụ lục XXVIII)")
def list_templates() -> Dict[str, Any]:
    return _load_registry()


@router.get("/templates/{template_id}", summary="Lấy cấu hình Schema và JSON mẫu của một bệnh án")
def get_template_detail(template_id: str) -> Dict[str, Any]:
    return _resolve_template_and_sample(template_id)


@router.post("/render/html", response_class=HTMLResponse, summary="Render JSON sang HTML chuẩn A4")
def render_form_to_html(payload: RenderPdfRequest) -> HTMLResponse:
    bundle = _resolve_template_and_sample(payload.template_id)
    if payload.rendered_html:
        full_html = wrap_react_html_for_pdf(payload.rendered_html, title=bundle["meta"]["title"])
    else:
        full_html = build_standalone_html_from_json(bundle["schema"], payload.data)
    return HTMLResponse(content=full_html)


@router.post("/render/pdf", summary="Chuyển đổi JSON -> LaTeX (.tex) -> Biên dịch ra PDF trên Server")
def render_form_to_pdf(payload: RenderPdfRequest) -> Response:
    bundle = _resolve_template_and_sample(payload.template_id)
    tex_source = build_latex_from_json(bundle["schema"], payload.data)

    try:
        pdf_bytes = render_latex_to_pdf_bytes(tex_source)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    filename = f"{payload.template_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/render/latex", response_class=PlainTextResponse, summary="Chuyển đổi JSON sang file LaTeX (.tex)")
def render_form_to_latex(payload: RenderLatexRequest) -> PlainTextResponse:
    bundle = _resolve_template_and_sample(payload.template_id)
    tex_source = build_latex_from_json(bundle["schema"], payload.data)
    filename = f"{payload.template_id}.tex"
    return PlainTextResponse(
        content=tex_source,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
