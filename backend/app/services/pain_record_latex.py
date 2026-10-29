from typing import Any, Dict, List


def _tex_esc(text: Any) -> str:
    if text is None:
        return ""
    s = str(text).strip()
    if s == "N/A":
        return ""
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
    return s.replace("\r", " ").replace("\n", " ")


def _safe_dict(val: Any) -> Dict[str, Any]:
    return val if isinstance(val, dict) else {}


def _chk(checked: Any) -> str:
    mark = "X" if checked else r"\phantom{X}"
    return rf"\framebox[1.05em][c]{{\rule{{0pt}}{{1.7ex}}\textbf{{{mark}}}}}"


def _dot_val(val: Any) -> str:
    escaped = _tex_esc(val)
    if escaped:
        return rf"\textbf{{{escaped}}}\dotfill"
    return r"\dotfill"


def _page_footer(doc_code: str, page_num: int, total_pages: int = 19) -> str:
    esc_code = _tex_esc(doc_code or "VM - BS - V1 - 012")
    return rf"""
\vfill
\noindent\rule{{\textwidth}}{{0.4pt}}\\[-2pt]
\footnotesize \textcolor{{gray}}{{{esc_code}}} \hfill \textcolor{{gray}}{{Trang {page_num} / Page {total_pages}}}\\[4pt]
\centering \normalsize {page_num}
\par\raggedright
"""


def build_pain_record_latex(template_config: Dict[str, Any], data: Dict[str, Any]) -> str:
    """
    Biên dịch JSON mẫu 30_benh_an_dau (BỆNH ÁN ĐAU TOÀN DIỆN - 19 trang song ngữ Việt/Anh)
    sang mã nguồn LaTeX (.tex) với đúng thứ tự 5 ảnh trong thư mục images/.
    """
    cfg = _safe_dict(template_config.get("config"))
    doc_code = str(cfg.get("documentCode") or data.get("header", {}).get("maSo") or "VM - BS - V1 - 012")

    header = _safe_dict(data.get("header"))
    hc = _safe_dict(data.get("hanhChinh"))
    ts = _safe_dict(data.get("tienSuBenh"))
    bsd = _safe_dict(data.get("benhSuDau"))
    khoi_phat = _safe_dict(bsd.get("khoiPhat"))
    mieu_ta = _safe_dict(bsd.get("mieuTaConDau"))
    cuong_do = _safe_dict(bsd.get("cuongDoDau"))
    yeu_to_tang = _safe_dict(bsd.get("yeuToTangDau"))
    cs = _safe_dict(data.get("cuocSongHangNgay"))
    vas = _safe_dict(data.get("doCuongDoDauVas"))
    likert = _safe_dict(data.get("bangDanhGiaDau"))
    bs_dien_p6 = _safe_dict(likert.get("bacSyDien"))
    dt_sd = _safe_dict(data.get("dienTienVaSoDo"))
    dn4 = _safe_dict(data.get("cauHoiDn4"))
    buda = _safe_dict(data.get("tieuChuanBudapest"))
    bdi = _safe_dict(data.get("thangTramCamBeck"))
    kham_cg = _safe_dict(data.get("khamCamGiacBacSy"))
    qs_dt = _safe_dict(data.get("quanSatVaDieuTri"))
    th_kq = _safe_dict(data.get("tongHopKetQua"))
    yt_cn = _safe_dict(th_kq.get("yeuToCanNguyen"))
    dt_xl = _safe_dict(data.get("dieuTriXamLan"))
    cam_ket = _safe_dict(dt_xl.get("camKet"))
    cd_dh = _safe_dict(data.get("chanDoanDinhHuong"))
    nb_dh = _safe_dict(cd_dh.get("ngoaiBien"))
    tu_dh = _safe_dict(cd_dh.get("trungUong"))
    td = _safe_dict(data.get("theoDoi"))

    # Đường dẫn 5 ảnh theo đúng thứ tự trong template
    img_p1_logo = _tex_esc(header.get("logoPath") or "images/logo.jpg")
    img_p7_bodymap = _tex_esc(dt_sd.get("bodyMapImage") or "images/body_map_clean.png")
    img_p12_ant_post = _tex_esc(
        kham_cg.get("anhToanThanTruocSau") or "images/full_body_sensory_anterior_posterior.png"
    )
    img_p13_lateral = _tex_esc(
        kham_cg.get("anhToanThanNghieng") or "images/full_body_sensory_lateral.png"
    )
    img_p14_focal = _tex_esc(kham_cg.get("anhCucBo") or "images/physician_focal_clean.png")

    dia_chi_raw = hc.get("diaChi", "")
    if isinstance(dia_chi_raw, dict):
        parts = [
            dia_chi_raw.get("soNha"),
            dia_chi_raw.get("thonPho"),
            dia_chi_raw.get("xaPhuong"),
            dia_chi_raw.get("huyenQuan"),
            dia_chi_raw.get("tinhThanhPho"),
        ]
        dia_chi_str = ", ".join(str(x) for x in parts if x)
    else:
        dia_chi_str = str(dia_chi_raw or "")

    gioi_str = hc.get("gioiTinh") or ("Nam / Male" if hc.get("gioi") == 1 else ("Nữ / Female" if hc.get("gioi") == 2 else ""))

    # Helper cho trang 4 (Daily life)
    def _cs_row(key: str, label_vi: str, label_en: str) -> str:
        item = cs.get(key)
        val = ""
        checked = False
        if isinstance(item, dict):
            val = item.get("value", "")
            checked = bool(item.get("checked", False))
        elif isinstance(item, str):
            val = item
        return rf"\textbf{{{label_vi}/ \textit{{{label_en}}}:}} {_dot_val(val)} \quad {_chk(checked)}\\[4pt]"

    # Helper cho trang 5 (VAS bar 0..10)
    def _vas_bar(selected_val: Any) -> str:
        sel = str(selected_val) if selected_val is not None and str(selected_val) != "" else ""
        cells = []
        for i in range(11):
            if str(i) == sel:
                cells.append(rf"\textbf{{[{i}]}}")
            else:
                cells.append(str(i))
        row_str = " & ".join(cells)
        return rf"""
\begin{{tabularx}}{{\textwidth}}{{|*{{11}}{{>{{\centering\arraybackslash}}X|}}}}
\hline
{row_str} \\
\hline
\end{{tabularx}}\\[-2pt]
\footnotesize Không đau/ \textit{{None}} \hfill Đau nhiều nhất/ \textit{{Max}}\normalsize\\[8pt]
"""

    # Helper cho trang 6 (Likert 6 cột)
    def _likert_block(q_vi: str, q_en: str, selected_idx: Any) -> str:
        sel = int(selected_idx) if isinstance(selected_idx, int) or (isinstance(selected_idx, str) and selected_idx.isdigit()) else -1
        checks = " & ".join(_chk(sel == i) for i in range(6))
        return rf"""
\textbf{{{q_vi}}}\\
\textit{{{q_en}}}\\[2pt]
\begin{{tabularx}}{{\textwidth}}{{|*{{6}}{{>{{\centering\arraybackslash}}X|}}}}
\hline
Không bao giờ & Không rõ & Ít khi & Thường xuyên & Nhiều & Rất nhiều \\
\textit{{\footnotesize Never}} & \textit{{\footnotesize Hardly noticed}} & \textit{{\footnotesize Slightly}} & \textit{{\footnotesize Moderately}} & \textit{{\footnotesize Strongly}} & \textit{{\footnotesize Very strongly}} \\
\hline
{checks} \\
\hline
\end{{tabularx}}\\[5pt]
"""

    # Helper cho trang 10 & 11 (BDI)
    def _bdi_group(code: str, selected_val: Any, items: List[tuple]) -> str:
        sel = int(selected_val) if isinstance(selected_val, int) or (isinstance(selected_val, str) and selected_val.isdigit()) else -1
        lines = [rf"\textbf{{{code}}}\\[1pt]"]
        for score, vi, en in items:
            lines.append(rf"\hspace{{1em}}{score} {_chk(sel == score)} {vi}/ \textit{{{en}}}\\[1.5pt]")
        return "\n".join(lines) + "\n\\vspace{3pt}\n"

    # Bảng điều trị trang 15
    dt_rows_raw = qs_dt.get("bangDieuTri") if isinstance(qs_dt.get("bangDieuTri"), list) else []
    dt_rows = list(dt_rows_raw[:6])
    while len(dt_rows) < 6:
        dt_rows.append({})
    dt_table_lines = []
    for r in dt_rows:
        r_d = _safe_dict(r)
        dt_table_lines.append(
            rf"{_tex_esc(r_d.get('dieuTri'))} & {_tex_esc(r_d.get('ngay'))} & {_tex_esc(r_d.get('thoiGian'))} & {_tex_esc(r_d.get('khaNangThichUng'))} & {_tex_esc(r_d.get('tacDung'))} \\[8pt]\hline"
        )
    dt_table_body = "\n".join(dt_table_lines)

    # Lịch trình theo dõi trang 19 (7 blocks)
    lich_raw = td.get("lichTrinh") if isinstance(td.get("lichTrinh"), list) else []
    lich_rows = list(lich_raw[:7])
    while len(lich_rows) < 7:
        lich_rows.append({})
    follow_up_blocks = []
    for item in lich_rows:
        it = _safe_dict(item)
        follow_up_blocks.append(
            rf"""
\textbf{{Ngày/ \textit{{Date}}:}} {_dot_val(it.get("ngay"))}\\[2pt]
\textbf{{Bác sỹ điều trị/ \textit{{Physician}}:}} {_dot_val(it.get("bacSyDieuTri"))}\\[2pt]
\textbf{{Bước tiếp theo/ \textit{{Next step}}:}} {_dot_val(it.get("buocTiepTheo"))}\\[2pt]
\textbf{{Lần khám tiếp theo/ \textit{{Next appointment}}:}} {_dot_val(it.get("lanKhamTiepTheo"))}\\[2pt]
\noindent\rule{{\textwidth}}{{0.4pt}}\\[4pt]
"""
        )
    follow_up_tex = "\n".join(follow_up_blocks)

    sel_course = dt_sd.get("selectedCourse")

    return rf"""% =====================================================================
% MẪU BỆNH ÁN SỐ 30: BỆNH ÁN ĐAU TOÀN DIỆN (COMPREHENSIVE PAIN RECORD)
% Mã tài liệu: VM - BS - V1 - 012 (19 Trang song ngữ Việt - Anh)
% =====================================================================
\documentclass[10pt,a4paper]{{article}}
\ifdefined\XeTeXversion
  \usepackage{{fontspec}}
  \setmainfont{{Times New Roman}}
\else
  \usepackage[utf8]{{inputenc}}
  \usepackage[vietnamese]{{babel}}
\fi
\usepackage[top=12mm,bottom=14mm,left=16mm,right=14mm]{{geometry}}
\usepackage{{array,tabularx,multirow,graphicx,xcolor}}
\pagestyle{{empty}}
\setlength{{\parindent}}{{0pt}}
\setlength{{\parskip}}{{2pt}}
\renewcommand{{\arraystretch}}{{1.2}}

\begin{{document}}

% ======================== TRANG 1 / PAGE 19 ========================
\noindent
\IfFileExists{{{img_p1_logo}}}{{\includegraphics[height=1.2cm]{{{img_p1_logo}}}}}{{\textbf{{VINMEC INTERNATIONAL HOSPITAL}}}}\\[8pt]
\begin{{center}}
  {{\Large \textbf{{{_tex_esc(header.get("tenBenhAn") or "BỆNH ÁN ĐAU")}}}}}\\[2pt]
  {{\normalsize \textbf{{{_tex_esc(header.get("tenBenhAnEn") or "PAIN RECORD")}}}}}
\end{{center}}
\vspace{{4pt}}

\textbf{{Bác sỹ điều trị đau/ \textit{{Pain Clinic Physian}}:}} {_dot_val(header.get("bacSyDieuTriDau"))}\\[3pt]
\textbf{{Người bệnh/ \textit{{Patient}}:}} {_dot_val(header.get("nguoiBenh") or hc.get("hoVaTen"))}\\[3pt]
\textbf{{Mã người bệnh/ \textit{{PID}}:}} {_dot_val(header.get("maNguoiBenh"))}\\[3pt]
\textbf{{Hội chứng chính/ \textit{{Main syndrome}}:}} {_dot_val(header.get("hoiChungChinh"))}\\[3pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}X X@{{}}}}
\textbf{{Ngày khám đầu/ \textit{{Date of first Visit}}:}} {_dot_val(header.get("ngayKhamDau"))} &
\quad \textbf{{Điều dưỡng/ \textit{{Nurse}}:}} {_dot_val(header.get("dieuDuong"))}
\end{{tabularx}}\\[2pt]
\noindent\dotfill\\[6pt]

{{\large \textbf{{THÔNG TIN NGƯỜI BỆNH/ \textit{{PATIENT INFORMATION:}}}}}}\\[4pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}p{{0.36\textwidth}} p{{0.28\textwidth}} X@{{}}}}
\textbf{{Ngày sinh/ \textit{{Date of Birth}}:}} {_dot_val(hc.get("sinhNgay"))} &
\textbf{{Tuổi/ \textit{{Age}}:}} {_dot_val(hc.get("tuoi"))} \textbf{{Tuổi/ \textit{{years}}}} &
\textbf{{Giới tính/ \textit{{Gender}}:}} {_dot_val(gioi_str)}
\end{{tabularx}}\\[3pt]
\textbf{{Địa chỉ/ \textit{{Address}}:}} {_dot_val(dia_chi_str)}\\[3pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}X X@{{}}}}
\textbf{{Đất nước/ \textit{{Country}}:}} {_dot_val(hc.get("datNuoc"))} &
\quad \textbf{{Quốc tịch/ \textit{{Nationality}}:}} {_dot_val(hc.get("quocTich"))} \\[3pt]
\textbf{{Email:}} {_dot_val(hc.get("email"))} &
\quad \textbf{{ĐT nhà/ \textit{{Home No}}:}} {_dot_val(hc.get("dtNha"))} \\[3pt]
\textbf{{ĐT nơi làm việc/ \textit{{Work No}}:}} {_dot_val(hc.get("dtNoiLamViec"))} &
\quad \textbf{{Di động/ \textit{{Mobile No}}:}} {_dot_val(hc.get("diDong"))}
\end{{tabularx}}\\[3pt]
\textbf{{Nghề nghiệp/ \textit{{Job}}:}} {_dot_val(hc.get("ngheNghiep"))}\\[5pt]
\textbf{{Bạn đã khám bác sĩ bao giờ chưa/ \textit{{Have you seen/ seeing a doctor?}}}} {_dot_val(hc.get("daKhamBacSiChua"))}\\[3pt]
\textbf{{Nếu có, tên và chuyên ngành của bác sĩ/ \textit{{If yes, Name of Doctor and Specialt}}:}} {_dot_val(hc.get("tenVaChuyenNganhBacSi"))}\\[2pt]
\noindent\dotfill\\[4pt]
\textbf{{Tình trạng hôn nhân/ \textit{{Marital Status}}:}} {_dot_val(hc.get("tinhTrangHonNhan"))}\\[3pt]
\textbf{{Bạn có bao nhiêu người con/ \textit{{How many kids do you have?}}}} {_dot_val(hc.get("soCon"))}\\[3pt]
\textbf{{Bạn có đang công tác không/ \textit{{Are you working?}}}} {_dot_val(hc.get("dangCongTacKhong"))}\\[3pt]
\textbf{{Nghề nghiệp/ \textit{{Occupation}}:}} {_dot_val(hc.get("ngheNghiepCongTac") or hc.get("ngheNghiep"))}\\[3pt]
\textbf{{Nếu không còn công tác, bạn đã ngừng công tác vì lý do đau hay bệnh lý nào không/ \textit{{If not working, did you stop because of your pain/illness?}}}} {_dot_val(hc.get("ngungCongTacViDau"))}\\[3pt]
\textbf{{Bạn có bệnh lý mạn tính nào không/ \textit{{Do you have any chronic diseases?}}}} {_dot_val(hc.get("benhLyManTinh"))}\\[3pt]
\textbf{{Bạn có bị khuyết tật không/ \textit{{Any physical disability?}}}} {_dot_val(hc.get("khuyetTat"))}
{_page_footer(doc_code, 1)}
\newpage

% ======================== TRANG 2 / PAGE 19 ========================
{{\large \textbf{{TIỀN SỬ BỆNH/ \textit{{ANTECEDENTS/ASSOCIATED DISEASES}}}}}}\\[6pt]
\textbf{{DỊ ỨNG/ \textit{{ALLERGIES}}}}\\[2pt]
\textbf{{Bạn có bị dị ứng không? (Thuốc, nhựa cao su, i-ốt...)}}\\
\textit{{Do you have any allergies? (Medicines, latex, iodine...)}} {_dot_val(ts.get("diUng"))}\\[8pt]

\textbf{{PHẪU THUẬT/ \textit{{SURGERY}}}}\\[2pt]
\textbf{{Những can thiệp phẫu thuật bạn đã từng làm, thời gian nào?}}\\
\textit{{List the surgical interventions you had in the past with the date?}} {_dot_val(ts.get("phauThuatDaLam"))}\\[4pt]
\textbf{{Biến chứng trong và sau phẫu thuật}}\\
\textit{{Any complication during or after surgery:}} {_dot_val(ts.get("bienChungPhauThuat"))}\\[8pt]

\textbf{{THUỐC/ \textit{{MEDICAL}}}}\\[2pt]
\textbf{{Liệt kê những bệnh lý khác đã từng mắc phải ngoài những bệnh lý từ nhỏ (trầm cảm, bệnh khác ...)}}\\
\textit{{List the different diseases you have had outside of childhood illnesses: (depression, others...)}}\\[2pt]
{_dot_val(ts.get("benhLyKhacNgoaiNho"))}\\[10pt]
\textbf{{Liệt kê tất cả các bệnh lý đang điều trị (hen, tiểu đường, tăng huyết áp ...)}}\\
\textit{{List all the illnesses/disease you are treated for :(asthma, diabetes, hypertension...)}}\\[2pt]
{_dot_val(ts.get("benhLyDangDieuTri"))}\\[10pt]

\textbf{{ĐIỀU TRỊ/ \textit{{TREATMENTS}}}}\\[2pt]
\textbf{{Tên thuốc và liều dùng/ \textit{{List and dosage}}:}}\\[2pt]
{_dot_val(ts.get("tenThuocVaLieuDung"))}\\[8pt]
\textbf{{Bạn có đang dùng thuốc chống đông không? (Đường uống hay tiêm)}}\\
\textit{{Are you under anti coagulants? (Oral or injectable)}} {_dot_val(ts.get("dungThuocChongDong"))}\\[3pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}X X@{{}}}}
\textbf{{Thuốc/ \textit{{Medication}}:}} {_dot_val(ts.get("thuocChongDong"))} &
\quad \textbf{{Liều dùng/ \textit{{Dosage}}:}} {_dot_val(ts.get("lieuThuocChongDong"))}
\end{{tabularx}}\\[3pt]
\textbf{{Lý do điều trị/ \textit{{Reason of this treatment}}:}} {_dot_val(ts.get("lyDoChongDong"))}\\[4pt]
\textbf{{Bạn có đang dùng thuốc chống ngưng tập tiểu cầu không?/ \textit{{Are you under anti platelet?}}}} {_dot_val(ts.get("dungThuocChongNgungTapTieuCau"))}\\[3pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}X X@{{}}}}
\textbf{{Thuốc/ \textit{{Medication}}:}} {_dot_val(ts.get("thuocChongNgungTap"))} &
\quad \textbf{{Liều dùng/ \textit{{Dosage}}:}} {_dot_val(ts.get("lieuThuocChongNgungTap"))}
\end{{tabularx}}\\[3pt]
\textbf{{Lý do điều trị/ \textit{{Reason of this treatment}}:}} {_dot_val(ts.get("lyDoChongNgungTap"))}\\[8pt]

\textbf{{CƠN ĐAU/ \textit{{PAIN}}}}\\[2pt]
\textbf{{Theo bạn, những nguyên nhân dẫn đến cơn đau của bạn là gì ?}}\\
\textit{{List according to you the cause(s) of your pain?}} {_dot_val(ts.get("nguyenNhanDauTheoBenhNhan"))}\\[4pt]
\textbf{{Liệt kê các phương pháp điều trị đau hiệu quả bạn từng sử dụng, thời gian và hiệu quả như thế nào}}\\
\textit{{List all the treatments you have benefited for you pain with date and effect:}}\\[2pt]
{_dot_val(ts.get("phuongPhapDieuTriHieuQua"))}\\[8pt]
\textbf{{Liệt kê những xét nghiệm cận lâm sàng bạn từng làm liên quan đến cơn đau (chụp cộng hưởng từ, chụp CT, xét nghiệm máu ...) và kết quả/ \textit{{List all the explorations you already made for your pain :(MRI, scanner, blood tests...) and results:}}}}\\[2pt]
{_dot_val(ts.get("xetNghiemCanLamSang"))}
{_page_footer(doc_code, 2)}
\newpage

% ======================== TRANG 3 / PAGE 19 ========================
{{\large \textbf{{BỆNH SỬ ĐAU/ \textit{{HISTORY OF THE PAIN}}}}}}\\[6pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}X X@{{}}}}
\textbf{{Ngày bắt đầu/ \textit{{Start Date}}:}} {_dot_val(bsd.get("ngayBatDau"))} &
\quad \textbf{{Ngày bắt đầu tăng nặng/ \textit{{Aggravation Date}}:}} {_dot_val(bsd.get("ngayTangNang"))} \\[4pt]
\textbf{{Vị trí ban đầu/ \textit{{Primary Location}}:}} {_dot_val(bsd.get("viTriBanDau"))} &
\quad \textbf{{Vị trí lan tỏa/ \textit{{Extension}}:}} {_dot_val(bsd.get("viTriLanToa"))}
\end{{tabularx}}\\[4pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}X X X X@{{}}}}
{_chk(khoi_phat.get("dotNgot"))} Đột ngột/ \textit{{Suddenly}} &
{_chk(khoi_phat.get("tuPhat"))} Tự phát/ \textit{{Spontaneously}} &
{_chk(khoi_phat.get("tuTu"))} Từ từ/ \textit{{Progressive}} &
{_chk(khoi_phat.get("nhoi"))} Nhói/ \textit{{Trigger}}
\end{{tabularx}}\\[4pt]
\textbf{{Sự tiến triển/ \textit{{Evolution}}:}} {_dot_val(bsd.get("suTienTrien"))}\\[10pt]

{{\large \textbf{{MIÊU TẢ CƠN ĐAU HIỆN TẠI/ \textit{{DESCRIPTION OF THE CURRENT PAIN}}}}}}\\[3pt]
\textbf{{Từ dành cho người bệnh/ \textit{{Terms used by the patient:}}}}\\[3pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}X X X@{{}}}}
{_chk(mieu_ta.get("beating"))} Đau như cú đấm/ \textit{{Beating}} &
{_chk(mieu_ta.get("crushed"))} Đau thắt/ \textit{{Crushed}} &
{_chk(mieu_ta.get("burning"))} Đau bỏng rát/ \textit{{Burning}} \\[3pt]
{_chk(mieu_ta.get("tingling"))} Đau râm ran/ \textit{{Tingling}} &
{_chk(mieu_ta.get("stabbing"))} Đau như dao đâm/ \textit{{Stabbing}} &
{_chk(mieu_ta.get("radiating"))} Đau lan tỏa/ \textit{{Radiating}} \\[3pt]
{_chk(mieu_ta.get("cramps"))} Đau như chuột rút/ \textit{{Cramps}} &
{_chk(mieu_ta.get("electricShock"))} Cảm giác điện giật/ \textit{{Electric shock}} &
{_chk(mieu_ta.get("scratching"))} Ngứa/ \textit{{Scratching}} \\[3pt]
{_chk(mieu_ta.get("clenching"))} Đau siết/thắt/ \textit{{Clenching}} &
{_chk(mieu_ta.get("slenderness"))} Đau âm ỉ/ \textit{{Slenderness}} &
{_chk(mieu_ta.get("pinsAndNeedles"))} Đau như kim châm/ \textit{{Pins and needles}}
\end{{tabularx}}\\[8pt]

\textbf{{Sự xuất hiện và cường độ đau (đánh giá thang đau từ 0 đến 10, 0 = không đau, 10 = đau nhiều nhất)/ \textit{{Terms of appearance and intensity of the pain: (rated from 0 to 10, 0=no pain, 10=worse pain)}}}}\\[4pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}X p{{0.24\textwidth}} p{{0.24\textwidth}}@{{}}}}
{_chk(cuong_do.get("lienTucChecked"))} Đau liên tục/ \textit{{Continuous pain}}: &
nhỏ nhất/ \textit{{minimal}}: \framebox[2.2em][c]{{\strut\textbf{{{_tex_esc(cuong_do.get("lienTucMin"))}}}}} &
lớn nhất/ \textit{{maximal}}: \framebox[2.2em][c]{{\strut\textbf{{{_tex_esc(cuong_do.get("lienTucMax"))}}}}} \\[3pt]
{_chk(cuong_do.get("tungHoiChecked"))} Đau từng hồi/ \textit{{Intermittent pain}}: &
nhỏ nhất/ \textit{{minimal}}: \framebox[2.2em][c]{{\strut\textbf{{{_tex_esc(cuong_do.get("tungHoiMin"))}}}}} &
lớn nhất/ \textit{{maximal}}: \framebox[2.2em][c]{{\strut\textbf{{{_tex_esc(cuong_do.get("tungHoiMax"))}}}}} \\[3pt]
{_chk(cuong_do.get("theoConChecked"))} Đau theo cơn/ \textit{{Pain by crisis}}: &
nhỏ nhất/ \textit{{minimal}}: \framebox[2.2em][c]{{\strut\textbf{{{_tex_esc(cuong_do.get("theoConMin"))}}}}} &
lớn nhất/ \textit{{maximal}}: \framebox[2.2em][c]{{\strut\textbf{{{_tex_esc(cuong_do.get("theoConMax"))}}}}}
\end{{tabularx}}\\[4pt]
{_chk(cuong_do.get("doKichThichChecked"))} Đau do kích thích/ \textit{{Provocated pain}} \quad - Nguyên nhân/ \textit{{Cause}}: {_dot_val(cuong_do.get("doKichThichNguyenNhan"))}\\[3pt]
{_chk(cuong_do.get("tuPhatChecked"))} Cơn đau tự phát/ \textit{{Spontaneous pain}} \quad - Ban ngày/ \textit{{Day time}}: {_dot_val(cuong_do.get("tuPhatBanNgay"))}\\[3pt]
\textbf{{Loại hoạt động/ \textit{{Type of activity}}:}} {_dot_val(cuong_do.get("loaiHoatDong"))}\\[8pt]

\textbf{{Các yếu tố tăng đau/ \textit{{Factors aggravating pain:}}}}\\[3pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}X X X X@{{}}}}
{_chk(yeu_to_tang.get("coHoc"))} Cơ học/ \textit{{Mechanical}} &
{_chk(yeu_to_tang.get("cuDong"))} Cử động/ \textit{{Movement}} &
{_chk(yeu_to_tang.get("diBo"))} Đi bộ/ \textit{{Walking}} &
{_chk(yeu_to_tang.get("khoangCach"))} Khoảng cách/ \textit{{Distance}} \\[3pt]
{_chk(yeu_to_tang.get("tuThe"))} Tư thế/ \textit{{Positional}} &
{_chk(yeu_to_tang.get("dung"))} Đứng/ \textit{{Standing}} &
{_chk(yeu_to_tang.get("nam"))} Nằm/ \textit{{Lying}} &
{_chk(yeu_to_tang.get("ngoi"))} Ngồi/ \textit{{Sitting}} \\[3pt]
{_chk(yeu_to_tang.get("tiepXucDa"))} Tiếp xúc da/ \textit{{Skin contact}} &
{_chk(yeu_to_tang.get("tiepXucDonThuan"))} Tiếp xúc đơn thuần/ \textit{{Simple}} &
{_chk(yeu_to_tang.get("tiepXucLanh"))} Tiếp xúc lạnh/ \textit{{Local cold}} &
{_chk(yeu_to_tang.get("tiepXucNong"))} Tiếp xúc nóng/ \textit{{Local heat}} \\[3pt]
{_chk(yeu_to_tang.get("yeuToKhac"))} Các yếu tố khác/ \textit{{Other}} &
{_chk(yeu_to_tang.get("metMoi"))} Mệt mỏi/ \textit{{Fatigue}} &
{_chk(yeu_to_tang.get("cangThang"))} Căng thẳng/ \textit{{Stress}} &
{_chk(yeu_to_tang.get("khac"))} Khác/ \textit{{Others}}
\end{{tabularx}}
{_page_footer(doc_code, 3)}
\newpage

% ======================== TRANG 4 / PAGE 19 ========================
{{\large \textbf{{CUỘC SỐNG HÀNG NGÀY/ \textit{{DAILY LIFE}}}}}}\\[4pt]
\textbf{{Tác động của cơn đau lên/ \textit{{Impact of pain on:}}}}\\[6pt]
{_cs_row("sinhHoatGiaDinh", "Sinh hoạt gia đình", "Family activities")}
{_cs_row("sinhHoatCaNhan", "Sinh hoạt cá nhân", "Personal leisure activities")}
{_cs_row("hoatDongXaHoi", "Hoạt động xã hội và các mối quan hệ", "Social and relational activities")}
{_cs_row("congViec", "Công việc", "Work")}
{_cs_row("tinhCach", "Tính cách (dễ bị kích động)", "Character (irritability)")}
{_cs_row("chucNangNhanThuc", "Chức năng nhận thức (sự tập trung)", "Cognitive functions (concentration)")}
{_cs_row("giacNgu", "Giấc ngủ", "Sleep")}
{_cs_row("tamTrang", "Tâm trạng", "Mood")}
{_cs_row("suyGiamChucNangCoThe", "Có suy giảm chức năng nào của cơ thể không", "Is there a loss of body function")}
{_cs_row("matTuChuLaiXe", "Có mất tự chủ không (không thể lái xe?)", "Is there a loss of autonomy (cannot drive?)")}
{_cs_row("matKhaNangThamGiaXaHoi", "Có mất khả năng tham gia các hoạt động xã hội không?", "Is there a loss of participation in social life?")}
{_cs_row("moiTruongNguoiBenh", "Môi trường của người bệnh", "Environment of the patient")}
{_cs_row("dieuKienLamViecAnhHuong", "Điều kiện làm việc có làm cơn đau trầm trọng hơn không?", "Does working conditions have an influence on aggravating pain?")}
{_cs_row("boiThuongTaiChinh", "Điều trị đau có được bồi thường về tài chính không?", "Is there any financial procedure compensation with the pain")}
{_page_footer(doc_code, 4)}
\newpage

% ======================== TRANG 5 / PAGE 19 ========================
\begin{{center}}
  {{\Large \textbf{{ĐO CƯỜNG ĐỘ ĐAU}}}}\\[2pt]
  {{\normalsize \textbf{{MEASURING THE INTENSITY OF PAIN}}}}\\[3pt]
  \textbf{{Thước đo/ \textit{{Scale 1:}} Thang điểm cường độ đau dạng nhìn (VAS)/ \textit{{Visual Analog Scale (VAS)}}}}
\end{{center}}
\vspace{{4pt}}
\noindent\fbox{{\parbox{{0.97\textwidth}}{{
Chúng tôi khuyên bạn nên sử dụng thang điểm để giúp bạn đo mức độ đau\\
\textit{{We advise you to use a pain thermometer to help you measure the intensity of the pain:}}\\[2pt]
Cường độ đau có thể xác định bằng đường thẳng như ví dụ dưới đây\\
\textit{{Pain intensity can be defined with a line like the one in the example below:}}\\[2pt]
Một đầu thể hiện ``mức đau cao nhất có thể'', điểm đau càng lệch về đầu này cơn đau càng nhiều\\
\textit{{One extremity shows the ``maximum imaginable pain'', more the line is near to the end, your pain is worse.}}\\[2pt]
Một đầu khác thể hiện mức ``không đau'', nếu điểm đau càng lệch về đầu này cơn đau càng ít\\
\textit{{The other extremity shows that there is ``no pain'', if the line is near to the start, it means you do not feel any pain.}}\\[4pt]
Không đau/\textit{{No pain}} \hspace{{1em}}\rule{{0.48\textwidth}}{{0.5pt}}\hspace{{1em}} Mức đau cao nhất có thể/\textit{{Maximum imaginable pain}}
}}}}\\[12pt]

\textbf{{Bạn cảm thấy cơn đau hiện tại như thế nào?}}\\
\textit{{How would you assess your pain now, at this moment?}}\\[2pt]
{_vas_bar(vas.get("dauHienTai"))}

\textbf{{Cơn đau nhiều nhất trong 4 tuần qua như thế nào?}}\\
\textit{{How strong was the strongest pain during the past 4 weeks?}}\\[2pt]
{_vas_bar(vas.get("dauNhat4Tuan"))}

\textbf{{Trung bình các cơn đau trong 4 tuần qua như thế nào?}}\\
\textit{{How strong was the pain during the past 4 weeks on average?}}\\[2pt]
{_vas_bar(vas.get("trungBinh4Tuan"))}
{_page_footer(doc_code, 5)}
\newpage

% ======================== TRANG 6 / PAGE 19 ========================
{_likert_block("Bạn có đau bỏng rát (đau nhức) tại vị trí đánh dấu không?", "Do you suffer from a burning sensation (e.g., stinging nettles) in the marked areas?", likert.get("q1_bongRat"))}
{_likert_block("Bạn có cảm giác râm ran ở vị trí đau không (như kiến bò hay tê điện)?", "Do you have a tingling or prickling sensation in the area of your pain (like crawling ants or electrical tingling)?", likert.get("q2_ramRan"))}
{_likert_block("Đau khi dùng miếng vải hay khăn chạm nhẹ vào vùng đau?", "Is light touching with a cloth or towel painful?", likert.get("q3_chamNhe"))}
{_likert_block("Bạn có cơn đau đột ngột nào như điện giật ở khu vực đau không?", "Do you have sudden pain attacks in the area of your pain, like electric shocks?", likert.get("q4_dienGiat"))}
{_likert_block("Khu vực bị đau cảm thấy nóng hay lạnh khi tắm?", "Is cold or heat (bath water) in this area occasionally painful?", likert.get("q5_nongLanh"))}
{_likert_block("Bạn có bị tê bì tại vị trí đánh dấu không?", "Do you suffer from a sensation of numbness in the areas that you marked?", likert.get("q6_teBi"))}
{_likert_block("Bạn có bị tức nhẹ tại vị trí đau không (khi ấn ngón tay, khi chạm vào điểm đau kích thích)", "Does slight pressure in this area, e.g., with a finger, trigger pain?", likert.get("q7_tucNhe"))}

\vspace{{2pt}}
\textbf{{Bác sỹ điền/ \textit{{To be filled out by the phycian}}}}\\[2pt]
\begin{{tabular}}{{|p{{2.1cm}}|p{{2.1cm}}|p{{2.1cm}}|p{{2.1cm}}|p{{2.1cm}}|p{{2.1cm}}|}}
\hline
$\times 0 =$ \textbf{{{_tex_esc(bs_dien_p6.get("x0"))}}} &
$\times 1 =$ \textbf{{{_tex_esc(bs_dien_p6.get("x1"))}}} &
$\times 2 =$ \textbf{{{_tex_esc(bs_dien_p6.get("x2"))}}} &
$\times 3 =$ \textbf{{{_tex_esc(bs_dien_p6.get("x3"))}}} &
$\times 4 =$ \textbf{{{_tex_esc(bs_dien_p6.get("x4"))}}} &
$\times 5 =$ \textbf{{{_tex_esc(bs_dien_p6.get("x5"))}}} \\
\hline
\end{{tabular}}
\hfill \textbf{{Điểm/Score:}} \framebox[3.2em][c]{{\strut\textbf{{{_tex_esc(bs_dien_p6.get("tongDiem"))}}}}}
{_page_footer(doc_code, 6)}
\newpage

% ======================== TRANG 7 / PAGE 19 ========================
{{\large \textbf{{Chọn bức ảnh miêu tả chính xác nhất cảm giác đau của bạn:/ \textit{{Mark the picture that best describes the course of your pain}}}}}}\\[6pt]
\begin{{tabularx}}{{\textwidth}}{{*{{4}}{{>{{\centering\arraybackslash}}X}}}}
{_chk(sel_course == 0)} $+0$ & {_chk(sel_course == 1)} $-1$ & {_chk(sel_course == 2)} $+1$ & {_chk(sel_course == 3)} $+1$ \\[4pt]
\IfFileExists{{images/pain_course_1.png}}{{\includegraphics[width=3.2cm,height=1.5cm,keepaspectratio]{{images/pain_course_1.png}}}}{{\fbox{{\parbox[c][1.1cm][c]{{3.2cm}}{{\centering \footnotesize $\sim\sim\sim\sim\sim$}}}}}} &
\IfFileExists{{images/pain_course_2.png}}{{\includegraphics[width=3.2cm,height=1.5cm,keepaspectratio]{{images/pain_course_2.png}}}}{{\fbox{{\parbox[c][1.1cm][c]{{3.2cm}}{{\centering \footnotesize $\wedge\sim\wedge\sim\wedge$}}}}}} &
\IfFileExists{{images/pain_course_3.png}}{{\includegraphics[width=3.2cm,height=1.5cm,keepaspectratio]{{images/pain_course_3.png}}}}{{\fbox{{\parbox[c][1.1cm][c]{{3.2cm}}{{\centering \footnotesize $\_\_\wedge\_\_\wedge\_\_$}}}}}} &
\IfFileExists{{images/pain_course_4.png}}{{\includegraphics[width=3.2cm,height=1.5cm,keepaspectratio]{{images/pain_course_4.png}}}}{{\fbox{{\parbox[c][1.1cm][c]{{3.2cm}}{{\centering \footnotesize $\wedge\vee\wedge\vee\wedge$}}}}}} \\[4pt]
\footnotesize Đau từng cơn nhẹ, trên nền đau liên tục\par\textit{{Persistent pain with slight fluctuations}} &
\footnotesize Đau từng cơn rõ rệt, trên nền đau liên tục\par\textit{{Persistent pain with pain attacks}} &
\footnotesize Đau từng cơn rõ rệt, trên nền không đau\par\textit{{Pain attacks without pain between them}} &
\footnotesize Đau tăng giảm liên tục\par\textit{{Pain attacks with pain between}}
\end{{tabularx}}\\[8pt]

\begin{{center}}
\textbf{{Điểm/Score:}} \underline{{\hspace{{1.5cm}}\textbf{{{_tex_esc(dt_sd.get("diemScore"))}}}\hspace{{1.5cm}}}}
\end{{center}}
\vspace{{4pt}}

\begin{{tabularx}}{{\textwidth}}{{|>{{\centering\arraybackslash}}X|>{{\centering\arraybackslash}}X|>{{\centering\arraybackslash}}X|}}
\hline
\textbf{{Đau cảm thụ/ \textit{{Nociceptive}}}} & \textbf{{Chưa xác định/ \textit{{Unclear}}}} & \textbf{{Đau thần kinh/ \textit{{Neuropathic}}}} \\
\hline
\end{{tabularx}}\\[2pt]
\footnotesize
\begin{{tabularx}}{{\textwidth}}{{X X X}}
0 -- 12: Không có yếu tố đau thần kinh ($< 15\%$)\par\textit{{A neuropathic pain component is unlikely}} &
13 -- 18: Kết quả không rõ ràng. Có thể có đau thần kinh\par\textit{{Result is ambiguous, neuropathic component can be present}} &
19 -- 38: Có yếu tố đau thần kinh ($> 90\%$)\par\textit{{A neuropathic pain component is likely}}
\end{{tabularx}}\normalsize\\[10pt]

\begin{{center}}
\IfFileExists{{{img_p7_bodymap}}}{{\includegraphics[height=8.2cm,keepaspectratio]{{{img_p7_bodymap}}}}}{{\fbox{{\parbox[c][7cm][c]{{8cm}}{{\centering Sơ đồ vị trí đau cơ thể}}}}}}
\end{{center}}
{_page_footer(doc_code, 7)}
\newpage

% ======================== TRANG 8 / PAGE 19 ========================
{{\large \textbf{{CÂU HỎI DN4/ \textit{{QUESTIONNAIRE DN4}}}}}}\\[2pt]
\textit{{(Chọn 1 câu trả lời cho mỗi câu hỏi dưới đây/ Choose one answer for each of these questions)}}\\[6pt]
\textbf{{Thu thập thông tin người bệnh/ \textit{{Patient Interrogation:}}}}\\[4pt]
\textbf{{Câu hỏi 1: Cơn đau hiện tại giống một hay nhiều tính chất nào dưới đây?}}\\
\textit{{Question 1: Does the pain present one or more of these characteristics?}}\\[2pt]
{_chk(dn4.get("q1_nongRat"))} Nóng rát/ \textit{{Burning}} \hfill \framebox[1.8em][c]{{\strut {1 if dn4.get("q1_nongRat") else 0}}}\\[2pt]
{_chk(dn4.get("q1_dauLanh"))} Cảm giác đau lạnh/ \textit{{Painful cold feeling}} \hfill \framebox[1.8em][c]{{\strut {1 if dn4.get("q1_dauLanh") else 0}}}\\[2pt]
{_chk(dn4.get("q1_dienGiat"))} Cảm giác điện giật/ \textit{{Electric shock}} \hfill \framebox[1.8em][c]{{\strut {1 if dn4.get("q1_dienGiat") else 0}}}\\[6pt]

\textbf{{Câu hỏi 2: Cơn đau cùng vị trí có liên quan đến những cảm giác dưới đây không?}}\\
\textit{{Question 2: Is the pain in the same area related to one or of the following?}}\\[2pt]
{_chk(dn4.get("q2_kimCham"))} Đau như kim châm/ \textit{{Pins and needles}} \hfill \framebox[1.8em][c]{{\strut {1 if dn4.get("q2_kimCham") else 0}}}\\[2pt]
{_chk(dn4.get("q2_ramRan"))} Đau râm ran/ \textit{{Tingling}} \hfill \framebox[1.8em][c]{{\strut {1 if dn4.get("q2_ramRan") else 0}}}\\[2pt]
{_chk(dn4.get("q2_teBi"))} Tê bì/ \textit{{Numbness}} \hfill \framebox[1.8em][c]{{\strut {1 if dn4.get("q2_teBi") else 0}}}\\[2pt]
{_chk(dn4.get("q2_ngua"))} Ngứa/ \textit{{Itching}} \hfill \framebox[1.8em][c]{{\strut {1 if dn4.get("q2_ngua") else 0}}}\\[4pt]
\noindent\rule{{\textwidth}}{{0.4pt}}\\[6pt]

\textbf{{Kiểm tra người bệnh: bác sĩ đánh giá/ \textit{{Examination of the patient: feel by the physician}}}}\\[4pt]
\textbf{{Câu hỏi 3: Đau nhiều tại vị trí được kiểm tra hay không?}}\\
\textit{{Question 3: Is the pain located to an area where the exam is evident?}}\\[2pt]
{_chk(dn4.get("q3_matCamGiacTiepXuc"))} Tact hypoesthesia/ \textit{{Mất cảm giác khi tiếp xúc}} \hfill \framebox[1.8em][c]{{\strut {1 if dn4.get("q3_matCamGiacTiepXuc") else 0}}}\\[2pt]
{_chk(dn4.get("q3_matCamGiacChichKim"))} Prick hypoesthesia/ \textit{{Mất cảm giác khi chích kim}} \hfill \framebox[1.8em][c]{{\strut {1 if dn4.get("q3_matCamGiacChichKim") else 0}}}\\[6pt]

\textbf{{Câu hỏi 4: Cơn đau có tăng lên khi?}}\\
\textit{{Question 4: Does the pain increase by?}}\\[2pt]
{_chk(dn4.get("q4_coXat"))} Cọ xát/ \textit{{The rubbing}} \hfill \framebox[1.8em][c]{{\strut {1 if dn4.get("q4_coXat") else 0}}}\\[10pt]

{{\large \textbf{{Tổng điểm/ \textit{{Patient Score}}:}} \hfill \textbf{{{_tex_esc(dn4.get("tongDiem"))} / 10}}}}
{_page_footer(doc_code, 8)}
\newpage

% ======================== TRANG 9 / PAGE 19 ========================
{{\large \textbf{{TIÊU CHUẨN CHẨN ĐOÁN HỘI CHỨNG ĐAU VÙNG PHỨC TẠP BUDAPEST/ \textit{{BUDAPEST CRITERIA FOR COMPLEX REGIONAL PAIN SYNDROME DIAGNOSIS}}}}}}\\[6pt]
\textbf{{Hội chứng đau vùng phức tạp là đau liên tục không bị ảnh hưởng bởi với các tác nhân kích thích. Người bệnh cần có ít nhất 1 triệu chứng ở 3 trong 4 mục dưới đây:}}\\
\textit{{CRPS is defined as continuing pain disproportionate to any inciting event. A patient must have at least 1 symptom in 3 of the 4 following categories:}}\\[8pt]

\textbf{{1. Cảm giác - \textit{{Sensory}}:}}\\[3pt]
\hspace{{1em}}{_chk(buda.get("camGiac_loanCamDau"))} \textbf{{Loạn cảm đau/ \textit{{Allodynia}}}}\\
\hspace{{2.2em}}\textit{{(khi chạm nhẹ và/hoặc nhạy cảm với nhiệt độ và/hoặc áp lực cơ thể sâu và/hoặc vận động khớp)}}\\
\hspace{{2.2em}}\textit{{(to light touch and/or temperature sensation and/or deep somatic pressure and/or joint movement)}}\\
\hspace{{1em}}\textbf{{Và/ hoặc - \textit{{and/ or}}}}\\
\hspace{{1em}}{_chk(buda.get("camGiac_tangCamGiacDau"))} \textbf{{Tăng cảm giác đau (châm kim)/ \textit{{Hyperalgesia (to pinprick)}}}}\\[6pt]

\textbf{{2. Vasomotor - \textit{{Vận mạch}}:}}\\[3pt]
\hspace{{1em}}{_chk(buda.get("vanMach_nhietDoDa"))} \textbf{{Nhiệt độ da khác nhau (hơn 1 độ C) và/hoặc thay đổi màu sắc da không đồng nhất}}\\
\hspace{{2.2em}}\textit{{Differences in skin temperature (more than 1 degree Celsius.) and/or skin colour changes and/or skin colour asymmetry}}\\[2pt]
\hspace{{1em}}{_chk(buda.get("vanMach_khacBietMauDa"))} \textbf{{Khác biệt màu da ở các bên cơ thể khác nhau/ \textit{{Differences in skin colouration between different sides}}}}\\[2pt]
\hspace{{1em}}{_chk(buda.get("vanMach_thayDoiMauDa"))} \textbf{{Thay đổi màu da/ \textit{{Skin colour changes}}}}\\[6pt]

\textbf{{3. Bài tiết mồ hôi/ Phù nề - \textit{{Sudomotor/ Oedema}}:}}\\[3pt]
\hspace{{1em}}{_chk(buda.get("phuNe_sungNe"))} \textbf{{Hai bên cơ thể sưng nề khác nhau/ \textit{{Changes of Asymmetry in swelling}}}}\\[2pt]
\hspace{{1em}}{_chk(buda.get("phuNe_toatMoHoi"))} \textbf{{Hai bên cơ thể toát mồ hôi khác nhau/ \textit{{Changes of Asymmetry in sweating}}}}\\[6pt]

\textbf{{4. Vận động/ Dinh dưỡng - \textit{{Motor/ Trophic}}:}}\\[3pt]
\hspace{{1em}}{_chk(buda.get("vanDong_hanChe"))} \textbf{{Hạn chế vận động/ \textit{{Decreased range of movment}}}}\\[2pt]
\hspace{{1em}}{_chk(buda.get("vanDong_trieuChung"))} \textbf{{Triệu chứng vận động (rùng mình, yếu ớt, rối loạn trương lực,...)/ \textit{{Motor symptoms}}}}\\[2pt]
\hspace{{1em}}{_chk(buda.get("vanDong_thayDoiDinhDuong"))} \textbf{{Thay đổi về tóc, da, móng tay chân (dinh dưỡng)/ \textit{{Changes in hair, skin, nails (Trophic)}}}}\\[10pt]

\textbf{{Tiêu chuẩn Budapest/ \textit{{Budapest criteria}}:}} \hspace{{2em}}
{_chk(str(buda.get("ketLuanBudapest")).upper() == "YES")} \textbf{{CÓ/ \textit{{YES}}}} \hspace{{3em}}
{_chk(str(buda.get("ketLuanBudapest")).upper() == "NO")} \textbf{{KHÔNG/ \textit{{NO}}}}
{_page_footer(doc_code, 9)}
\newpage

% ======================== TRANG 10 / PAGE 19 ========================
{{\large \textbf{{THANG ĐÁNH GIÁ TRẦM CẢM BECK/ \textit{{ECHELLE DE BECK (BDI: BECK DEPRESSION INVENTORY)}}}}}}\\[4pt]
\textbf{{Chọn câu trả lời đúng nhất/ \textit{{Please select the best answer}}}}\\[6pt]
{_bdi_group("A", bdi.get("A"), [
    (0, "Tôi không cảm thấy buồn", "I don't feel sad"),
    (1, "Tôi cảm thấy buồn", "I feel sad"),
    (2, "Tôi luôn cảm thấy buồn và không thể loại bỏ nó", "I always feel sad and I can't sort it out"),
    (3, "Tôi rất buồn và không vui, tôi không thể chịu đựng được nó", "I am so sad and unhappy and I can't bear it"),
])}
{_bdi_group("B", bdi.get("B"), [
    (0, "Tôi không thấy bi quan về tương lai", "I don't feel pessimistic about the future"),
    (1, "Tôi có cảm giác không tốt về tương lai", "I have a bad feeling about the future"),
    (2, "Tôi không có hy vọng gì về tương lai", "I don't have any hope about my future."),
    (3, "Tôi không có hy vọng gì về tương lai và tình trạng này sẽ không khá hơn", "I don't have any hope about my future and the situation will not be better"),
])}
{_bdi_group("C", bdi.get("C"), [
    (0, "Tôi không có cảm giác thất bại trong cuộc sống của mình", "I have no sense of failure in my life."),
    (1, "Tôi có cảm giác cuộc sống của mình có nhiều thứ hơn những người khác", "I have the feeling that I have in my life more than someone else"),
    (2, "Khi tôi nhìn lại quá khứ, tất cả những gì tôi thấy là sự thất bại", "When I look to my past all what I see are failures"),
    (3, "Tôi cảm thấy rằng mình đã thất bại trong chính cuộc sống của mình", "I have a feeling that I failed in all my personal life."),
])}
{_bdi_group("D", bdi.get("D"), [
    (0, "Tôi không cảm thấy thỏa mãn chút nào", "I don't feel particularly satisfied"),
    (1, "Tôi không biết làm thế nào để thích nghi với hoàn cảnh", "I don't know how to enjoy the circumstances"),
    (2, "Tôi không thấy thỏa mãn với bất cứ điều gì", "I don't have any satisfaction with anything"),
    (3, "Tôi thấy không vui với tất cả mọi thứ", "I am so unhappy with everything"),
])}
{_bdi_group("E", bdi.get("E"), [
    (0, "Tôi không cảm thấy tội lỗi", "I don't feel guilty"),
    (1, "Tôi cảm thấy rất tệ ở mọi lúc", "I feel so bad most of the time"),
    (2, "Tôi cảm thấy tội lỗi", "I feel guilty"),
    (3, "Tôi thấy rất tệ và tôi nghĩ rằng tôi không xứng đáng", "I feel very bad and I think that I am not worth it"),
])}
{_bdi_group("F", bdi.get("F"), [
    (0, "Tôi không thất vọng về bản thân mình", "I am not disappointed with myself"),
    (1, "Tôi thất vọng về bản thân mình", "I am disappointed by myself"),
    (2, "Tôi cảm thấy ghê tởm bản thân mình", "I disgust myself"),
    (3, "Tôi ghét bản thân mình", "I hate myself"),
])}
{_bdi_group("G", bdi.get("G"), [
    (0, "Tôi không nghĩ rằng sẽ làm tổn thương bản thân", "I don't think to hurt myself."),
    (1, "Tôi nghĩ rằng cái chết sẽ giải thoát cho tôi", "I think that dying will liberate me."),
    (2, "Tôi có những kế hoạch tỉ mỉ để tự tử", "I have precise plans to suicide"),
    (3, "Nếu có thể, tôi sẽ tự tử", "If I can, I will kill myself"),
])}
{_page_footer(doc_code, 10)}
\newpage

% ======================== TRANG 11 / PAGE 19 ========================
{_bdi_group("H", bdi.get("H"), [
    (0, "Tôi vẫn thích những người khác", "I am still interested in other people"),
    (1, "Hiện nay tôi ít hứng thú với những người khác", "Now, I am less interested in others"),
    (2, "Tôi mất hết cảm giác với những người khác và tôi không cảm thấy gì về họ cả", "I lost all my interest in others and I don't feel anything for them"),
    (3, "Tôi mất hết cảm giác với những người khác và tôi không quan tâm về nó", "I lost all my interest in others and I don't care about it"),
])}
{_bdi_group("I", bdi.get("I"), [
    (0, "Tôi vẫn có thể đưa ra quyết định", "I am still capable to take decisions"),
    (1, "Tôi đang cố tránh đưa ra quyết định", "I am trying to avoid taking decisions."),
    (2, "Thật khó để đưa ra quyết định", "It is so hard to take decisions"),
    (3, "Tôi không thể đưa ra quyết định", "I am so uncapable to take decisions"),
])}
{_bdi_group("J", bdi.get("J"), [
    (0, "Tôi không cảm thấy mình xấu xí", "I don't have the feeling that I look ugly."),
    (1, "Tôi sợ già", "I am afraid to look old."),
    (2, "Tôi cảm thấy có gì đó về ngoại hình khiến tôi trở nên thật xấu xí", "I feel that there is something in my appearance that make me look really ugly"),
    (3, "Tôi cảm thấy mình trông thật tệ", "I feel that I look bad."),
])}
{_bdi_group("K", bdi.get("K"), [
    (0, "Tôi làm việc dễ dàng như trước", "I work as easy as before."),
    (1, "Tôi cần một chút nỗ lực", "I need to do some effort."),
    (2, "Tôi cần rất nhiều nỗ lực mà không làm được gì", "I need to do a lot of effort to do anything."),
    (3, "Tôi không thể làm gì kể cả việc nhỏ nhất", "I am so uncapable to do the smallest job."),
])}
{_bdi_group("L", bdi.get("L"), [
    (0, "Tôi không mệt mỏi như mọi khi", "I am not so tired like usual."),
    (1, "Tôi thấy mệt mỏi rất dễ dàng", "I get tired so easily."),
    (2, "Không làm gì cũng khiến tôi mệt mỏi", "Doing anything makes me tired."),
    (3, "Tôi không thể làm bất cứ công việc gì", "I am not able to do anywork."),
])}
{_bdi_group("M", bdi.get("M"), [
    (0, "Tôi ăn ngon miệng", "I have a good appetite."),
    (1, "Tôi không thấy ngon miệng như mọi khi", "I don't have a good appetite like usual."),
    (2, "Bữa ăn của tôi tệ hơn trước rất nhiều", "My appetite is much worse."),
    (3, "Tôi không cảm thấy ngon miệng chút nào", "I lost my appetite."),
])}

\vspace{{8pt}}
\begin{{flushright}}
\textbf{{KẾT QUẢ/ \textit{{RESULTS}}:}} (Điểm BDI: \textbf{{{_tex_esc(bdi.get("tongDiemBdi"))}}})\\
\textbf{{0 đến 3: không có trầm cảm/ \textit{{0 to 3: no depression}}}}\\
\textbf{{4 đến 7: trầm cảm nhẹ/ \textit{{4 to 7: mild depression}}}}\\
\textbf{{8 đến 15: trầm cảm ở mức độ vừa/ \textit{{8 to 15: moderate depression intensity}}}}\\
\textbf{{Từ 16 trở lên: trầm cảm nặng/ \textit{{16 and above: severe depression}}}}
\end{{flushright}}
{_page_footer(doc_code, 11)}
\newpage

% ======================== TRANG 12 / PAGE 19 ========================
\begin{{center}}
  {{\Large \textbf{{Phần bác sỹ điền}}}}\\[2pt]
  {{\normalsize \textbf{{Part to be field by the physician}}}}
\end{{center}}
\vspace{{4pt}}
\textbf{{Bác sỹ điều trị/ \textit{{Physician}}:}} {_dot_val(kham_cg.get("bacSyDieuTri") or header.get("bacSyDieuTriDau"))}\\[3pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}X X@{{}}}}
\textbf{{Ngày/ \textit{{Date}}:}} {_dot_val(kham_cg.get("ngayKham") or header.get("ngayKhamDau"))} &
\quad \textbf{{Giờ/ \textit{{Time}}:}} {_dot_val(kham_cg.get("gioKham"))}
\end{{tabularx}}\\[8pt]

\begin{{center}}
\IfFileExists{{{img_p12_ant_post}}}{{\includegraphics[height=17.5cm,keepaspectratio]{{{img_p12_ant_post}}}}}{{\fbox{{\parbox[c][16cm][c]{{12cm}}{{\centering Sơ đồ cảm giác toàn thân (Mặt trước \& Mặt sau)}}}}}}
\end{{center}}
{_page_footer(doc_code, 12)}
\newpage

% ======================== TRANG 13 / PAGE 19 ========================
\begin{{center}}
  {{\Large \textbf{{Sơ đồ cảm giác toàn thân (Tư thế nghiêng)}}}}\\[2pt]
  {{\normalsize \textbf{{Full Body Sensory Profile (Lateral View)}}}}
\end{{center}}
\vspace{{8pt}}

\begin{{center}}
\IfFileExists{{{img_p13_lateral}}}{{\includegraphics[height=17.5cm,keepaspectratio]{{{img_p13_lateral}}}}}{{\fbox{{\parbox[c][16cm][c]{{12cm}}{{\centering Sơ đồ cảm giác toàn thân (Tư thế nghiêng)}}}}}}
\end{{center}}
{_page_footer(doc_code, 13)}
\newpage

% ======================== TRANG 14 / PAGE 19 ========================
\begin{{center}}
  {{\Large \textbf{{Sơ đồ khám cảm giác cục bộ}}}}\\[2pt]
  {{\normalsize \textbf{{Focal Sensory Examination Maps (Face, Hands, Perineal)}}}}
\end{{center}}
\vspace{{8pt}}

\begin{{center}}
\IfFileExists{{{img_p14_focal}}}{{\includegraphics[width=0.96\textwidth,height=17.5cm,keepaspectratio]{{{img_p14_focal}}}}}{{\fbox{{\parbox[c][16cm][c]{{12cm}}{{\centering Sơ đồ khám cảm giác cục bộ}}}}}}
\end{{center}}
{_page_footer(doc_code, 14)}
\newpage

% ======================== TRANG 15 / PAGE 19 ========================
{{\large \textbf{{Observation/ Thông tin quan sát :/}}}}\\[6pt]
{_dot_val(qs_dt.get("thongTinQuanSat"))}\\[6cm]

\begin{{tabularx}}{{\textwidth}}{{|p{{0.28\textwidth}}|p{{0.12\textwidth}}|p{{0.13\textwidth}}|p{{0.22\textwidth}}|X|}}
\hline
\textbf{{Điều trị}}\newline\textit{{Treatments}} &
\textbf{{Ngày}}\newline\textit{{Date}} &
\textbf{{Thời gian}}\newline\textit{{Duration}} &
\textbf{{Khả năng thích ứng của NB}}\newline\textit{{Tolerability}} &
\textbf{{Tác dụng}}\newline\textit{{Effect}} \\
\hline
{dt_table_body}
\end{{tabularx}}
{_page_footer(doc_code, 15)}
\newpage

% ======================== TRANG 16 / PAGE 19 ========================
{{\large \textbf{{TỔNG HỢP KẾT QUẢ/ \textit{{SYNTHESIS:}}}}}}\\[6pt]
\textbf{{Chẩn đoán mức độ tổn thương dựa trên đo lường/ \textit{{Topographic diagnostic of the lesion level:}}}}\\[4pt]
{_dot_val(th_kq.get("chanDoanMucDoTonThuong"))}\\[18pt]

\textbf{{Chẩn đoán căn nguyên/ \textit{{Diagnostic Etiology:}}}}\\[4pt]
{_dot_val(th_kq.get("chanDoanCanNguyen"))}\\[18pt]

\textbf{{Đau khó chịu nhất hoặc vị trí đau xác định là/ \textit{{The most annoying pain or target pain:}}}}\\[4pt]
{_dot_val(th_kq.get("dauKhoChiuNhat"))}\\[20pt]

\textbf{{Yếu tố căn nguyên/ \textit{{Etiological factor}}:}}\\[4pt]
\textbf{{Yếu tố căn nguyên/ \textit{{Etiological factor}}:}} {_dot_val(yt_cn.get("yeuToChung"))}\\[5pt]
\textbf{{Nhiễm trùng/ \textit{{Infectious}}:}} {_dot_val(yt_cn.get("nhiemTrung"))}\\[5pt]
\textbf{{Chấn thương/ \textit{{Traumatic}}:}} {_dot_val(yt_cn.get("chanThuong"))}\\[5pt]
\textbf{{Mạch máu/ \textit{{Vascular}}:}} {_dot_val(yt_cn.get("machMau"))}\\[5pt]
\textbf{{Chuyển hóa/ \textit{{Metabolic}}:}} {_dot_val(yt_cn.get("chuyenHoa"))}\\[5pt]
\textbf{{Viêm nhiễm/ \textit{{Inflammatory}}:}} {_dot_val(yt_cn.get("viemNhiem"))}\\[5pt]
\textbf{{Nhiễm độc/ \textit{{Toxic}}:}} {_dot_val(yt_cn.get("nhiemDoc"))}\\[5pt]
\textbf{{Khác/ \textit{{Other}}:}} {_dot_val(yt_cn.get("khac"))}
{_page_footer(doc_code, 16)}
\newpage

% ======================== TRANG 17 / PAGE 19 ========================
{{\large \textbf{{ĐIỀU TRỊ CÓ XÂM LẤN/ \textit{{INVASIVE TREATMENT}}}}}}\\[4pt]
\textbf{{Nếu thủ thuật có xâm lấn được đề xuất/ \textit{{If an invasive procedure is proposed}}}}\\[6pt]
\textbf{{Loại thủ thuật/ \textit{{Type of procedure}}:}} {_dot_val(dt_xl.get("loaiThuThuat"))}\\[4pt]
\textbf{{Mức độ/ \textit{{Level}}:}} {_dot_val(dt_xl.get("mucDo"))}\\[4pt]
\textbf{{Loại block/ \textit{{Type of block}}:}} {_dot_val(dt_xl.get("loaiBlock"))}\\[4pt]
\textbf{{Side:}} {_dot_val(dt_xl.get("side"))}\\[4pt]
\textbf{{Mã ICD 10:}} {_dot_val(dt_xl.get("maIcd10"))}\\[4pt]
\textbf{{Mã CPT:}} {_dot_val(dt_xl.get("maCpt"))}\\[4pt]
\begin{{tabularx}}{{\textwidth}}{{@{{}}X X@{{}}}}
\textbf{{Ngày/ \textit{{Date}}:}} {_dot_val(dt_xl.get("ngay"))} &
\quad \textbf{{Giờ/ \textit{{Time}}:}} {_dot_val(dt_xl.get("gio"))}
\end{{tabularx}}\\[8pt]

{_chk(cam_ket.get("loiIchNguyCo"))} \textbf{{Thông tin về lợi ích và nguy cơ đã được giải thích cho người bệnh}}\\
\hspace{{1.6em}}\textit{{Oral Information Benefits risks}}\\[4pt]
{_chk(cam_ket.get("huongDanNhapVien"))} \textbf{{Hướng dẫn người bệnh về thủ tục nhập viện}}\\
\hspace{{1.6em}}\textit{{Patient instructions for the admission}}\\[4pt]
{_chk(cam_ket.get("huongDanGia"))} \textbf{{Hướng dẫn người bệnh về giá Information concerning price}}\\
\hspace{{1.6em}}\textit{{Information concerning price}}\\[4pt]
{_chk(cam_ket.get("thongTinGhiChep"))} \textbf{{Thông tin đã được ghi chép}}\\
\hspace{{1.6em}}\textit{{Written information}}\\[14pt]

\begin{{center}}
  {{\large \textbf{{PHIẾU CAM KẾT ĐƯỢC KÝ VÀO NGÀY LÀM THỦ THUẬT}}}}\\[2pt]
  \textbf{{\textit{{CONSENT WILL BE SIGN THE DAY OF THE PROCEDURE}}}}
\end{{center}}
\vspace{{8pt}}
{{\large \textbf{{Báo cáo thủ thuật/ \textit{{Procedure Report:}}}}}}\\[6pt]
{_dot_val(dt_xl.get("baoCaoThuThuat"))}
{_page_footer(doc_code, 17)}
\newpage

% ======================== TRANG 18 / PAGE 19 ========================
{{\large \textbf{{CHẨN ĐOÁN ĐỊNH HƯỚNG/ \textit{{DIAGNOSTIC ORIENTATION:}}}}}}\\[6pt]
\textbf{{- Đau TK ngoại biên/ \textit{{Peripheral neuropathic pain:}}}}\\[3pt]
\hspace{{1.2em}}{_chk(nb_dh.get("duoiDa"))} \textbf{{TK dưới da/ \textit{{Superficial shoot skin}}}} \hspace{{2em}}
{_chk(nb_dh.get("trucTk"))} \textbf{{Trục TK/ \textit{{Troncular}}}} \hspace{{2em}}
{_chk(nb_dh.get("reTk"))} \textbf{{Rễ TK/ \textit{{Radicular}}}}\\[6pt]

\textbf{{- Đau TK trung ương/ \textit{{Central Neuropathic pain:}}}}\\[3pt]
\hspace{{1.2em}}{_chk(tu_dh.get("tuySong"))} \textbf{{Tủy sống/ \textit{{Medullar}}}} \hspace{{3em}}
{_chk(tu_dh.get("canhTuySong"))} \textbf{{Cạnh tủy sống/ \textit{{Supra-medullar}}}}\\[10pt]

{{\large \textbf{{TỔNG HỢP/ \textit{{SYNTHESIS:}}}}}}\\[4pt]
\textbf{{Đánh giá yêu cầu của người bệnh/ \textit{{Evaluation of the patient request}}}}\\[4pt]
\textbf{{- Ưu tiên của người bệnh là gì? \textit{{What is the patient priority?}}}}\\[3pt]
{_dot_val(cd_dh.get("uuTienNguoiBenh"))}\\[12pt]

\textbf{{- Mức độ cải thiện chung mà người bệnh có thể chấp nhận? Tỷ lệ cải thiện}}\\
\textit{{What level of overall improvement is he ready to accept? Percentage of amelioration:}}\\[3pt]
{_dot_val(cd_dh.get("mucDoCaiThienChapNhan"))}\\[12pt]

\textbf{{- Thái độ của NB đối với các phương pháp điều trị đặc biệt? (Thuốc chống trầm cảm hoặc suy nhược):}}\\
\textit{{What is his attitude regarding a specific treatment? (Antiepileptic or antidepressant):}}\\[3pt]
{_dot_val(cd_dh.get("thaiDoVoiDieuTriDacBiet"))}\\[12pt]

\textbf{{Đề xuất kế hoạch/ \textit{{Strategy proposed:}}}}\\[3pt]
{_dot_val(cd_dh.get("deXuatKeHoach"))}\\[16pt]

\textbf{{Lợi ích/ \textit{{Benefits}}:}} {_dot_val(cd_dh.get("loiIch"))}\\[4pt]
\textbf{{Tỷ lệ thành công/ \textit{{Success rate}}:}} {_dot_val(cd_dh.get("tyLeThanhCong"))} \%\\[4pt]
\textbf{{Nguy cơ/ \textit{{Risks}}:}} {_dot_val(cd_dh.get("nguyCo"))}\\[8pt]
\textbf{{Người bệnh đồng ý/ \textit{{Patient acceptance}}:}} \hspace{{2em}}
{_chk(str(cd_dh.get("nguoiBenhDongY")).upper() == "YES")} \textbf{{Có/ \textit{{Yes}}}} \hspace{{3em}}
{_chk(str(cd_dh.get("nguoiBenhDongY")).upper() == "NO")} \textbf{{Không/ \textit{{No}}}}
{_page_footer(doc_code, 18)}
\newpage

% ======================== TRANG 19 / PAGE 19 ========================
{{\large \textbf{{THEO DÕI/ \textit{{FOLLOW UP}}}}}}\\[6pt]
{follow_up_tex}
{_page_footer(doc_code, 19)}

\end{{document}}
"""

