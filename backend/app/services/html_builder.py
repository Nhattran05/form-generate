import html
from typing import Any, Dict, List


A4_PRINT_STYLES = """
@page {
  size: A4 portrait;
  margin: 12mm 14mm 12mm 18mm;
}
* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
body {
  margin: 0;
  padding: 0;
  font-family: "Times New Roman", Times, serif;
  font-size: 12pt;
  line-height: 1.38;
  color: #000;
  background: #fff;
}
.a4-page {
  width: 100%;
  min-height: 268mm;
  padding: 0;
  margin: 0 auto;
  background: #fff;
  page-break-after: always;
  break-after: page;
  position: relative;
}
.a4-page:last-child {
  page-break-after: auto;
  break-after: auto;
}
.med-dotted-line {
  border-bottom: 1px dotted #222;
  display: inline-block;
  min-height: 1.2em;
  padding: 0 4px;
  font-weight: 500;
}
.med-char-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 20px;
  border: 1px solid #111;
  font-size: 11pt;
  font-weight: 600;
  margin-right: -1px;
  text-align: center;
  vertical-align: middle;
  background: #fff;
}
.med-check-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border: 1px solid #111;
  font-size: 10pt;
  font-weight: bold;
  vertical-align: middle;
  margin-left: 3px;
  margin-right: 8px;
}
.med-box-frame {
  border: 1px solid #111;
}
table.med-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5pt;
}
table.med-table th,
table.med-table td {
  border: 1px solid #111;
  padding: 4px 6px;
  vertical-align: top;
}
"""


def wrap_react_html_for_pdf(rendered_html: str, title: str = "Bệnh Án") -> str:
    """Bọc HTML từ React Component thành tài liệu HTML chuẩn in A4 độc lập."""
    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>{html.escape(title)}</title>
  <style>
    {A4_PRINT_STYLES}
    /* Hỗ trợ các utility class từ React Component */
    .print-page {{
      width: 100% !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      page-break-after: always;
      break-after: page;
    }}
    .print-page:last-child {{
      page-break-after: auto;
      break-after: auto;
    }}
  </style>
</head>
<body>
  {rendered_html}
</body>
</html>"""


def _esc(val: Any) -> str:
    if val is None:
        return ""
    return html.escape(str(val))


def _char_boxes(value: str, length: int) -> str:
    clean = str(value or "").replace("/", "").replace("-", "").replace(" ", "")
    chars = list(clean[:length])
    while len(chars) < length:
        chars.append("")
    return "".join(f'<span class="med-char-box">{_esc(ch)}</span>' for ch in chars)


def _check_item(label: str, checked: bool) -> str:
    mark = "X" if checked else ""
    return f'<span style="white-space:nowrap;margin-right:8px;">{_esc(label)} <span class="med-check-box">{mark}</span></span>'


def build_standalone_html_from_json(template_config: Dict[str, Any], data: Dict[str, Any]) -> str:
    """
    Hàm dự phòng ở Backend: Nếu client chỉ gửi JSON trực tiếp lên API FastAPI (không qua React),
    Backend tự động dựng HTML chuẩn A4 từ JSON và Template Config.
    """
    header = data.get("header", {})
    hc = data.get("hanhChinh", {})
    ql = data.get("quanLyNguoiBenh", {})
    cd = data.get("chanDoan", {})
    ttrv = data.get("tinhTrangRaVien", {})
    ba = data.get("benhAn", {})
    tk = data.get("tongKet", {})

    title = header.get("tenBenhAn") or template_config.get("title", "BỆNH ÁN")
    ma_so = header.get("maSo") or template_config.get("officialCode", "MS: 01/BV-01")
    dia_chi = hc.get("diaChi", {})
    vao_vien = ql.get("vaoVien", {})
    vao_khoa = ql.get("vaoKhoa", {})
    ra_vien_ql = ql.get("raVien", {})
    ra_vien_cd = cd.get("raVien", {})
    hoi_benh = ba.get("hoiBenh", {})
    kham_benh = ba.get("khamBenh", {})
    sinh_hieu = kham_benh.get("sinhHieu", {})
    co_quan = kham_benh.get("coQuan", {})
    cd_khoa = ba.get("chanDoanKhoa", {})
    ho_so = tk.get("hoSoPhimAnh", {})

    organ_fields: List[Dict[str, Any]] = template_config.get("config", {}).get("organFields", [])
    organ_rows = ""
    for org in organ_fields:
        k = org.get("key", "")
        lbl = org.get("label", k)
        val = co_quan.get(k, "")
        organ_rows += f"""
        <div style="margin-bottom:6px;">
          <strong>{_esc(lbl)}:</strong>
          <span class="med-dotted-line" style="width:100%;display:block;min-height:22px;">{_esc(val)}</span>
        </div>
        """

    body_html = f"""
    <div class="a4-page">
      <!-- HEADER -->
      <table style="width:100%;margin-bottom:8px;">
        <tr>
          <td style="width:32%;vertical-align:top;">
            <div>Sở Y tế: <span class="med-dotted-line">{_esc(header.get("soYTe"))}</span></div>
            <div>Bệnh viện: <span class="med-dotted-line">{_esc(header.get("benhVien"))}</span></div>
            <div>Khoa: <span class="med-dotted-line">{_esc(header.get("khoa"))}</span> Giường: <span class="med-dotted-line">{_esc(header.get("giuong"))}</span></div>
          </td>
          <td style="width:38%;text-align:center;vertical-align:middle;">
            <div style="font-size:16pt;font-weight:bold;text-transform:uppercase;">{_esc(title)}</div>
          </td>
          <td style="width:30%;vertical-align:top;">
            <div>{_esc(ma_so)}</div>
            <div>Số lưu trữ: <span class="med-dotted-line">{_esc(header.get("soLuuTru"))}</span></div>
            <div>Mã YT: <span class="med-dotted-line">{_esc(header.get("maYT"))}</span></div>
          </td>
        </tr>
      </table>

      <!-- I. HÀNH CHÍNH -->
      <div style="font-weight:bold;margin-top:4px;margin-bottom:4px;">I. HÀNH CHÍNH:</div>
      <div style="margin-bottom:4px;">
        1. Họ và tên (In hoa): <strong class="med-dotted-line" style="min-width:220px;">{_esc(hc.get("hoVaTen"))}</strong>
        &nbsp;&nbsp; 2. Sinh ngày: {_char_boxes(hc.get("sinhNgay", ""), 8)}
        &nbsp;&nbsp; Tuổi: {_char_boxes(hc.get("tuoi", ""), 2)}
      </div>
      <div style="margin-bottom:4px;">
        3. Giới: {_check_item("1. Nam", hc.get("gioi") == 1)} {_check_item("2. Nữ", hc.get("gioi") == 2)}
        &nbsp;&nbsp; 4. Nghề nghiệp: <span class="med-dotted-line" style="min-width:160px;">{_esc(hc.get("ngheNghiep"))}</span> {_char_boxes(hc.get("maNgheNghiep", ""), 2)}
      </div>
      <div style="margin-bottom:4px;">
        5. Dân tộc: <span class="med-dotted-line" style="min-width:140px;">{_esc(hc.get("danToc"))}</span> {_char_boxes(hc.get("maDanToc", ""), 2)}
        &nbsp;&nbsp; 6. Ngoại kiều: <span class="med-dotted-line" style="min-width:140px;">{_esc(hc.get("ngoaiKieu"))}</span> {_char_boxes(hc.get("maNgoaiKieu", ""), 2)}
      </div>
      <div style="margin-bottom:4px;">
        7. Địa chỉ: Số nhà <span class="med-dotted-line">{_esc(dia_chi.get("soNha"))}</span>
        Thôn, phố: <span class="med-dotted-line">{_esc(dia_chi.get("thonPho"))}</span>
        Xã, phường: <span class="med-dotted-line">{_esc(dia_chi.get("xaPhuong"))}</span>
      </div>
      <div style="margin-bottom:4px;">
        Huyện (Q, Tx): <span class="med-dotted-line" style="min-width:160px;">{_esc(dia_chi.get("huyenQuan"))}</span> {_char_boxes(dia_chi.get("maHuyenQuan", ""), 2)}
        &nbsp;&nbsp; Tỉnh, thành phố: <span class="med-dotted-line" style="min-width:160px;">{_esc(dia_chi.get("tinhThanhPho"))}</span> {_char_boxes(dia_chi.get("maTinhThanhPho", ""), 2)}
      </div>
      <div style="margin-bottom:4px;">
        8. Nơi làm việc: <span class="med-dotted-line" style="min-width:180px;">{_esc(hc.get("noiLamViec"))}</span>
        &nbsp;&nbsp; 9. Đối tượng:
        {_check_item("1.BHYT", hc.get("doiTuong") == 1)}
        {_check_item("2.Thu phí", hc.get("doiTuong") == 2)}
        {_check_item("3.Miễn", hc.get("doiTuong") == 3)}
        {_check_item("4.Khác", hc.get("doiTuong") == 4)}
      </div>
      <div style="margin-bottom:4px;">
        10. BHYT giá trị đến ngày: <span class="med-dotted-line">{_esc(hc.get("bhytGiaTriDen"))}</span>
        &nbsp;&nbsp; Số thẻ BHYT: {_char_boxes(hc.get("soTheBhyt", ""), 15)}
      </div>
      <div style="margin-bottom:8px;">
        11. Họ tên, địa chỉ người nhà khi cần báo tin: <span class="med-dotted-line">{_esc(hc.get("nguoiNha"))}</span>
        &nbsp;&nbsp; Điện thoại số: <span class="med-dotted-line">{_esc(hc.get("dienThoaiNguoiNha"))}</span>
      </div>

      <!-- II. QUẢN LÝ NGƯỜI BỆNH -->
      <div style="font-weight:bold;margin-bottom:4px;">II. QUẢN LÝ NGƯỜI BỆNH:</div>
      <table class="med-table" style="margin-bottom:8px;">
        <tr>
          <td style="width:50%;">
            <div>12. Vào viện: {_esc(vao_vien.get("gio"))} giờ {_esc(vao_vien.get("phut"))} ph, ngày {_esc(vao_vien.get("ngay"))}</div>
            <div style="margin-top:4px;">13. Trực tiếp vào:
              {_check_item("1.Cấp cứu", ql.get("trucTiepVao") == 1)}
              {_check_item("2.KKB", ql.get("trucTiepVao") == 2)}
              {_check_item("3.Khoa ĐTr", ql.get("trucTiepVao") == 3)}
            </div>
            <hr style="border:none;border-top:1px solid #111;margin:6px 0;" />
            <div>15. Vào khoa: <strong>{_esc(vao_khoa.get("khoa"))}</strong> lúc {_esc(vao_khoa.get("gio"))}h{_esc(vao_khoa.get("phut"))} ngày {_esc(vao_khoa.get("ngay"))} (Số ngày ĐTr: {_esc(vao_khoa.get("soNgayDT"))})</div>
          </td>
          <td style="width:50%;">
            <div>14. Nơi giới thiệu:
              {_check_item("1.Cơ quan y tế", ql.get("noiGioiThieu") == 1)}
              {_check_item("2.Tự đến", ql.get("noiGioiThieu") == 2)}
              {_check_item("3.Khác", ql.get("noiGioiThieu") == 3)}
            </div>
            <div>- Vào viện do bệnh này lần thứ: {_char_boxes(ql.get("vaoVienLanThu", ""), 1)}</div>
            <hr style="border:none;border-top:1px solid #111;margin:6px 0;" />
            <div>18. Ra viện: {_esc(ra_vien_ql.get("gio"))} giờ {_esc(ra_vien_ql.get("phut"))} ngày {_esc(ra_vien_ql.get("ngay"))}</div>
            <div>
              {_check_item("1.Ra viện", ra_vien_ql.get("hinhThuc") == 1)}
              {_check_item("2.Xin về", ra_vien_ql.get("hinhThuc") == 2)}
              {_check_item("3.Bỏ về", ra_vien_ql.get("hinhThuc") == 3)}
              {_check_item("4.Đưa về", ra_vien_ql.get("hinhThuc") == 4)}
            </div>
            <div>19. Tổng số ngày điều trị: <strong>{_esc(ql.get("tongSoNgayDieuTri"))}</strong></div>
          </td>
        </tr>
      </table>

      <!-- III. CHẨN ĐOÁN -->
      <div style="font-weight:bold;margin-bottom:4px;">III. CHẨN ĐOÁN:</div>
      <table class="med-table" style="margin-bottom:8px;">
        <tr>
          <td style="width:50%;">
            <div>20. Nơi chuyển đến: <span class="med-dotted-line">{_esc(cd.get("noiChuyenDen", {}).get("ten"))}</span></div>
            <div>Mã ICD: {_char_boxes(cd.get("noiChuyenDen", {}).get("ma", ""), 4)}</div>
            <div style="margin-top:4px;">21. KKB, Cấp cứu: <span class="med-dotted-line">{_esc(cd.get("kkbCapCuu", {}).get("ten"))}</span></div>
            <div>Mã ICD: {_char_boxes(cd.get("kkbCapCuu", {}).get("ma", ""), 4)}</div>
            <div style="margin-top:4px;">22. Khi vào khoa điều trị: <span class="med-dotted-line">{_esc(cd.get("khiVaoKhoaDieuTri", {}).get("ten"))}</span></div>
            <div>Mã ICD: {_char_boxes(cd.get("khiVaoKhoaDieuTri", {}).get("ma", ""), 4)}</div>
            <div style="margin-top:4px;">
              {_check_item("+ Thủ thuật", bool(cd.get("thuThuat")))}
              {_check_item("+ Phẫu thuật", bool(cd.get("phauThuat")))}
            </div>
          </td>
          <td style="width:50%;">
            <div>23. Ra viện:</div>
            <div>+ Bệnh chính: <span class="med-dotted-line">{_esc(ra_vien_cd.get("benhChinh"))}</span></div>
            <div>Mã ICD: {_char_boxes(ra_vien_cd.get("maBenhChinh", ""), 4)}</div>
            <div style="margin-top:4px;">+ Bệnh kèm theo: <span class="med-dotted-line">{_esc(ra_vien_cd.get("benhKemTheo"))}</span></div>
            <div>Mã ICD: {_char_boxes(ra_vien_cd.get("maBenhKemTheo", ""), 4)}</div>
            <div style="margin-top:4px;">
              {_check_item("+ Tai biến", bool(ra_vien_cd.get("taiBien")))}
              {_check_item("+ Biến chứng", bool(ra_vien_cd.get("bienChung")))}
            </div>
          </td>
        </tr>
      </table>

      <!-- IV. TÌNH TRẠNG RA VIỆN -->
      <div style="font-weight:bold;margin-bottom:4px;">IV. TÌNH TRẠNG RA VIỆN:</div>
      <table class="med-table" style="margin-bottom:14px;">
        <tr>
          <td style="width:45%;">
            <div>24. Kết quả điều trị:</div>
            <div>
              {_check_item("1. Khỏi", ttrv.get("ketQuaDieuTri") == 1)}
              {_check_item("2. Đỡ, giảm", ttrv.get("ketQuaDieuTri") == 2)}
              {_check_item("3. Không thay đổi", ttrv.get("ketQuaDieuTri") == 3)}
              {_check_item("4. Nặng hơn", ttrv.get("ketQuaDieuTri") == 4)}
              {_check_item("5. Tử vong", ttrv.get("ketQuaDieuTri") == 5)}
            </div>
            <div style="margin-top:6px;">25. Giải phẫu bệnh (khi có sinh thiết):</div>
            <div>
              {_check_item("1. Lành tính", ttrv.get("giaiPhauBenh") == 1)}
              {_check_item("2. Nghi ngờ", ttrv.get("giaiPhauBenh") == 2)}
              {_check_item("3. Ác tính", ttrv.get("giaiPhauBenh") == 3)}
            </div>
          </td>
          <td style="width:55%;">
            <div>26. Tình hình tử vong: {_esc(ttrv.get("tuVong", {}).get("gio"))} giờ {_esc(ttrv.get("tuVong", {}).get("phut"))} ph ngày {_esc(ttrv.get("tuVong", {}).get("ngay"))}</div>
            <div>27. Nguyên nhân chính tử vong: <span class="med-dotted-line">{_esc(ttrv.get("tuVong", {}).get("nguyenNhanChinh"))}</span></div>
            <div>28. Khám nghiệm tử thi: {_check_item("", bool(ttrv.get("tuVong", {}).get("khamNghiemTuThi")))} 29. Chẩn đoán giải phẫu tử thi: <span class="med-dotted-line">{_esc(ttrv.get("tuVong", {}).get("chanDoanGiaiPhauTuThi"))}</span></div>
          </td>
        </tr>
      </table>

      <table style="width:100%;text-align:center;margin-top:8px;">
        <tr>
          <td style="width:50%;">
            <div style="font-weight:bold;margin-top:18px;">Giám đốc bệnh viện</div>
            <div style="margin-top:42px;">Họ và tên: <span class="med-dotted-line">{_esc(ttrv.get("giamDocBenhVien"))}</span></div>
          </td>
          <td style="width:50%;">
            <div style="font-style:italic;">Ngày {_esc(ttrv.get("ngayKy"))} tháng {_esc(ttrv.get("thangKy"))} năm {_esc(ttrv.get("namKy"))}</div>
            <div style="font-weight:bold;">Trưởng khoa</div>
            <div style="margin-top:42px;">Họ và tên: <span class="med-dotted-line">{_esc(ttrv.get("truongKhoa"))}</span></div>
          </td>
        </tr>
      </table>
    </div>

    <!-- TRANG 2: A. BỆNH ÁN & B. TỔNG KẾT -->
    <div class="a4-page">
      <div style="font-weight:bold;font-size:13pt;margin-bottom:6px;">A- BỆNH ÁN</div>
      <div style="margin-bottom:6px;">
        <strong>I. Lý do vào viện:</strong> <span class="med-dotted-line" style="min-width:340px;">{_esc(ba.get("lyDoVaoVien"))}</span>
        &nbsp;&nbsp; Vào ngày thứ: <span class="med-dotted-line">{_esc(ba.get("vaoNgayThu"))}</span> của bệnh
      </div>
      <div style="font-weight:bold;margin-bottom:4px;">II. Hỏi bệnh:</div>
      <div style="margin-bottom:6px;">
        <strong>1. Quá trình bệnh lý:</strong>
        <div class="med-dotted-line" style="width:100%;display:block;">{_esc(hoi_benh.get("quaTrinhBenhLy"))}</div>
      </div>
      <div style="margin-bottom:6px;">
        <strong>2. Tiền sử bệnh:</strong>
        <div>+ Bản thân: <span class="med-dotted-line">{_esc(hoi_benh.get("tienSuBanThan"))}</span></div>
        <div>+ Gia đình: <span class="med-dotted-line">{_esc(hoi_benh.get("tienSuGiaDinh"))}</span></div>
      </div>

      <div style="font-weight:bold;margin-bottom:4px;">III. Khám bệnh:</div>
      <table style="width:100%;margin-bottom:8px;">
        <tr>
          <td style="width:68%;vertical-align:top;padding-right:10px;">
            <strong>1. Toàn thân:</strong>
            <div class="med-dotted-line" style="width:100%;display:block;white-space:pre-line;">{_esc(kham_benh.get("toanThan"))}</div>
          </td>
          <td style="width:32%;vertical-align:top;border:1px solid #111;padding:6px;font-style:italic;">
            <div>Mạch: <strong>{_esc(sinh_hieu.get("mach"))}</strong> lần/ph</div>
            <div>Nhiệt độ: <strong>{_esc(sinh_hieu.get("nhietDo"))}</strong> °C</div>
            <div>Huyết áp: <strong>{_esc(sinh_hieu.get("huyetAp"))}</strong> mmHg</div>
            <div>Nhịp thở: <strong>{_esc(sinh_hieu.get("nhipTho"))}</strong> lần/ph</div>
            <div>Cân nặng: <strong>{_esc(sinh_hieu.get("canNang"))}</strong> kg</div>
          </td>
        </tr>
      </table>

      <div style="font-weight:bold;margin-bottom:4px;">2. Các cơ quan:</div>
      {organ_rows}

      <div style="margin-top:6px;">
        <strong>3. Các xét nghiệm cận lâm sàng cần làm:</strong>
        <div class="med-dotted-line" style="width:100%;display:block;white-space:pre-line;">{_esc(kham_benh.get("xetNghiemCanLam"))}</div>
      </div>
      <div style="margin-top:6px;">
        <strong>4. Tóm tắt bệnh án:</strong>
        <div class="med-dotted-line" style="width:100%;display:block;white-space:pre-line;">{_esc(kham_benh.get("tomTatBenhAn"))}</div>
      </div>

      <div style="margin-top:8px;">
        <strong>IV. Chẩn đoán khi vào khoa điều trị:</strong>
        <div>+ Bệnh chính: <span class="med-dotted-line">{_esc(cd_khoa.get("benhChinh"))}</span></div>
        <div>+ Bệnh kèm theo (nếu có): <span class="med-dotted-line">{_esc(cd_khoa.get("benhKemTheo"))}</span></div>
        <div>+ Phân biệt: <span class="med-dotted-line">{_esc(cd_khoa.get("phanBiet"))}</span></div>
      </div>
      <div style="margin-top:4px;"><strong>V. Tiên lượng:</strong> <span class="med-dotted-line">{_esc(ba.get("tienLuong"))}</span></div>
      <div style="margin-top:4px;"><strong>VI. Hướng điều trị:</strong> <span class="med-dotted-line">{_esc(ba.get("huongDieuTri"))}</span></div>

      <div style="text-align:right;margin-top:12px;">
        <div style="font-style:italic;">Ngày {_esc(ba.get("ngayLamBenhAn"))} tháng {_esc(ba.get("thangLamBenhAn"))} năm {_esc(ba.get("namLamBenhAn"))}</div>
        <div style="font-weight:bold;">Bác sỹ làm bệnh án</div>
        <div style="margin-top:32px;">Họ và tên: <span class="med-dotted-line">{_esc(ba.get("bacSyLamBenhAn"))}</span></div>
      </div>
    </div>

    <!-- TRANG 3: B. TỔNG KẾT BỆNH ÁN -->
    <div class="a4-page">
      <div style="font-weight:bold;font-size:13pt;margin-bottom:6px;">B. TỔNG KẾT BỆNH ÁN</div>
      <table class="med-table">
        <tr>
          <td colspan="4">
            <div><strong>1. Quá trình bệnh lý và diễn biến lâm sàng:</strong></div>
            <div style="margin-bottom:8px;white-space:pre-line;">{_esc(tk.get("quaTrinhBenhLyVaDienBien"))}</div>
            <div><strong>2. Tóm tắt kết quả xét nghiệm cận lâm sàng có giá trị chẩn đoán:</strong></div>
            <div style="margin-bottom:8px;white-space:pre-line;">{_esc(tk.get("tomTatKetQuaXetNghiem"))}</div>
            <div><strong>3. Phương pháp điều trị:</strong></div>
            <div style="margin-bottom:8px;white-space:pre-line;">{_esc(tk.get("phuongPhapDieuTri"))}</div>
            <div><strong>4. Tình trạng người bệnh ra viện:</strong></div>
            <div style="margin-bottom:8px;white-space:pre-line;">{_esc(tk.get("tinhTrangRaVien"))}</div>
            <div><strong>5. Hướng điều trị và các chế độ tiếp theo:</strong></div>
            <div style="margin-bottom:8px;white-space:pre-line;">{_esc(tk.get("huongDieuTriTiep"))}</div>
          </td>
        </tr>
        <tr>
          <th colspan="2" style="width:42%;">Hồ sơ, phim, ảnh</th>
          <td rowspan="4" style="width:28%;">
            <div style="text-align:center;font-weight:bold;">Người giao hồ sơ:</div>
            <div style="margin-top:36px;">Họ tên: {_esc(tk.get("nguoiGiaoHoSo"))}</div>
          </td>
          <td rowspan="8" style="width:30%;text-align:center;">
            <div style="font-style:italic;">Ngày {_esc(tk.get("ngayTongKet"))} tháng {_esc(tk.get("thangTongKet"))} năm {_esc(tk.get("namTongKet"))}</div>
            <div style="font-weight:bold;margin-top:4px;">Bác sỹ điều trị</div>
            <div style="margin-top:90px;text-align:left;">Họ tên: {_esc(tk.get("bacSyDieuTri"))}</div>
          </td>
        </tr>
        <tr>
          <th>Loại</th>
          <th style="width:12%;text-align:center;">Số tờ</th>
        </tr>
        <tr><td>- X - quang</td><td style="text-align:center;">{_esc(ho_so.get("xQuang"))}</td></tr>
        <tr><td>- CT Scanner</td><td style="text-align:center;">{_esc(ho_so.get("ctScanner"))}</td></tr>
        <tr>
          <td>- Siêu âm</td>
          <td style="text-align:center;">{_esc(ho_so.get("sieuAm"))}</td>
          <td rowspan="4">
            <div style="text-align:center;font-weight:bold;">Người nhận hồ sơ:</div>
            <div style="margin-top:36px;">Họ tên: {_esc(tk.get("nguoiNhanHoSo"))}</div>
          </td>
        </tr>
        <tr><td>- Xét nghiệm</td><td style="text-align:center;">{_esc(ho_so.get("xetNghiem"))}</td></tr>
        <tr><td>- Khác: {_esc(ho_so.get("khacLoai"))}</td><td style="text-align:center;">{_esc(ho_so.get("khacSoTo"))}</td></tr>
        <tr><td>- Toàn bộ hồ sơ</td><td style="text-align:center;">{_esc(ho_so.get("toanBoHoSo"))}</td></tr>
      </table>
    </div>
    """

    return wrap_react_html_for_pdf(body_html, title=title)
