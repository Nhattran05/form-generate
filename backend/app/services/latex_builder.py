from typing import Any, Dict, List

from app.services.pain_record_latex import build_pain_record_latex


def _safe_dict(val: Any) -> Dict[str, Any]:
    return val if isinstance(val, dict) else {}


def _tex_escape(text: Any, allow_newlines: bool = False) -> str:
    if text is None:
        return ""
    s = str(text)
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    for k, v in replacements.items():
        s = s.replace(k, v)
    if allow_newlines:
        lines = [line.strip() for line in s.splitlines()]
        s = r" \newline ".join(line for line in lines if line)
    else:
        s = s.replace("\r", " ").replace("\n", " ")
    return s


def _char_boxes(value: Any, length: int) -> str:
    clean = (
        str(value or "")
        .replace("/", "")
        .replace("-", "")
        .replace(".", "")
        .replace(" ", "")
    )
    chars = list(clean[:length])
    while len(chars) < length:
        chars.append("")
    inner = r"\hspace{-\fboxrule}".join(f"\\charbox{{{_tex_escape(ch)}}}" for ch in chars)
    return f"\\mbox{{{inner}}}"


def _date_boxes(value: Any) -> str:
    digits = "".join(ch for ch in str(value or "") if ch.isdigit())
    dd = digits[0:2]
    mm = digits[2:4]
    yyyy = digits[4:8]
    return f"{_char_boxes(dd, 2)}\\hspace{{2pt}}{_char_boxes(mm, 2)}\\hspace{{2pt}}{_char_boxes(yyyy, 4)}"


def _bhyt_boxes(value: Any) -> str:
    clean = "".join(str(value or "").split())
    p1 = _tex_escape(clean[0:2])
    p2 = _tex_escape(clean[2:3])
    p3 = _tex_escape(clean[3:5])
    p4 = _tex_escape(clean[5:7])
    p5 = _tex_escape(clean[7:15])
    return (
        f"\\framebox[2.0em][c]{{\\strut\\textbf{{{p1}}}}}\\hspace{{-\\fboxrule}}"
        f"\\framebox[1.4em][c]{{\\strut\\textbf{{{p2}}}}}\\hspace{{-\\fboxrule}}"
        f"\\framebox[2.0em][c]{{\\strut\\textbf{{{p3}}}}}\\hspace{{-\\fboxrule}}"
        f"\\framebox[2.0em][c]{{\\strut\\textbf{{{p4}}}}}\\hspace{{-\\fboxrule}}"
        f"\\framebox[6.2em][c]{{\\strut\\textbf{{{p5}}}}}"
    )


def _chk(label: str, checked: bool) -> str:
    mark = "X" if checked else ""
    if not label:
        return f"\\checkbox{{{mark}}}"
    return f"\\mbox{{{_tex_escape(label)} \\checkbox{{{mark}}}}}"


def build_latex_from_json(template_config: Dict[str, Any], data: Dict[str, Any]) -> str:
    """
    Chuyển đổi dữ liệu JSON + Template Config sang mã nguồn LaTeX (.tex) chuẩn A4 Bộ Y tế.
    Căn chỉnh tỷ lệ chuẩn để Trang 1 chứa trọn vẹn Header + Mục I, II, III, IV + Chữ ký Giám đốc/Trưởng khoa.
    """
    cfg = _safe_dict(template_config.get("config"))
    header_variant = cfg.get("headerVariant", "standard")
    if header_variant == "pain_record" or template_config.get("id") == "30_benh_an_dau":
        return build_pain_record_latex(template_config, data)

    admin_variant = cfg.get("adminVariant", "adult")
    diag_variant = cfg.get("diagnosisVariant", "internal")
    summary_variant = cfg.get("summaryVariant", "internal")
    has_rel_table = bool(cfg.get("hasRelatedCharacteristicsTable", False))
    has_growth = bool(cfg.get("hasGrowthHistory", False))
    has_surgical_block = bool(cfg.get("hasSurgicalBlock", False))
    has_yhct = bool(cfg.get("hasTraditionalMedicine", False))

    header = _safe_dict(data.get("header"))
    hc = _safe_dict(data.get("hanhChinh"))
    ql = _safe_dict(data.get("quanLyNguoiBenh"))
    cd = _safe_dict(data.get("chanDoan"))
    ttrv = _safe_dict(data.get("tinhTrangRaVien"))
    ba = _safe_dict(data.get("benhAn"))
    tk = _safe_dict(data.get("tongKet"))

    title = _tex_escape(header.get("tenBenhAn") or template_config.get("title", "BỆNH ÁN"))
    ma_so = _tex_escape(header.get("maSo") or template_config.get("officialCode", "MS: 01/BV-01"))
    raw_dia_chi = hc.get("diaChi")
    if isinstance(raw_dia_chi, str):
        dia_chi: Dict[str, Any] = {"soNha": raw_dia_chi}
    else:
        dia_chi = _safe_dict(raw_dia_chi)
    hoi_benh = _safe_dict(ba.get("hoiBenh"))
    kham_benh = _safe_dict(ba.get("khamBenh"))
    sinh_hieu = _safe_dict(kham_benh.get("sinhHieu"))
    co_quan = _safe_dict(kham_benh.get("coQuan"))
    cd_khoa = _safe_dict(ba.get("chanDoanKhoa"))
    ho_so = _safe_dict(tk.get("hoSoPhimAnh"))

    preamble = rf"""% =====================================================================
% MẪU BỆNH ÁN BỘ Y TẾ (THÔNG TƯ 32/2023/TT-BYT - PHỤ LỤC XXVIII)
% Tự động sinh từ JSON bởi Medical Form Studio (FastAPI + React)
% =====================================================================
\documentclass[10pt,a4paper]{{article}}
\ifdefined\XeTeXversion
  \usepackage{{fontspec}}
  \setmainfont{{Times New Roman}}
\else
  \usepackage[utf8]{{inputenc}}
  \usepackage[vietnamese]{{babel}}
\fi
\usepackage[top=10mm,bottom=10mm,left=16mm,right=12mm]{{geometry}}
\usepackage{{array,tabularx,multirow}}
\pagestyle{{empty}}
\setlength{{\parindent}}{{0pt}}
\setlength{{\parskip}}{{1.5pt}}
\renewcommand{{\arraystretch}}{{1.15}}

\newcommand{{\dotfillField}}[1]{{\textbf{{#1}}\dotfill}}
\newcommand{{\charbox}}[1]{{\framebox[1.25em][c]{{\rule{{0pt}}{{2.1ex}}\textbf{{#1}}}}}}
\newcommand{{\checkbox}}[1]{{\framebox[1.1em][c]{{\rule{{0pt}}{{1.9ex}}\textbf{{#1}}}}}}

\begin{{document}}
"""

    # --------------------- TRƯỜNG HỢP 1: BỆNH ÁN NGOẠI TRÚ (15/BV1) ---------------------
    if header_variant == "outpatient":
        den_kham = hc.get("denKhamLuc", {})
        cd_rv_tk = tk.get("chanDoanRaVien", {})
        return (
            preamble
            + rf"""
\begin{{tabularx}}{{\textwidth}}{{p{{0.33\textwidth}} X p{{0.30\textwidth}}}}
Sở Y tế: \dotfillField{{{_tex_escape(header.get("soYTe"))}}} &
\centering \textbf{{\Large {title}}} &
{ma_so} \\
Bệnh viện: \dotfillField{{{_tex_escape(header.get("benhVien"))}}} &
\centering \textbf{{KHOA: {_tex_escape(header.get("khoa"))}}} &
Số ngoại trú: \dotfillField{{{_tex_escape(header.get("soNgoaiTru"))}}} \\
& & Số lưu trữ: \dotfillField{{{_tex_escape(header.get("soLuuTru"))}}}
\end{{tabularx}}

\vspace{{2pt}}
\textbf{{I. HÀNH CHÍNH:}} \hfill Tuổi\\[1pt]
1. Họ và tên \textit{{(In hoa)}}: \textbf{{{_tex_escape(hc.get("hoVaTen"))}}} \dotfill 2. Sinh ngày: {_date_boxes(hc.get("sinhNgay"))} \quad {_char_boxes(hc.get("tuoi"), 2)}\\[1pt]
3. Giới: {_chk("1. Nam", hc.get("gioi") == 1)} \quad {_chk("2. Nữ", hc.get("gioi") == 2)} \hfill 4. Nghề nghiệp: \dotfillField{{{_tex_escape(hc.get("ngheNghiep"))}}} {_char_boxes(hc.get("maNgheNghiep"), 2)}\\[1pt]
5. Dân tộc: \dotfillField{{{_tex_escape(hc.get("danToc"))}}} {_char_boxes(hc.get("maDanToc"), 2)} \hfill 6. Ngoại kiều: \dotfillField{{{_tex_escape(hc.get("ngoaiKieu"))}}} {_char_boxes(hc.get("maNgoaiKieu"), 2)}\\[1pt]
7. Địa chỉ: Số nhà: \textbf{{{_tex_escape(dia_chi.get("soNha"))}}} \quad Thôn, phố: \textbf{{{_tex_escape(dia_chi.get("thonPho"))}}} \quad Xã, phường: \textbf{{{_tex_escape(dia_chi.get("xaPhuong"))}}}\\[1pt]
Huyện (Q, Tx): \dotfillField{{{_tex_escape(dia_chi.get("huyenQuan"))}}} {_char_boxes(dia_chi.get("maHuyenQuan"), 2)} \hfill Tỉnh, thành phố: \dotfillField{{{_tex_escape(dia_chi.get("tinhThanhPho"))}}} {_char_boxes(dia_chi.get("maTinhThanhPho"), 2)}\\[1pt]
8. Nơi làm việc: \dotfillField{{{_tex_escape(hc.get("noiLamViec"))}}} \hfill 9. Đối tượng: {_chk("1.BHYT", hc.get("doiTuong") == 1)} {_chk("2.Thu phí", hc.get("doiTuong") == 2)} {_chk("3.Miễn", hc.get("doiTuong") == 3)} {_chk("4.Khác", hc.get("doiTuong") == 4)}\\[1pt]
10. BHYT giá trị đến ngày: \textbf{{{_tex_escape(hc.get("bhytGiaTriDen"))}}} \hfill Số thẻ BHYT: {_bhyt_boxes(hc.get("soTheBhyt"))}\\[1pt]
11. Họ tên, địa chỉ người nhà khi cần báo tin: \dotfillField{{{_tex_escape(hc.get("nguoiNha"))}}} \quad Điện thoại số: \textbf{{{_tex_escape(hc.get("dienThoaiNguoiNha"))}}}\\[1pt]
12. Đến khám bệnh lúc: \textbf{{{_tex_escape(den_kham.get("gio"))}}} giờ \textbf{{{_tex_escape(den_kham.get("phut"))}}} phút, ngày \textbf{{{_tex_escape(den_kham.get("ngay"))}}}\\[1pt]
13. Chẩn đoán của nơi giới thiệu: \dotfillField{{{_tex_escape(hc.get("chanDoanNoiGioiThieu"))}}} \quad {_chk("1. Y tế", hc.get("noiGioiThieu") == 1)} \quad {_chk("2. Tự đến", hc.get("noiGioiThieu") == 2)}

\vspace{{3pt}}
\textbf{{II. LÝ DO VÀO VIỆN:}} \dotfillField{{{_tex_escape(ba.get("lyDoVaoVien"))}}}\\[2pt]
\textbf{{III. HỎI BỆNH:}}\\[1pt]
\textbf{{1. Quá trình bệnh lý:}} {_tex_escape(hoi_benh.get("quaTrinhBenhLy"), True)}\dotfill\\[2pt]
\textbf{{2. Tiền sử bệnh:}}\\[1pt]
+ Bản thân: {_tex_escape(hoi_benh.get("tienSuBanThan"))}\dotfill\\[1pt]
+ Gia đình: {_tex_escape(hoi_benh.get("tienSuGiaDinh"))}\dotfill\\[3pt]

\textbf{{IV. KHÁM BỆNH:}}\\[1pt]
\begin{{tabularx}}{{\textwidth}}{{X | p{{0.28\textwidth}} |}}
\cline{{2-2}}
\textbf{{1. Toàn thân:}} {_tex_escape(kham_benh.get("toanThan"), True)} \newline
\textbf{{2. Các bộ phận:}} {_tex_escape(kham_benh.get("cacBoPhan"), True)} &
\textit{{Mạch:}} \textbf{{{_tex_escape(sinh_hieu.get("mach"))}}} lần/ph \newline
\textit{{Nhiệt độ:}} \textbf{{{_tex_escape(sinh_hieu.get("nhietDo"))}}} $^\circ$C \newline
\textit{{Huyết áp:}} \textbf{{{_tex_escape(sinh_hieu.get("huyetAp"))}}} mmHg \newline
\textit{{Nhịp thở:}} \textbf{{{_tex_escape(sinh_hieu.get("nhipTho"))}}} lần/ph \newline
\textit{{Cân nặng:}} \textbf{{{_tex_escape(sinh_hieu.get("canNang"))}}} kg \\
\cline{{2-2}}
\end{{tabularx}}

\vspace{{3pt}}
\textbf{{3. Tóm tắt kết quả cận lâm sàng:}} {_tex_escape(kham_benh.get("tomTatKetQuaCanLamSang"), True)}\dotfill\\[2pt]
\textbf{{4. Chẩn đoán ban đầu:}} {_tex_escape(kham_benh.get("chanDoanBanDau"))}\dotfill\\[2pt]
\textbf{{5. Đã xử lý (thuốc, chăm sóc):}} {_tex_escape(kham_benh.get("daXuLy"), True)}\dotfill\\[2pt]
\textbf{{6. Chẩn đoán khi ra viện:}} \dotfillField{{{_tex_escape(kham_benh.get("chanDoanKhiRaVien"))}}} \quad Mã: {_char_boxes(kham_benh.get("maChanDoanRaVien"), 4)}\\[2pt]
\textbf{{7. Điều trị ngoại trú từ ngày:}} \textbf{{{_tex_escape(kham_benh.get("dieuTriNgoaiTruTuNgay"))}}} đến ngày \textbf{{{_tex_escape(kham_benh.get("dieuTriNgoaiTruDenNgay"))}}}

\vspace{{8pt}}
\begin{{tabularx}}{{\textwidth}}{{X X}}
\centering \textbf{{Giám đốc bệnh viện}} \newline\vspace{{22pt}} Họ và tên: \textbf{{{_tex_escape(ba.get("giamDocBenhVien"))}}} &
\centering \textit{{Ngày {_tex_escape(ba.get("ngayLamBenhAn"))} tháng {_tex_escape(ba.get("thangLamBenhAn"))} năm {_tex_escape(ba.get("namLamBenhAn"))}}} \newline \textbf{{Bác sỹ khám bệnh}} \newline\vspace{{22pt}} Họ và tên: \textbf{{{_tex_escape(ba.get("bacSyKhamBenh"))}}}
\end{{tabularx}}

\newpage
\textbf{{\large TỔNG KẾT BỆNH ÁN:}}\\[4pt]
\begin{{tabularx}}{{\textwidth}}{{|p{{0.25\textwidth}}|c|X|X|}}
\hline
\multicolumn{{4}}{{|p{{0.96\textwidth}}|}}{{
\textbf{{1. Quá trình bệnh lý và diễn biến lâm sàng:}} \newline {_tex_escape(tk.get("quaTrinhBenhLyVaDienBien"), True)} \vspace{{5pt}}\newline
\textbf{{2. Tóm tắt kết quả xét nghiệm cận lâm sàng có giá trị chẩn đoán:}} \newline {_tex_escape(tk.get("tomTatKetQuaXetNghiem"), True)} \vspace{{5pt}}\newline
\textbf{{3. Chẩn đoán ra viện:}} \newline
- Bệnh chính: \textbf{{{_tex_escape(cd_rv_tk.get("benhChinh"))}}} \hfill Mã: {_char_boxes(cd_rv_tk.get("maBenhChinh"), 4)} \newline
- Bệnh kèm theo: \textbf{{{_tex_escape(cd_rv_tk.get("benhKemTheo"))}}} \hfill Mã: {_char_boxes(cd_rv_tk.get("maBenhKemTheo"), 4)} \vspace{{5pt}}\newline
\textbf{{4. Phương pháp điều trị:}} \newline {_tex_escape(tk.get("phuongPhapDieuTri"), True)} \vspace{{5pt}}\newline
\textbf{{5. Tình trạng người bệnh ra viện:}} \newline {_tex_escape(tk.get("tinhTrangRaVien"), True)} \vspace{{5pt}}\newline
\textbf{{6. Hướng điều trị và các chế độ tiếp theo:}} \newline {_tex_escape(tk.get("huongDieuTriTiep"), True)}
}} \\
\hline
\multicolumn{{2}}{{|c|}}{{\textbf{{Hồ sơ, phim, ảnh}}}} & \textbf{{Người giao hồ sơ:}} & \textit{{Ngày {_tex_escape(tk.get("ngayTongKet"))} tháng {_tex_escape(tk.get("thangTongKet"))} năm {_tex_escape(tk.get("namTongKet"))}}} \\
\cline{{1-2}}
\textbf{{Loại}} & \textbf{{Số tờ}} & Họ tên: {_tex_escape(tk.get("nguoiGiaoHoSo"))} & \textbf{{Bác sỹ điều trị}} \\
\cline{{1-3}}
- X - quang & {_tex_escape(ho_so.get("xQuang"))} & \textbf{{Người nhận hồ sơ:}} & \\
- CT Scanner & {_tex_escape(ho_so.get("ctScanner"))} & & \\
- Siêu âm & {_tex_escape(ho_so.get("sieuAm"))} & & \\
- Xét nghiệm & {_tex_escape(ho_so.get("xetNghiem"))} & & \\
- Khác: {_tex_escape(ho_so.get("khacLoai"))} & {_tex_escape(ho_so.get("khacSoTo"))} & & \\
- Toàn bộ hồ sơ & {_tex_escape(ho_so.get("toanBoHoSo"))} & Họ tên: {_tex_escape(tk.get("nguoiNhanHoSo"))} & Họ tên: \textbf{{{_tex_escape(tk.get("bacSyDieuTri"))}}} \\
\hline
\end{{tabularx}}
\end{{document}}
"""
        )

    # --------------------- TRƯỜNG HỢP 2: BỆNH ÁN NỘI TRÚ CHUẨN (NỘI, NHI, NGOẠI, YHCT...) ---------------------
    if admin_variant == "pediatric":
        admin_extra = rf"""
7. Họ tên bố: \dotfillField{{{_tex_escape(hc.get("hoTenBo"))}}} Trình độ VH: \textbf{{{_tex_escape(hc.get("trinhDoVHBo"))}}} \quad Họ tên mẹ: \dotfillField{{{_tex_escape(hc.get("hoTenMe"))}}} Trình độ VH: \textbf{{{_tex_escape(hc.get("trinhDoVHMe"))}}}\\[1pt]
Nghề nghiệp của bố: \dotfillField{{{_tex_escape(hc.get("ngheNghiepBo"))}}} \quad Nghề nghiệp của mẹ: \dotfillField{{{_tex_escape(hc.get("ngheNghiepMe"))}}}\\[1pt]
8. Đối tượng: {_chk("1.BHYT", hc.get("doiTuong") == 1)} \quad {_chk("2.Thu phí", hc.get("doiTuong") == 2)} \quad {_chk("3.Miễn", hc.get("doiTuong") == 3)} \quad {_chk("4.Khác", hc.get("doiTuong") == 4)}\\[1pt]
"""
    else:
        cccd_line = (
            rf"11. Số CCCD/Hộ chiếu: \dotfillField{{{_tex_escape(hc.get('soCCCD'))}}}\\[1pt]"
            if admin_variant == "yhct"
            else ""
        )
        admin_extra = rf"""
8. Nơi làm việc: \dotfillField{{{_tex_escape(hc.get("noiLamViec"))}}} \hfill 9. Đối tượng: {_chk("1.BHYT", hc.get("doiTuong") == 1)} {_chk("2.Thu phí", hc.get("doiTuong") == 2)} {_chk("3.Miễn", hc.get("doiTuong") == 3)} {_chk("4.Khác", hc.get("doiTuong") == 4)}\\[1pt]
{cccd_line}
"""

    vao_vien = ql.get("vaoVien", {})
    vao_khoa = ql.get("vaoKhoa", {})
    chuyen_khoa_list = ql.get("chuyenKhoa") or []
    ck_rows = list(chuyen_khoa_list[:3])
    while len(ck_rows) < 3:
        ck_rows.append({})

    vk_time = (
        f"{_tex_escape(vao_khoa.get('gio'))}h{_tex_escape(vao_khoa.get('phut'))} {_tex_escape(vao_khoa.get('ngay'))}"
        if vao_khoa.get("gio") or vao_khoa.get("ngay")
        else "....h.... ..../..../...."
    )

    ck_tex_lines = []
    for idx, ck in enumerate(ck_rows):
        lbl = "16. Chuyển" if idx == 0 else ("Khoa" if idx == 1 else "\\phantom{Khoa}")
        ck_t = (
            f"{_tex_escape(ck.get('gio'))}h{_tex_escape(ck.get('phut'))} {_tex_escape(ck.get('ngay'))}"
            if ck.get("gio") or ck.get("ngay")
            else "....h.... ..../..../...."
        )
        ck_tex_lines.append(
            f"\\makebox[5.5em][l]{{{lbl}}} \\framebox[6.4em][c]{{\\strut\\textbf{{{_tex_escape(ck.get('khoa'))}}}}} {ck_t} \\hfill {_char_boxes(ck.get('soNgayDT'), 2)}"
        )
    ck_tex_joined = " \\newline ".join(ck_tex_lines)

    # Xây dựng bảng III. CHẨN ĐOÁN
    ncd = cd.get("noiChuyenDen", {})
    kkb = cd.get("kkbCapCuu", {})
    vkh = cd.get("khiVaoKhoaDieuTri", {})
    rv = cd.get("raVien", {})

    if diag_variant == "yhct_dual":
        diag_tex = rf"""
\begin{{tabularx}}{{\textwidth}}{{|X|X|}}
\hline
\textbf{{CHẨN ĐOÁN THEO YHHĐ}} \hfill \textbf{{MÃ}} & \textbf{{CHẨN ĐOÁN THEO YHCT}} \hfill \textbf{{MÃ}} \\
\hline
21. Nơi chuyển đến: \textbf{{{_tex_escape(ncd.get("ten"))}}} \hfill {_char_boxes(ncd.get("ma"), 4)} \newline
22. KKB/Cấp cứu: \textbf{{{_tex_escape(kkb.get("ten"))}}} \hfill {_char_boxes(kkb.get("ma"), 4)} \newline
23. Vào khoa điều trị: \newline
- Bệnh chính: \textbf{{{_tex_escape(vkh.get("ten"))}}} \hfill {_char_boxes(vkh.get("ma"), 4)} \newline
- Bệnh kèm theo: \textbf{{{_tex_escape(vkh.get("benhKemTheo"))}}} \hfill {_char_boxes(vkh.get("maKemTheo"), 4)} \newline
{_chk("+ Thủ thuật", bool(cd.get("thuThuat")))} \quad {_chk("+ Phẫu thuật", bool(cd.get("phauThuat")))} \newline
24. Ra viện: \newline
- Bệnh chính: \textbf{{{_tex_escape(rv.get("benhChinh"))}}} \hfill {_char_boxes(rv.get("maBenhChinh"), 4)} \newline
- Bệnh kèm theo: \textbf{{{_tex_escape(rv.get("benhKemTheo"))}}} \hfill {_char_boxes(rv.get("maBenhKemTheo"), 4)} \newline
{_chk("+ Tai biến", bool(rv.get("taiBien")))} \quad {_chk("+ Biến chứng", bool(rv.get("bienChung")))}
&
25. Nơi chuyển đến: \textbf{{{_tex_escape(ncd.get("tenYHCT"))}}} \hfill {_char_boxes(ncd.get("maYHCT"), 4)} \newline
26. KKB/Cấp cứu: \textbf{{{_tex_escape(kkb.get("tenYHCT"))}}} \hfill {_char_boxes(kkb.get("maYHCT"), 4)} \newline
27. Vào khoa điều trị: \newline
- Bệnh chính: \textbf{{{_tex_escape(vkh.get("tenYHCT"))}}} \hfill {_char_boxes(vkh.get("maYHCT"), 4)} \newline
- Bệnh kèm theo: \textbf{{{_tex_escape(vkh.get("benhKemTheoYHCT"))}}} \hfill {_char_boxes(vkh.get("maKemTheoYHCT"), 4)} \newline
{_chk("+ Thủ thuật", bool(cd.get("thuThuat")))} \quad {_chk("+ Phẫu thuật", bool(cd.get("phauThuat")))} \newline
28. Ra viện: \newline
- Bệnh chính: \textbf{{{_tex_escape(rv.get("benhChinhYHCT"))}}} \hfill {_char_boxes(rv.get("maBenhChinhYHCT"), 4)} \newline
- Bệnh kèm theo: \textbf{{{_tex_escape(rv.get("benhKemTheoYHCT"))}}} \hfill {_char_boxes(rv.get("maBenhKemTheoYHCT"), 4)} \newline
{_chk("+ Tai biến", bool(rv.get("taiBien")))} \quad {_chk("+ Biến chứng", bool(rv.get("bienChung")))} \\
\hline
\end{{tabularx}}
"""
    elif diag_variant == "surgical":
        diag_tex = rf"""
\begin{{tabularx}}{{\textwidth}}{{|X|X|}}
\hline
20. Nơi chuyển đến: \textbf{{{_tex_escape(ncd.get("ten"))}}} \newline
\null\hfill {_char_boxes(ncd.get("ma"), 4)} \newline
21. KKB, Cấp cứu: \textbf{{{_tex_escape(kkb.get("ten"))}}} \newline
\null\hfill {_char_boxes(kkb.get("ma"), 4)} \newline
22. Khi vào khoa điều trị: \textbf{{{_tex_escape(vkh.get("ten"))}}} \newline
\null\hfill {_char_boxes(vkh.get("ma"), 4)} \newline
{_chk("- Tai biến", bool(rv.get("taiBien")))} \quad {_chk("- Biến chứng", bool(rv.get("bienChung")))} \newline
{_chk("1.Do PT", cd.get("taiBienBienChungNguyenNhan") == 1)} {_chk("2.Do gây mê", cd.get("taiBienBienChungNguyenNhan") == 2)} {_chk("3.Do NK", cd.get("taiBienBienChungNguyenNhan") == 3)} {_chk("4.Khác", cd.get("taiBienBienChungNguyenNhan") == 4)} \newline
23. Tổng số ngày ĐTr sau PT: \hfill {_char_boxes(cd.get("tongSoNgaySauPhauThuat"), 3)} \newline
24. Tổng số lần phẫu thuật: \hfill {_char_boxes(cd.get("tongSoLanPhauThuat"), 2)}
&
25. Ra viện: \newline
+ Bệnh chính (tổn thương): \textbf{{{_tex_escape(rv.get("benhChinh"))}}} \newline
\null\hfill {_char_boxes(rv.get("maBenhChinh"), 4)} \newline
(nguyên nhân): \textbf{{{_tex_escape(rv.get("nguyenNhan"))}}} \hfill {_char_boxes(rv.get("maNguyenNhan"), 4)} \newline
+ Bệnh kèm theo: \textbf{{{_tex_escape(rv.get("benhKemTheo"))}}} \newline
\null\hfill {_char_boxes(rv.get("maBenhKemTheo"), 4)} \newline
+ Chẩn đoán trước PT: \textbf{{{_tex_escape(rv.get("chanDoanTruocPhauThuat"))}}} \hfill {_char_boxes(rv.get("maTruocPhauThuat"), 4)} \newline
+ Chẩn đoán sau PT: \textbf{{{_tex_escape(rv.get("chanDoanSauPhauThuat"))}}} \hfill {_char_boxes(rv.get("maSauPhauThuat"), 4)} \\
\hline
\end{{tabularx}}
"""
    else:
        diag_tex = rf"""
\begin{{tabularx}}{{\textwidth}}{{|X|X|}}
\hline
20. Nơi chuyển đến: \textbf{{{_tex_escape(ncd.get("ten"))}}} \newline
\null\hfill {_char_boxes(ncd.get("ma"), 4)} \newline
21. KKB, Cấp cứu: \textbf{{{_tex_escape(kkb.get("ten"))}}} \newline
\null\hfill {_char_boxes(kkb.get("ma"), 4)} \newline
22. Khi vào khoa điều trị: \textbf{{{_tex_escape(vkh.get("ten"))}}} \newline
\null\hfill {_char_boxes(vkh.get("ma"), 4)} \newline
{_chk("+ Thủ thuật:", bool(cd.get("thuThuat")))} \hfill {_chk("+ Phẫu thuật:", bool(cd.get("phauThuat")))}
&
23. Ra viện: \newline
+ Bệnh chính: \textbf{{{_tex_escape(rv.get("benhChinh"))}}} \newline
\null\hfill {_char_boxes(rv.get("maBenhChinh"), 4)} \newline
+ Bệnh kèm theo: \textbf{{{_tex_escape(rv.get("benhKemTheo"))}}} \newline
\null\hfill {_char_boxes(rv.get("maBenhKemTheo"), 4)} \vspace{{4pt}}\newline
{_chk("+ Tai biến:", bool(rv.get("taiBien")))} \hfill {_chk("+ Biến chứng:", bool(rv.get("bienChung")))} \\
\hline
\end{{tabularx}}
"""

    # Bảng 6 đặc điểm liên quan bệnh
    rel_tex = ""
    if has_rel_table:
        dd = hoi_benh.get("dacDiemLienQuan", {})
        du = dd.get("diUng", {})
        mt = dd.get("maTuy", {})
        rb = dd.get("ruouBia", {})
        tla = dd.get("thuocLa", {})
        tlo = dd.get("thuocLao", {})
        kh = dd.get("khac", {})
        rel_tex = rf"""
\vspace{{2pt}}
Đặc điểm liên quan bệnh:\\[1pt]
\begin{{tabularx}}{{\textwidth}}{{|c|X|c|c|c|X|c|c|}}
\hline
\textbf{{TT}} & \textbf{{Ký hiệu}} & \textbf{{X}} & \textbf{{Thời gian (tháng)}} & \textbf{{TT}} & \textbf{{Ký hiệu}} & \textbf{{X}} & \textbf{{Thời gian (tháng)}} \\
\hline
01 & - Dị ứng & {"X" if du.get("checked") else ""} & {_tex_escape(du.get("thoiGian")) or "(dị nguyên)"} & 04 & - Thuốc lá & {"X" if tla.get("checked") else ""} & {_tex_escape(tla.get("thoiGian"))} \\
\hline
02 & - Ma tuý & {"X" if mt.get("checked") else ""} & {_tex_escape(mt.get("thoiGian"))} & 05 & - Thuốc lào & {"X" if tlo.get("checked") else ""} & {_tex_escape(tlo.get("thoiGian"))} \\
\hline
03 & - Rượu bia & {"X" if rb.get("checked") else ""} & {_tex_escape(rb.get("thoiGian"))} & 06 & - Khác & {"X" if kh.get("checked") else ""} & {_tex_escape(kh.get("thoiGian"))} \\
\hline
\end{{tabularx}}
\vspace{{2pt}}
"""

    # Quá trình sinh trưởng Nhi khoa
    growth_tex = ""
    if has_growth:
        st = hoi_benh.get("quaTrinhSinhTruong", {})
        tc_arr = st.get("daTiemChung") or []
        growth_tex = rf"""
\vspace{{2pt}}
\textbf{{3. Quá trình sinh trưởng:}}\\[1pt]
- Con thứ mấy: \textbf{{{_tex_escape(st.get("conThuMay"))}}} \quad - Tiền thai (Para): {_char_boxes(st.get("para"), 4)} \textit{{(Sinh đủ tháng, Sớm, Sẩy, Sống)}}\\[1pt]
- Tình trạng khi sinh: {_chk("1.Đẻ thường", st.get("tinhTrangKhiSinh") == 1)} {_chk("2.Forceps", st.get("tinhTrangKhiSinh") == 2)} {_chk("3.Giác hút", st.get("tinhTrangKhiSinh") == 3)} {_chk("4.Đẻ PT", st.get("tinhTrangKhiSinh") == 4)} {_chk("5.Đẻ chỉ huy", st.get("tinhTrangKhiSinh") == 5)} {_chk("6.Khác", st.get("tinhTrangKhiSinh") == 6)}\\[1pt]
- Cân nặng lúc sinh: \textbf{{{_tex_escape(st.get("canNangLucSinh"))}}} kg. \quad {_chk("Dị tật bẩm sinh", bool(st.get("diTatBamSinh")))} \quad Cụ thể: \textbf{{{_tex_escape(st.get("cuTheTatBamSinh"))}}}\\[1pt]
- Phát triển về tinh thần: \dotfillField{{{_tex_escape(st.get("phatTrienTinhThan"))}}}\\[1pt]
- Phát triển về vận động: \dotfillField{{{_tex_escape(st.get("phatTrienVanDong"))}}}\\[1pt]
- Các bệnh lý khác: \dotfillField{{{_tex_escape(st.get("cacBenhLyKhac"))}}}\\[1pt]
- Nuôi dưỡng: {_chk("1.Sữa mẹ", st.get("nuoiDuong") == 1)} {_chk("2.Nhân tạo", st.get("nuoiDuong") == 2)} {_chk("3.Hỗn hợp", st.get("nuoiDuong") == 3)} \quad - Cai sữa tháng thứ: \textbf{{{_tex_escape(st.get("caiSuaThangThu"))}}}\\[1pt]
- Đã tiêm chủng: {_chk("1.Lao", 1 in tc_arr)} {_chk("2.Bại liệt", 2 in tc_arr)} {_chk("3.Sởi", 3 in tc_arr)} {_chk("4.Ho gà", 4 in tc_arr)} {_chk("5.Uốn ván", 5 in tc_arr)} {_chk("6.Bạch hầu", 6 in tc_arr)}\\[1pt]
- Cụ thể những bệnh khác được tiêm chủng: \dotfillField{{{_tex_escape(st.get("tiemChungKhac"))}}}\\[2pt]
"""

    surgical_exam_tex = ""
    if has_surgical_block:
        surgical_exam_tex = rf"""
\textbf{{2. Bệnh ngoại khoa (chuyên khoa):}} {_tex_escape(kham_benh.get("benhNgoaiKhoa"), True)}\dotfill\\[3pt]
"""

    organ_fields: List[Dict[str, Any]] = cfg.get("organFields", [])
    organ_lines = []
    for org in organ_fields:
        k = org.get("key", "")
        lbl = _tex_escape(org.get("label", k))
        val = _tex_escape(co_quan.get(k, ""), True)
        organ_lines.append(f"\\textbf{{{lbl}:}} {val}\\dotfill\\\\[1pt]")
    organ_tex_block = "\n".join(organ_lines)

    yhct_tex = ""
    if has_yhct:
        yh = ba.get("yhct", {})
        cd_yh = yh.get("chanDoanYHCT", {})
        dt_yh = yh.get("dieuTriYHCT", {})
        yhct_tex = rf"""
\vspace{{3pt}}
\textbf{{\large B. Y HỌC CỔ TRUYỀN}}\\[2pt]
\textbf{{I. VỌNG CHẨN:}} {_tex_escape(yh.get("vongChan"), True)}\dotfill\\[2pt]
\textbf{{II. VĂN CHẨN:}} {_tex_escape(yh.get("vanChan"), True)}\dotfill\\[2pt]
\textbf{{III. VẤN CHẨN:}} {_tex_escape(yh.get("vanChanHoi"), True)}\dotfill\\[2pt]
\textbf{{IV. THIẾT CHẨN:}} {_tex_escape(yh.get("thietChan"), True)}\dotfill\\[2pt]
\textbf{{V. TÓM TẮT TỨ CHẨN:}} {_tex_escape(yh.get("tomTatTuChan"), True)}\dotfill\\[2pt]
\textbf{{VI. BIỆN CHỨNG LUẬN TRỊ:}} {_tex_escape(yh.get("bienChungLuanTri"), True)}\dotfill\\[2pt]
\textbf{{VII. CHẨN ĐOÁN YHCT:}}\\[1pt]
1. Bệnh danh: \dotfillField{{{_tex_escape(cd_yh.get("benhDanh"))}}}\\[1pt]
2. Bát cương: \dotfillField{{{_tex_escape(cd_yh.get("batCuong"))}}}\\[1pt]
3. Nguyên nhân: \dotfillField{{{_tex_escape(cd_yh.get("nguyenNhan"))}}}\\[1pt]
4. Tạng phủ: \dotfillField{{{_tex_escape(cd_yh.get("tangPhu"))}}} \quad 5. Kinh mạch: \dotfillField{{{_tex_escape(cd_yh.get("kinhMach"))}}}\\[1pt]
6. Định vị bệnh: \dotfillField{{{_tex_escape(cd_yh.get("dinhViBenh"))}}}\\[2pt]
\textbf{{C. ĐIỀU TRỊ YHCT:}}\\[1pt]
1. Pháp điều trị: \dotfillField{{{_tex_escape(dt_yh.get("phapDieuTri"))}}}\\[1pt]
2. Phương dược: {_tex_escape(dt_yh.get("phuongDuoc"), True)}\dotfill\\[1pt]
3. Phương pháp điều trị không dùng thuốc: {_tex_escape(dt_yh.get("khongDungThuoc"), True)}\dotfill\\[3pt]
"""

    # Bảng Phẫu thuật / Thủ thuật trong Tổng kết bệnh án
    pt_inline_tex = ""
    if summary_variant == "surgical":
        pt_rows = tk.get("phauThuatList") or []
        row_strs = []
        for r in pt_rows:
            row_strs.append(
                f"\\textbf{{{_tex_escape(r.get('gioNgay'))}}} — {_tex_escape(r.get('phuongPhapVoCam'))} (PTV: {_tex_escape(r.get('bacSyPhauThuat'))}, GM: {_tex_escape(r.get('bacSyGayMe'))})"
            )
        if row_strs:
            pt_inline_tex = (
                r"\vspace{4pt}\newline \textbf{+ Phẫu thuật / Thủ thuật:} \newline "
                + r" \newline ".join(row_strs)
            )

    tv = ttrv.get("tuVong", {})

    return (
        preamble
        + rf"""
% -------------------- TRANG 1: HÀNH CHÍNH - QUẢN LÝ - CHẨN ĐOÁN - TÌNH TRẠNG RA VIỆN --------------------
\begin{{tabularx}}{{\textwidth}}{{p{{0.33\textwidth}} X p{{0.30\textwidth}}}}
Sở Y tế: \dotfillField{{{_tex_escape(header.get("soYTe"))}}} &
\centering \textbf{{\Large {title}}} &
{ma_so} \\
Bệnh viện: \dotfillField{{{_tex_escape(header.get("benhVien"))}}} & &
Số lưu trữ: \dotfillField{{{_tex_escape(header.get("soLuuTru"))}}} \\
Khoa: \dotfillField{{{_tex_escape(header.get("khoa"))}}} Giường: \textbf{{{_tex_escape(header.get("giuong"))}}} & &
Mã YT: \dotfillField{{{_tex_escape(header.get("maYT"))}}}
\end{{tabularx}}

\vspace{{2pt}}
\textbf{{I. HÀNH CHÍNH:}} \hfill Tuổi\\[1pt]
1. Họ và tên \textit{{(In hoa)}}: \textbf{{{_tex_escape(hc.get("hoVaTen"))}}} \dotfill 2. Sinh ngày: {_date_boxes(hc.get("sinhNgay"))} \quad {_char_boxes(hc.get("tuoi"), 2)}\\[1.5pt]
3. Giới: {_chk("1. Nam", hc.get("gioi") == 1)} \quad {_chk("2. Nữ", hc.get("gioi") == 2)} \hfill 4. Nghề nghiệp: \dotfillField{{{_tex_escape(hc.get("ngheNghiep"))}}} {_char_boxes(hc.get("maNgheNghiep"), 2)}\\[1.5pt]
5. Dân tộc: \dotfillField{{{_tex_escape(hc.get("danToc"))}}} {_char_boxes(hc.get("maDanToc"), 2)} \hfill 6. Ngoại kiều: \dotfillField{{{_tex_escape(hc.get("ngoaiKieu"))}}} {_char_boxes(hc.get("maNgoaiKieu"), 2)}\\[1.5pt]
7. Địa chỉ: Số nhà: \textbf{{{_tex_escape(dia_chi.get("soNha"))}}} \quad Thôn, phố: \textbf{{{_tex_escape(dia_chi.get("thonPho"))}}} \quad Xã, phường: \textbf{{{_tex_escape(dia_chi.get("xaPhuong"))}}}\\[1.5pt]
Huyện (Q, Tx): \dotfillField{{{_tex_escape(dia_chi.get("huyenQuan"))}}} {_char_boxes(dia_chi.get("maHuyenQuan"), 2)} \hfill Tỉnh, thành phố: \dotfillField{{{_tex_escape(dia_chi.get("tinhThanhPho"))}}} {_char_boxes(dia_chi.get("maTinhThanhPho"), 2)}\\[1.5pt]
{admin_extra}
10. BHYT giá trị đến ngày: \textbf{{{_tex_escape(hc.get("bhytGiaTriDen"))}}} \hfill Số thẻ BHYT: {_bhyt_boxes(hc.get("soTheBhyt"))}\\[1.5pt]
11. Họ tên, địa chỉ người nhà khi cần báo tin: \dotfillField{{{_tex_escape(hc.get("nguoiNha"))}}} \quad Điện thoại số: \textbf{{{_tex_escape(hc.get("dienThoaiNguoiNha"))}}}

\vspace{{2pt}}
\textbf{{II. QUẢN LÝ NGƯỜI BỆNH:}}\\[1pt]
\begin{{tabularx}}{{\textwidth}}{{|X|X|}}
\hline
12. Vào viện: \textbf{{{_tex_escape(vao_vien.get("gio"))}}} giờ \textbf{{{_tex_escape(vao_vien.get("phut"))}}} ph, ngày \textbf{{{_tex_escape(vao_vien.get("ngay"))}}} \newline
13. Trực tiếp vào: {_chk("1.Cấp cứu", ql.get("trucTiepVao") == 1)} {_chk("2.KKB", ql.get("trucTiepVao") == 2)} {_chk("3.Khoa ĐTr", ql.get("trucTiepVao") == 3)}
&
14. Nơi giới thiệu: {_chk("1.CQ y tế", ql.get("noiGioiThieu") == 1)} {_chk("2.Tự đến", ql.get("noiGioiThieu") == 2)} {_chk("3.Khác", ql.get("noiGioiThieu") == 3)} \newline
- Vào viện do bệnh này lần thứ: {_char_boxes(ql.get("vaoVienLanThu"), 1)} \\
\hline
\makebox[5.5em][l]{{\textbf{{}}}}\makebox[6.4em][c]{{\textbf{{Khoa}}}} \textbf{{Giờ / Ngày}} \hfill \textbf{{Số ngày ĐTr}} \newline
\makebox[5.5em][l]{{15. Vào khoa}} \framebox[6.4em][c]{{\strut\textbf{{{_tex_escape(vao_khoa.get("khoa"))}}}}} {vk_time} \hfill {_char_boxes(vao_khoa.get("soNgayDT"), 2)} \newline
{ck_tex_joined}
&
17. Chuyển viện: {_chk("1.Tuyến trên", ql.get("chuyenVien", {}).get("loai") == 1)} {_chk("2.Tuyến dưới", ql.get("chuyenVien", {}).get("loai") == 2)} {_chk("3.CK", ql.get("chuyenVien", {}).get("loai") == 3)} \newline
- Chuyển đến: \dotfillField{{{_tex_escape(ql.get("chuyenVien", {}).get("chuyenDen"))}}} \newline
18. Ra viện: \textbf{{{_tex_escape(ql.get("raVien", {}).get("gio"))}}} giờ \textbf{{{_tex_escape(ql.get("raVien", {}).get("phut"))}}} ngày \textbf{{{_tex_escape(ql.get("raVien", {}).get("ngay"))}}} \newline
{_chk("1.Ra viện", ql.get("raVien", {}).get("hinhThuc") == 1)} {_chk("2.Xin về", ql.get("raVien", {}).get("hinhThuc") == 2)} {_chk("3.Bỏ về", ql.get("raVien", {}).get("hinhThuc") == 3)} {_chk("4.Đưa về", ql.get("raVien", {}).get("hinhThuc") == 4)} \newline
19. Tổng số ngày điều trị: \dotfillField{{{_tex_escape(ql.get("tongSoNgayDieuTri"))}}} {_char_boxes(ql.get("tongSoNgayDieuTri"), 3)} \\
\hline
\end{{tabularx}}

\vspace{{2pt}}
\begin{{tabularx}}{{\textwidth}}{{X r X r}}
\textbf{{III. CHẨN ĐOÁN}} & \textbf{{MÃ}} & & \textbf{{MÃ}}
\end{{tabularx}}\\[-2pt]
{diag_tex}

\vspace{{2pt}}
\textbf{{IV. TÌNH TRẠNG RA VIỆN:}}\\[1pt]
\begin{{tabularx}}{{\textwidth}}{{|p{{0.42\textwidth}}|X|}}
\hline
24. Kết quả điều trị: \newline
{_chk("1. Khỏi", ttrv.get("ketQuaDieuTri") == 1)} \hfill {_chk("4. Nặng hơn", ttrv.get("ketQuaDieuTri") == 4)} \newline
{_chk("2. Đỡ, giảm", ttrv.get("ketQuaDieuTri") == 2)} \hfill {_chk("5. Tử vong", ttrv.get("ketQuaDieuTri") == 5)} \newline
{_chk("3. Không thay đổi", ttrv.get("ketQuaDieuTri") == 3)} \vspace{{2pt}}\newline
25. Giải phẫu bệnh \textit{{(khi có sinh thiết)}}: \newline
{_chk("1. Lành tính", ttrv.get("giaiPhauBenh") == 1)} {_chk("2. Nghi ngờ", ttrv.get("giaiPhauBenh") == 2)} {_chk("3. Ác tính", ttrv.get("giaiPhauBenh") == 3)}
&
26. Tình hình tử vong: {_tex_escape(tv.get("gio")) or "...."} giờ {_tex_escape(tv.get("phut")) or "...."} ph, ngày {_tex_escape(tv.get("ngay")) or "..../..../........"} \newline
{_chk("1. Do bệnh", tv.get("nguyenNhan") == 1)} {_chk("2. Do tai biến ĐTr", tv.get("nguyenNhan") == 2)} {_chk("3. Khác", tv.get("nguyenNhan") == 3)} \newline
{_chk("1. Trong 24 giờ vào viện", tv.get("thoiGian") == 1)} {_chk("2. Sau 24 giờ vào viện", tv.get("thoiGian") == 2)} \newline
27. Nguyên nhân chính tử vong: \dotfillField{{{_tex_escape(tv.get("nguyenNhanChinh"))}}} {_char_boxes(tv.get("maNguyenNhanChinh"), 4)} \newline
28. Khám nghiệm tử thi: {_chk("", bool(tv.get("khamNghiemTuThi")))} \quad 29. CĐ GP tử thi: \dotfillField{{{_tex_escape(tv.get("chanDoanGiaiPhauTuThi"))}}} {_char_boxes(tv.get("maGiaiPhauTuThi"), 4)} \\
\hline
\end{{tabularx}}

\vspace{{4pt}}
\begin{{tabularx}}{{\textwidth}}{{X X}}
\centering \textbf{{Giám đốc bệnh viện}} \newline\vspace{{22pt}} Họ và tên: \textbf{{{_tex_escape(ttrv.get("giamDocBenhVien"))}}} &
\centering \textit{{Ngày {_tex_escape(ttrv.get("ngayKy"))} tháng {_tex_escape(ttrv.get("thangKy"))} năm {_tex_escape(ttrv.get("namKy"))}}} \newline \textbf{{Trưởng khoa}} \newline\vspace{{22pt}} Họ và tên: \textbf{{{_tex_escape(ttrv.get("truongKhoa"))}}}
\end{{tabularx}}

\newpage
% -------------------- TRANG 2: A. BỆNH ÁN --------------------
\textbf{{\large A- BỆNH ÁN}}\\[1pt]
\textbf{{I. Lý do vào viện:}} \dotfillField{{{_tex_escape(ba.get("lyDoVaoVien"))}}} \quad Vào ngày thứ: \textbf{{{_tex_escape(ba.get("vaoNgayThu"))}}} của bệnh\\[1pt]
\textbf{{II. Hỏi bệnh:}}\\[1pt]
\textbf{{1. Quá trình bệnh lý:}} \textit{{(khởi phát, diễn biến, chẩn đoán, điều trị của tuyến dưới v.v...)}}\\[0.5pt]
{_tex_escape(hoi_benh.get("quaTrinhBenhLy"), True)}\dotfill\\[1.5pt]
\textbf{{2. Tiền sử bệnh:}}\\[0.5pt]
+ Bản thân: \textit{{(phát triển thể lực từ nhỏ đến lớn, những bệnh đã mắc, phương pháp ĐTr, tiêm phòng, ăn uống, sinh hoạt...)}}\\[0.5pt]
{_tex_escape(hoi_benh.get("tienSuBanThan"), True)}\dotfill\\[1pt]
{rel_tex}
+ Gia đình: \textit{{(Những người trong gia đình: bệnh đã mắc, đời sống, tinh thần, vật chất v.v...)}}\\[0.5pt]
{_tex_escape(hoi_benh.get("tienSuGiaDinh"), True)}\dotfill\\[1.5pt]
{growth_tex}

\textbf{{III. Khám bệnh:}}\\[1pt]
\begin{{tabularx}}{{\textwidth}}{{X | p{{0.30\textwidth}} |}}
\cline{{2-2}}
\textbf{{1. Toàn thân:}} \textit{{(ý thức, da niêm mạc, hệ thống hạch, tuyến giáp...)}}\newline
{_tex_escape(kham_benh.get("toanThan"), True)} &
\textit{{Mạch:}} \textbf{{{_tex_escape(sinh_hieu.get("mach"))}}} lần/ph \newline
\textit{{Nhiệt độ:}} \textbf{{{_tex_escape(sinh_hieu.get("nhietDo"))}}} $^\circ$C \newline
\textit{{Huyết áp:}} \textbf{{{_tex_escape(sinh_hieu.get("huyetAp"))}}} mmHg \newline
\textit{{Nhịp thở:}} \textbf{{{_tex_escape(sinh_hieu.get("nhipTho"))}}} lần/ph \newline
\textit{{Cân nặng:}} \textbf{{{_tex_escape(sinh_hieu.get("canNang"))}}} kg \\
\cline{{2-2}}
\end{{tabularx}}

\vspace{{1.5pt}}
{surgical_exam_tex}
\textbf{{2. Các cơ quan:}}\\[1pt]
{organ_tex_block}

\textbf{{3. Các xét nghiệm cận lâm sàng cần làm:}} {_tex_escape(kham_benh.get("xetNghiemCanLam"), True)}\dotfill\\[1.5pt]
\textbf{{4. Tóm tắt bệnh án:}} {_tex_escape(kham_benh.get("tomTatBenhAn"), True)}\dotfill\\[1.5pt]
{yhct_tex}
\textbf{{IV. Chẩn đoán khi vào khoa điều trị:}}\\[0.5pt]
+ Bệnh chính: \dotfillField{{{_tex_escape(cd_khoa.get("benhChinh"))}}}\\[0.5pt]
+ Bệnh kèm theo \textit{{(nếu có)}}: \dotfillField{{{_tex_escape(cd_khoa.get("benhKemTheo"))}}}\\[0.5pt]
+ Phân biệt: \dotfillField{{{_tex_escape(cd_khoa.get("phanBiet"))}}}\\[1pt]
\textbf{{V. Tiên lượng:}} \dotfillField{{{_tex_escape(ba.get("tienLuong"))}}}\\[1pt]
\textbf{{VI. Hướng điều trị:}} \dotfillField{{{_tex_escape(ba.get("huongDieuTri"))}}}\\[2pt]

\hfill
\begin{{minipage}}{{0.45\textwidth}}
\centering
\textit{{Ngày {_tex_escape(ba.get("ngayLamBenhAn"))} tháng {_tex_escape(ba.get("thangLamBenhAn"))} năm {_tex_escape(ba.get("namLamBenhAn"))}}}\\
\textbf{{Bác sỹ làm bệnh án}}\\[12pt]
Họ và tên: \textbf{{{_tex_escape(ba.get("bacSyLamBenhAn"))}}}
\end{{minipage}}

\newpage
% -------------------- TRANG 3: B. TỔNG KẾT BỆNH ÁN --------------------
\textbf{{\large B. TỔNG KẾT BỆNH ÁN}}\\[4pt]
\begin{{tabularx}}{{\textwidth}}{{|p{{0.25\textwidth}}|c|X|X|}}
\hline
\multicolumn{{4}}{{|p{{0.96\textwidth}}|}}{{
\textbf{{1. Quá trình bệnh lý và diễn biến lâm sàng:}} \newline {_tex_escape(tk.get("quaTrinhBenhLyVaDienBien"), True)} \vspace{{6pt}}\newline
\textbf{{2. Tóm tắt kết quả xét nghiệm cận lâm sàng có giá trị chẩn đoán:}} \newline {_tex_escape(tk.get("tomTatKetQuaXetNghiem"), True)} \vspace{{6pt}}\newline
\textbf{{3. Phương pháp điều trị:}} \newline {_tex_escape(tk.get("phuongPhapDieuTri"), True)}{pt_inline_tex} \vspace{{6pt}}\newline
\textbf{{4. Tình trạng người bệnh ra viện:}} \newline {_tex_escape(tk.get("tinhTrangRaVien"), True)} \vspace{{6pt}}\newline
\textbf{{5. Hướng điều trị và các chế độ tiếp theo:}} \newline {_tex_escape(tk.get("huongDieuTriTiep"), True)}
}} \\
\hline
\multicolumn{{2}}{{|c|}}{{\textbf{{Hồ sơ, phim, ảnh}}}} & \textbf{{Người giao hồ sơ:}} & \textit{{Ngày {_tex_escape(tk.get("ngayTongKet"))} tháng {_tex_escape(tk.get("thangTongKet"))} năm {_tex_escape(tk.get("namTongKet"))}}} \\
\cline{{1-2}}
\textbf{{Loại}} & \textbf{{Số tờ}} & Họ tên: {_tex_escape(tk.get("nguoiGiaoHoSo"))} & \textbf{{Bác sỹ điều trị}} \\
\cline{{1-3}}
- X - quang & {_tex_escape(ho_so.get("xQuang"))} & \textbf{{Người nhận hồ sơ:}} & \\
- CT Scanner & {_tex_escape(ho_so.get("ctScanner"))} & & \\
- Siêu âm & {_tex_escape(ho_so.get("sieuAm"))} & & \\
- Xét nghiệm & {_tex_escape(ho_so.get("xetNghiem"))} & & \\
- Khác: {_tex_escape(ho_so.get("khacLoai"))} & {_tex_escape(ho_so.get("khacSoTo"))} & & \\
- Toàn bộ hồ sơ & {_tex_escape(ho_so.get("toanBoHoSo"))} & Họ tên: {_tex_escape(tk.get("nguoiNhanHoSo"))} & Họ tên: \textbf{{{_tex_escape(tk.get("bacSyDieuTri"))}}} \\
\hline
\end{{tabularx}}

\end{{document}}
"""
    )
