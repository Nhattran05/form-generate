import os
import shutil
import subprocess
import tempfile
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


def render_latex_to_pdf_bytes(tex_source: str) -> bytes:
    """
    Biên dịch mã nguồn LaTeX (.tex) sang PDF bytes bằng xelatex / pdflatex trên Server.
    Không phụ thuộc vào trình duyệt (Browser/Chromium).
    """
    compiler = _find_latex_compiler()
    if not compiler:
        raise RuntimeError(
            "Không tìm thấy trình biên dịch LaTeX (xelatex / pdflatex) trên Server."
        )

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        tex_file = tmp_path / "medical_record.tex"
        pdf_file = tmp_path / "medical_record.pdf"
        tex_file.write_text(tex_source, encoding="utf-8")

        cmd = [
            compiler,
            "-interaction=nonstopmode",
            "-halt-on-error",
            f"-output-directory={tmp_path}",
            str(tex_file),
        ]
        proc = subprocess.run(
            cmd,
            cwd=str(tmp_path),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=60,
            check=False,
        )

        if not pdf_file.exists():
            stdout_log = proc.stdout.decode("utf-8", errors="ignore")[-1500:]
            stderr_log = proc.stderr.decode("utf-8", errors="ignore")[-1000:]
            raise RuntimeError(
                f"Lỗi biên dịch LaTeX sang PDF bằng {Path(compiler).name}:\n{stdout_log}\n{stderr_log}"
            )

        return pdf_file.read_bytes()
