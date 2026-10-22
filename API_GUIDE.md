# Hướng Dẫn Tích Hợp REST API Xuất PDF Bệnh Án (Thông Tư 32/2023/TT-BYT)

Hệ thống cung cấp chuẩn REST API cho các hệ thống phần mềm quản lý bệnh viện (**HIS/EMR**), ứng dụng Web/Mobile hoặc phần mềm bên thứ 3 gửi dữ liệu bệnh án dạng **JSON** và nhận về file **PDF chuẩn A4** (hoặc chuỗi **Base64** / mã nguồn **LaTeX `.tex`**) cho toàn bộ **29 mẫu bệnh án** trong Phụ lục XXVIII.

> **Đặc điểm nổi bật**:
> - **Server không lưu trữ dữ liệu y tế dư thừa**: File PDF được biên dịch tạm thời trên server, truyền luồng về cho Client và **tự động xóa sạch ngay lập tức** sau khi phản hồi hoàn tất (`FastAPI BackgroundTasks`).
> - **Tự động nhận diện mẫu**: Client có thể gửi thẳng Raw JSON mà không cần cấu hình phức tạp.

---

## 1. Địa Chỉ Máy Chủ API

- **Base URL mặc định (Local)**: `http://127.0.0.1:8000/api/v1`
- **Swagger UI Interactive Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

---

## 2. Danh Sách Các Endpoints

### 2.1. Tra cứu danh mục & lấy JSON mẫu

#### A. Lấy danh sách toàn bộ 29 mẫu bệnh án
- **Endpoint**: `GET /api/v1/templates`
- **Mô tả**: Trả về danh sách 29 mẫu bệnh án kèm mã số (`01/BV1` -> `29/BV1`), tên chuyên khoa, nhóm layout.

#### B. Lấy cấu trúc JSON mẫu chuẩn điền sẵn
- **Endpoint**: `GET /api/v1/templates/{template_id}/sample`
- **Tham số `template_id`**: Có thể truyền ID (`01_noi_khoa`), mã biểu mẫu (`01/BV1`, `01-BV1`), hoặc số thứ tự (`01`).
- **Phản hồi**: Toàn bộ dữ liệu JSON mẫu đầy đủ các trường (Hành chính, Quản lý, Chẩn đoán, Bệnh án, Sinh hiệu, Tổng kết...) để Client dùng làm mẫu gửi lại ngay.

---

### 2.2. Xuất PDF từ JSON (Endpoints cốt lõi)

#### A. Endpoint tự động nhận diện mẫu: `POST /api/v1/pdf`
- **Headers**: `Content-Type: application/json`
- **Body**: Nhận trực tiếp Raw JSON bệnh án (hệ thống tự lấy `templateId` hoặc `header.maSo`) **HOẶC** nhận dạng bọc `{"template_id": "01_noi_khoa", "data": {...}}`.
- **Query Parameters**:
  - `format` *(tùy chọn, mặc định `pdf`)*:
    - `pdf`: Trả về luồng file binary `application/pdf`. File tạm trên server tự động bị xóa sau khi truyền xong.
    - `base64`: Trả về JSON chứa chuỗi `pdf_base64`.
    - `tex`: Trả về mã nguồn LaTeX thô (`.tex`).
  - `download` *(tùy chọn, mặc định `true`)*:
    - `true`: Header `Content-Disposition: attachment; filename="..."` (trình duyệt tự tải file về máy).
    - `false`: Header `Content-Disposition: inline` (xem trực tiếp trên trình duyệt).

#### B. Endpoint chỉ định mẫu trên URL: `POST /api/v1/pdf/{template_id}`
- **Ví dụ URL**:
  - `POST /api/v1/pdf/01_noi_khoa`
  - `POST /api/v1/pdf/02_nhi_khoa`
  - `POST /api/v1/pdf/10_ngoai_khoa`
  - `POST /api/v1/pdf/15_ngoai_tru`
  - `POST /api/v1/pdf/18_yhct_noi_tru`
- **Body**: Raw JSON bệnh án.
- **Phản hồi**: File PDF chuẩn khổ in A4.

---

## 3. Bảng Tra Cứu 29 Mẫu Bệnh Án (Phụ Lục XXVIII)

| STT | Mã Biểu Mẫu | ID (`template_id`) | Tên Mẫu Bệnh Án | Nhóm Chuyên Khoa |
| :---: | :---: | :--- | :--- | :--- |
| 1 | **01/BV1** | `01_noi_khoa` | BỆNH ÁN NỘI KHOA | Nội khoa |
| 2 | **02/BV1** | `02_nhi_khoa` | BỆNH ÁN NHI KHOA | Nhi khoa (có bố/mẹ, sinh trưởng) |
| 3 | **03/BV1** | `03_truyen_nhiem` | BỆNH ÁN TRUYỀN NHIỄM | Dịch tễ, lây nhiễm |
| 4 | **04/BV1** | `04_phu_khoa` | BỆNH ÁN PHỤ KHOA | Sản phụ khoa |
| 5 | **05/BV1** | `05_san_khoa` | BỆNH ÁN SẢN KHOA | Sản khoa |
| 6 | **06/BV1** | `06_so_sinh` | BỆNH ÁN SƠ SINH | Sơ sinh (Apgar, Silverman) |
| 7 | **07/BV1** | `07_tam_than` | BỆNH ÁN TÂM THẦN | Thần kinh & Tâm thần |
| 8 | **08/BV1** | `08_da_lieu` | BỆNH ÁN DA LIỄU | Da liễu, dị ứng |
| 9 | **09/BV1** | `09_huyet_hoc` | BỆNH ÁN HUYẾT HỌC - TRUYỀN MÁU | Huyết học, truyền máu |
| 10 | **10/BV1** | `10_ngoai_khoa` | BỆNH ÁN NGOẠI KHOA | Ngoại tổng hợp (trước/sau PT) |
| 11 | **11/BV1** | `11_bong` | BỆNH ÁN BỎNG | Bỏng |
| 12 | **12/BV1** | `12_ung_buou` | BỆNH ÁN UNG BƯỚU | Ung bướu (phân loại T-N-M) |
| 13 | **13/BV1** | `13_rang_ham_mat` | BỆNH ÁN RĂNG - HÀM - MẶT | Răng Hàm Mặt |
| 14 | **14/BV1** | `14_tai_mui_hong` | BỆNH ÁN TAI - MŨI - HỌNG | Tai Mũi Họng |
| 15 | **15/BV1** | `15_ngoai_tru` | BỆNH ÁN NGOẠI TRÚ | Ngoại trú chung (rút gọn 2 trang) |
| 16 | **16/BV1** | `16_ngoai_tru_rhm`| BỆNH ÁN NGOẠI TRÚ RĂNG HÀM MẶT | Ngoại trú RHM |
| 17 | **17/BV1** | `17_tuyen_xa` | BỆNH ÁN (DÙNG CHO TUYẾN XÃ/PHƯỜNG) | Trạm y tế xã, phường |
| 18 | **18/BV1** | `18_yhct_noi_tru` | BỆNH ÁN NỘI TRÚ Y HỌC CỔ TRUYỀN | YHCT (song song YHHĐ + Tứ chẩn) |
| 19 | **19/BV1** | `19_yhct_ngoai_tru`| BỆNH ÁN NGOẠI TRÚ YHCT | YHCT ngoại trú |
| 20 | **20/BV1** | `20_yhct_nhi` | BỆNH ÁN NỘI TRÚ NHI YHCT | YHCT Nhi khoa |
| 21 | **21/BV1** | `21_mat_chan_thuong`| BỆNH ÁN MẮT (Chấn thương) | Chuyên khoa Mắt |
| 22 | **22/BV1** | `22_mat_ban_phan_truoc`| BỆNH ÁN MẮT (Bán phần trước) | Chuyên khoa Mắt |
| 23 | **23/BV1** | `23_mat_day_mat` | BỆNH ÁN MẮT (Đáy mắt) | Chuyên khoa Mắt |
| 24 | **24/BV1** | `24_mat_glocom` | BỆNH ÁN MẮT (Glôcôm) | Chuyên khoa Mắt |
| 25 | **25/BV1** | `25_mat_lac` | BỆNH ÁN MẮT (Lác, sụp mi) | Chuyên khoa Mắt |
| 26 | **26/BV1** | `26_mat_tre_em` | BỆNH ÁN MẮT (Mắt trẻ em) | Chuyên khoa Mắt |
| 27 | **27/BV1** | `27_phcn` | BỆNH ÁN PHỤC HỒI CHỨC NĂNG | Phục hồi chức năng |
| 28 | **28/BV1** | `28_phcn_nhi` | BỆNH ÁN PHỤC HỒI CHỨC NĂNG NHI | PHCN Nhi khoa |
| 29 | **29/BV1** | `29_ngoai_tru_phcn`| BỆNH ÁN NGOẠI TRÚ PHCN | PHCN Ngoại trú |

---

## 4. Ví Dụ Gọi API Thực Tế

### 4.1. Sử dụng cURL (Command Line)

#### Lấy file PDF trực tiếp và lưu vào đĩa:
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/pdf/01_noi_khoa" \
     -H "Content-Type: application/json" \
     -d @benh_an_data.json \
     --output benh_an_01.pdf
```

#### Lấy JSON chứa Base64:
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/pdf?format=base64" \
     -H "Content-Type: application/json" \
     -d @benh_an_data.json
```

---

### 4.2. Sử dụng Python (`requests`)

```python
import requests

API_URL = "http://127.0.0.1:8000/api/v1"

# 1. Lấy dữ liệu mẫu từ server (hoặc chuẩn bị từ hệ thống HIS)
sample_data = requests.get(f"{API_URL}/templates/01_noi_khoa/sample").json()

# Chỉnh sửa thông tin bệnh nhân
sample_data["hanhChinh"]["hoVaTen"] = "TRẦN VĂN AN"
sample_data["hanhChinh"]["tuoi"] = "45"

# 2. Gửi request lấy file PDF
response = requests.post(
    f"{API_URL}/pdf/01_noi_khoa",
    json=sample_data,
    headers={"Content-Type": "application/json"}
)

if response.status_code == 200:
    output_filename = "benh_an_tran_van_an.pdf"
    with open(output_filename, "wb") as f:
        f.write(response.content)
    print(f"Xuất file PDF thành công: {output_filename}")
else:
    print(f"Lỗi {response.status_code}: {response.text}")
```

---

### 4.3. Sử dụng JavaScript / TypeScript (Node.js / Browser `fetch`)

```typescript
// Trong môi trường Node.js hoặc Browser
async function generateMedicalRecordPdf(jsonData: any) {
  const response = await fetch("http://127.0.0.1:8000/api/v1/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonData),
  });

  if (!response.ok) {
    throw new Error(`Lỗi xuất PDF: HTTP ${response.status}`);
  }

  // Nhận blob binary PDF
  const pdfBlob = await response.blob();
  
  // Tải file về máy (trong Browser)
  const downloadUrl = window.URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `benh_an_${jsonData.hanhChinh?.hoVaTen || "xuat"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
```

---

### 4.4. Hướng Dẫn Gọi API Trên Windows PowerShell & Khắc Phục Lỗi Cú Pháp

Khi gọi API từ PowerShell trên Windows, người dùng thường gặp các lỗi:
1. **Lỗi `ParserError: Missing expression after unary operator '--'`**: Do sao chép cú pháp ngắt dòng `^` của CMD sang PowerShell (trong PowerShell ký tự ngắt dòng là dấu backtick **`` ` ``**, không phải `^`).
2. **Lỗi font Tiếng Việt (`?`)**: Khi truyền chuỗi JSON trực tiếp qua `-d "..."` trên console PowerShell, bảng mã dễ bị lỗi thành `S? Y t? Hà N?i`.

#### Cách 1: Gửi qua file JSON lưu trên đĩa (Khuyên dùng - Chuẩn UTF-8 100%)
Lưu dữ liệu vào file (ví dụ `benh_an_data.json`), sau đó dùng `curl.exe`:
```powershell
curl.exe -X POST "http://127.0.0.1:8000/api/v1/pdf" `
  -H "Content-Type: application/json; charset=utf-8" `
  --data-binary "@benh_an_data.json" `
  -o "benh_an_xuat.pdf"
```

#### Cách 2: Sử dụng lệnh Native PowerShell (`Invoke-RestMethod`)
Không phụ thuộc vào `curl.exe`, tương thích 100% với PowerShell:
```powershell
$body = Get-Content -Raw -Encoding UTF8 benh_an_data.json
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/pdf" `
  -Method Post `
  -Body $body `
  -ContentType "application/json; charset=utf-8" `
  -OutFile "benh_an_xuat.pdf"
```

#### Bảng so sánh cú pháp ngắt dòng giữa các môi trường:
| Môi trường CLI | Ký tự ngắt dòng | Ví dụ lệnh gọi file |
| :--- | :---: | :--- |
| **PowerShell (Windows)** | **`` ` ``** (Backtick) | `curl.exe -X POST "..." --data-binary "@data.json" -o "out.pdf"` |
| **CMD (Command Prompt)** | **`^`** (Caret) | `curl -X POST "..." -d @data.json --output out.pdf` |
| **Bash / Linux / macOS** | **`\`** (Backslash) | `curl -X POST "..." -d @data.json -o out.pdf` |

---

### 4.5. Cơ Chế Gửi Dữ Liệu Rút Gọn (Partial / Minimal Payload)

Hệ thống được thiết kế theo cơ chế **Defensive Rendering**:
- **Không bắt buộc điền đủ 100% trường**: Chỉ cần gửi các thông tin hiện có (`templateId`, `header`, `hanhChinh`, `chanDoan`, ...).
- **Tự động điền dòng chấm in ấn**: Bất kỳ mục nào bị thiếu hoặc bỏ trống sẽ tự động được hệ thống vẽ dòng kẻ chấm (`\dotfillField`) hoặc ô trống theo đúng chuẩn bản in Bộ Y tế.
- **Trường địa chỉ (`diaChi`) linh hoạt**: Hỗ trợ cả dạng đối tượng chi tiết `{"soNha": "24", "thonPho": "Kim Mã", ...}` lẫn dạng chuỗi đơn giản `"24 Kim Mã, Ba Đình, Hà Nội"`.

#### Ví dụ Payload tối giản thực tế (Bệnh án Nhi khoa `02/BV1`):
```json
{
  "templateId": "02_nhi_khoa",
  "header": {
    "soYTe": "Sở Y tế Hà Nội",
    "benhVien": "Bệnh viện Nhi Trung ương",
    "khoa": "Khoa Hô hấp",
    "tenBenhAn": "BỆNH ÁN NHI KHOA",
    "maSo": "MS: 02/BV-01"
  },
  "hanhChinh": {
    "hoVaTen": "NGUYỄN MẠNH HÙNG",
    "tuoi": "3",
    "donViTuoi": "Tuổi",
    "gioi": 1,
    "hoTenBo": "Nguyễn Văn Tuấn",
    "dienThoaiNguoiNha": "0988123456"
  },
  "chanDoan": {
    "vaoKhoa": {
      "benhChinh": "Viêm phế quản phổi cấp",
      "maBenhChinh": "J18.0"
    }
  },
  "tinhTrangRaVien": {
    "ketQuaDieuTri": 2,
    "ngayRaVien": "22/10/2026"
  }
}
```

---

## 5. Cơ Chế Xóa File Tạm Trên Server

Khi Client gọi API:
1. Server tiếp nhận payload JSON và chuyển thành mã nguồn `.tex` chuẩn A4.
2. Trình biên dịch LaTeX (`xelatex` hoặc `pdflatex`) tạo ra file PDF trong thư mục tạm hệ thống (`%TEMP%` hoặc `/tmp`).
3. FastAPI mở luồng truyền file PDF về cho Client qua `FileResponse`.
4. Sau khi kết nối truyền file hoàn tất, FastAPI tự động kích hoạt **`BackgroundTasks`** để xóa file PDF tạm thời này khỏi ổ cứng server.
5. Server giữ nguyên trạng thái sạch sẽ, không tích tụ file rác và đảm bảo an toàn thông tin y tế của người bệnh.
