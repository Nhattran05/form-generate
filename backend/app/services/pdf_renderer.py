import os
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path
from typing import Optional


def _find_latex_compiler() -> Optional[str]:
    """
    Tìm trình biên dịch LaTeX trên Server / máy chủ.
    Ưu tiên xelatex (hỗ trợ Times New Roman & Unicode tiếng Việt), sau đó fallback sang pdflatex / lualatex.
    """
    miktex_dir = Path.home() / "AppData" / "Local" / "Programs" / "MiKTeX" / "miktex" / "bin" / "x64"
    candidates = [
        shutil.which("xelatex"),
        str(miktex_dir / "xelatex.exe") if (miktex_dir / "xelatex.exe").exists() else None,
        shutil.which("pdflatex"),
        str(miktex_dir / "pdflatex.exe") if (miktex_dir / "pdflatex.exe").exists() else None,
        shutil.which("lualatex"),
        str(miktex_dir / "lualatex.exe") if (miktex_dir / "lualatex.exe").exists() else None,
    ]
    for path in candidates:
        if path and os.path.exists(path):
            return path
    return None


def cleanup_file_or_dir(target_path: str | Path) -> None:
    """
    Hàm dọn dẹp chạy ngầm trong BackgroundTasks của FastAPI:
    Xóa file PDF tạm hoặc thư mục tạm trên server ngay sau khi đã truyền xong dữ liệu về cho Client.
    """
    try:
        p = Path(target_path)
        if p.is_file():
            p.unlink(missing_ok=True)
        elif p.is_dir():
            shutil.rmtree(p, ignore_errors=True)
    except Exception:
        pass


def render_latex_to_temp_pdf_file(tex_source: str, filename_prefix: str = "med_form") -> Path:
    """
    Biên dịch LaTeX sang file PDF tạm thời trên server.
    Trả về đường dẫn file PDF tạm. Dùng cho FileResponse kèm BackgroundTasks để tự xóa sau khi trả về cho Client.
    """
    compiler = _find_latex_compiler()
    if not compiler:
        raise RuntimeError(
            "Không tìm thấy trình biên dịch LaTeX (xelatex / pdflatex) trên Server."
        )

    # Tạo thư mục làm việc tạm thời cho quá trình biên dịch
    work_dir = Path(tempfile.mkdtemp(prefix="latex_build_"))
    unique_id = uuid.uuid4().hex[:8]
    tex_file = work_dir / f"{filename_prefix}_{unique_id}.tex"
    pdf_file = work_dir / f"{filename_prefix}_{unique_id}.pdf"
    tex_file.write_text(tex_source, encoding="utf-8")

    cmd = [
        compiler,
        "-interaction=nonstopmode",
        "-halt-on-error",
        f"-output-directory={work_dir}",
        str(tex_file),
    ]

    try:
        proc = subprocess.run(
            cmd,
            cwd=str(work_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=60,
            check=False,
        )

        if not pdf_file.exists():
            stdout_log = proc.stdout.decode("utf-8", errors="ignore")[-1500:]
            stderr_log = proc.stderr.decode("utf-8", errors="ignore")[-1000:]
            # Dọn dẹp thư mục nếu lỗi
            shutil.rmtree(work_dir, ignore_errors=True)
            raise RuntimeError(
                f"Lỗi biên dịch LaTeX sang PDF bằng {Path(compiler).name}:\n{stdout_log}\n{stderr_log}"
            )

        # Chuyển file PDF sang thư mục temp chung để có thể dọn dẹp work_dir ngay
        system_temp = Path(tempfile.gettempdir())
        final_pdf_path = system_temp / f"{filename_prefix}_{unique_id}.pdf"
        shutil.copy2(pdf_file, final_pdf_path)

        # Dọn dẹp các file phụ trợ (.tex, .aux, .log) ngay lập tức
        shutil.rmtree(work_dir, ignore_errors=True)

        return final_pdf_path

    except Exception:
        shutil.rmtree(work_dir, ignore_errors=True)
        raise


def render_latex_to_pdf_bytes(tex_source: str) -> bytes:
    """
    Biên dịch mã nguồn LaTeX (.tex) sang PDF bytes trực tiếp trong bộ nhớ.
    """
    temp_pdf = render_latex_to_temp_pdf_file(tex_source)
    try:
        return temp_pdf.read_bytes()
    finally:
        cleanup_file_or_dir(temp_pdf)
