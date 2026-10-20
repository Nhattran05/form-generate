from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_form import router as form_router

app = FastAPI(
    title="Medical Form JSON-to-PDF API (TT 32/2023/TT-BYT)",
    description="Hệ thống API chuyển đổi dữ liệu JSON sang PDF và LaTeX cho 29 mẫu bệnh án Phụ lục XXVIII.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(form_router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "medical-form-generator"}
