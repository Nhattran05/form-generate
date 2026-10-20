# Medical Form Studio — Chuyển Đổi JSON sang PDF & LaTeX (FastAPI + React)

Hệ thống ứng dụng **FastAPI + React (TypeScript, TailwindCSS)** giúp nhận dữ liệu bệnh án dạng **JSON**, hiển thị trực quan trên trang giấy **khổ A4 chuẩn Bộ Y tế** (theo **Thông tư 32/2023/TT-BYT — Phụ lục XXVIII** gồm 29 mẫu bệnh án từ `01/BV1` đến `29/BV1`) và xuất sang **PDF** hoặc mã nguồn **LaTeX (`.tex`)**.

---

## 1. Cấu Trúc Thư Mục Dễ Sửa & Dễ Di Chuyển (Portable Architecture)

```text
D:\Form Generating\
├── .gemini                                # Nhật ký theo dõi tiến độ dự án (Incremental Log)
├── shared-schemas/                        # 📦 [PORTABLE] Cấu hình 29 mẫu bệnh án & JSON mẫu
│   ├── registry.json                      # Danh mục 29 mẫu bệnh án (01/BV1 -> 29/BV1)
│   ├── templates/                         # Cấu hình lắp ghép các Section cho từng mẫu
│   └── samples/                           # Dữ liệu JSON mẫu điền sẵn để kiểm thử ngay
│
├── backend/                               # 🚀 FastAPI Server (PDF & LaTeX Engine)
│   ├── requirements.txt
│   └── app/
│       ├── main.py                        # FastAPI Entrypoint
│       ├── api/routes_form.py             # REST API: /templates, /render/pdf, /render/latex, /render/html
│       ├── schemas/form_payload.py        # Pydantic models
│       └── services/                      # 📦 [PORTABLE] Copy sang bất kỳ project Python nào
│           ├── html_builder.py            # Render JSON / React HTML -> Tài liệu HTML A4 độc lập
│           ├── pdf_renderer.py            # Kết xuất HTML -> PDF chuẩn A4 (Headless Edge/Chrome)
│           └── latex_builder.py           # Chuyển đổi JSON -> Mã nguồn LaTeX (.tex)
│
└── frontend/                              # 💻 React + Vite + TailwindCSS (Split-View Studio)
    └── src/
        ├── medical-forms/                 # ⭐ [PORTABLE CORE] Copy nguyên thư mục này sang app React khác
        │   ├── index.ts                   # Barrel export toàn bộ Primitives, Sections, Renderer
        │   ├── types/form.types.ts        # TypeScript interfaces
        │   ├── styles/a4-medical-print.css# CSS chuẩn trang in A4, dòng chấm, ô vuông mã số
        │   ├── primitives/                # Hạt nhân: A4Page, DottedField, CharBoxes, VitalsBox, SurgeryTable...
        │   ├── sections/                  # Khối dùng chung: Header, Hành chính, Quản lý NB, Chẩn đoán, Tổng kết...
        │   ├── renderer/                  # MedicalFormRenderer (Nhận Schema + JSON -> Render bệnh án)
        │   └── registry/                  # Nạp cấu hình 29 mẫu bệnh án
        └── workspace-ui/                  # Giao diện Split-View Studio (TopNavbar, JsonEditorPanel, PdfPreviewPanel)
```

---

## 2. Cách Thêm Mẫu Bệnh Án Mới (Không Cần Viết Lại Giao Diện)

Tất cả các mẫu bệnh án được lắp ghép từ bộ Component dùng chung trong `src/medical-forms/sections/`:
1. Tạo một file cấu hình JSON mới trong `shared-schemas/templates/<ten_mau>.json` (chọn `headerVariant`, `adminVariant`, `diagnosisVariant`, `organFields`...).
2. Khai báo thêm mục mới vào `shared-schemas/registry.json`.
3. `MedicalFormRenderer` sẽ tự động dựng giao diện chuẩn A4, hỗ trợ cả xuất PDF và xuất LaTeX `.tex`.

---

## 3. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Bước 1: Chạy Backend FastAPI (Port `8000`)
```powershell
cd "D:\Form Generating\backend"
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```
- Tài liệu Swagger API tự động tại: `http://127.0.0.1:8000/docs`

### Bước 2: Chạy Frontend React (Port `5173`)
```powershell
cd "D:\Form Generating\frontend"
npm install
npm run dev
```
- Mở trình duyệt tại: `http://localhost:5173`
