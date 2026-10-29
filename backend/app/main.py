from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes_form import router as form_router
from app.core.config import IMAGES_DIR

app = FastAPI(
    title="Medical Form JSON-to-PDF API (TT 32/2023/TT-BYT & Pain Clinic)",
    description="Hệ thống API chuyển đổi dữ liệu JSON sang PDF và LaTeX cho 29 mẫu bệnh án Phụ lục XXVIII và mẫu Bệnh Án Đau Toàn Diện (30/BV1).",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if IMAGES_DIR.exists():
    app.mount("/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")

app.include_router(form_router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "medical-form-generator"}
