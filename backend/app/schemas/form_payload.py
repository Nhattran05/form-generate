from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class RenderPdfRequest(BaseModel):
    template_id: str = Field(default="01_noi_khoa", description="ID mẫu bệnh án (VD: 01_noi_khoa)")
    data: Dict[str, Any] = Field(default_factory=dict, description="Dữ liệu JSON của bệnh án")
    rendered_html: Optional[str] = Field(
        default=None,
        description="HTML đã được React Component render (nếu truyền lên sẽ ưu tiên in đúng 100% từ Component React)"
    )


class RenderLatexRequest(BaseModel):
    template_id: str = Field(default="01_noi_khoa", description="ID mẫu bệnh án")
    data: Dict[str, Any] = Field(default_factory=dict, description="Dữ liệu JSON của bệnh án")
