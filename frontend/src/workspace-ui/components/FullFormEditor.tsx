import React, { useState } from 'react';
import {
  Activity,
  ClipboardCheck,
  FileCheck2,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserCheck,
} from 'lucide-react';
import {
  MedicalRecordJsonData,
  MedicalTemplateSchema,
} from '@medical-forms/types/form.types';
import { safeText } from '@medical-forms/sections/PainRecordSection';

interface FullFormEditorProps {
  data: MedicalRecordJsonData;
  schema: MedicalTemplateSchema;
  onUpdateData: (updater: (prev: MedicalRecordJsonData) => MedicalRecordJsonData) => void;
}

type SectionTab = 'hanh-chinh' | 'quan-ly' | 'chan-doan' | 'benh-an' | 'tong-ket';

const FieldInput: React.FC<{
  label: string;
  value?: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  mono?: boolean;
}> = ({ label, value, onChange, placeholder, className = '', mono = false }) => (
  <div className={className}>
    <label className="block text-[11px] font-medium text-slate-600 mb-1">{label}</label>
    <input
      type="text"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition ${
        mono ? 'font-mono' : ''
      }`}
    />
  </div>
);

const FieldTextarea: React.FC<{
  label: string;
  value?: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}> = ({ label, value, onChange, rows = 3, placeholder, className = '' }) => (
  <div className={className}>
    <label className="block text-[11px] font-medium text-slate-600 mb-1">{label}</label>
    <textarea
      rows={rows}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition leading-relaxed"
    />
  </div>
);

export const FullFormEditor: React.FC<FullFormEditorProps> = ({
  data,
  schema,
  onUpdateData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SectionTab>('hanh-chinh');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { config } = schema;
  const isPainRecord = config.headerVariant === 'pain_record' || schema.id === '30_benh_an_dau';
  const isOutpatient = config.headerVariant === 'outpatient';
  const isPediatric = config.adminVariant === 'pediatric';
  const isSurgical = config.diagnosisVariant === 'surgical' || config.hasSurgicalBlock;
  const isYHCT = config.hasTraditionalMedicine || config.diagnosisVariant === 'yhct_dual';

  const header = data.header || {};
  const hc = data.hanhChinh || {};

  if (isPainRecord) {
    const tsb = data.tienSuBenh || {};
    const bsd = data.benhSuDau || {};
    const vas = data.doCuongDoDauVas || {};
    const dtvsd = data.dienTienVaSoDo || {};
    const dn4 = data.cauHoiDn4 || {};
    const bud = data.tieuChuanBudapest || {};
    const beck = data.thangTramCamBeck || {};
    const kcg = data.khamCamGiacBacSy || {};
    const qsvdt = data.quanSatVaDieuTri || {};
    const thkq = data.tongHopKetQua || {};
    const dtxl = data.dieuTriXamLan || {};
    const cddh = data.chanDoanDinhHuong || {};

    const patchBranch = (branchKey: string, patch: Record<string, any>) =>
      onUpdateData((prev) => ({
        ...prev,
        [branchKey]: { ...(prev[branchKey] || {}), ...patch },
      }));

    return (
      <div className="flex flex-col h-full overflow-y-auto p-3 space-y-4 bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5 shadow-sm">
          <div className="text-xs font-bold text-teal-800 uppercase border-b pb-1.5">
            Trang 1: Hành chính & Thông tin người bệnh (VM - BS - V1 - 012)
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <FieldInput
              label="Họ và tên người bệnh"
              value={safeText(hc.hoVaTen || header.nguoiBenh)}
              onChange={(v) => {
                patchBranch('hanhChinh', { hoVaTen: v });
                patchBranch('header', { nguoiBenh: v });
              }}
            />
            <FieldInput
              label="Mã người bệnh (PID)"
              value={safeText(header.maNguoiBenh || header.pid)}
              onChange={(v) => patchBranch('header', { maNguoiBenh: v })}
              mono
            />
            <FieldInput
              label="Bác sỹ điều trị đau"
              value={safeText(header.bacSyDieuTriDau)}
              onChange={(v) => patchBranch('header', { bacSyDieuTriDau: v })}
            />
            <FieldInput
              label="Điều dưỡng"
              value={safeText(header.dieuDuong)}
              onChange={(v) => patchBranch('header', { dieuDuong: v })}
            />
            <FieldInput
              label="Ngày khám đầu"
              value={safeText(header.ngayKhamDau)}
              onChange={(v) => patchBranch('header', { ngayKhamDau: v })}
            />
            <FieldInput
              label="Ngày sinh (DD/MM/YYYY)"
              value={safeText(hc.sinhNgay)}
              onChange={(v) => patchBranch('hanhChinh', { sinhNgay: v })}
            />
            <FieldInput
              label="Tuổi"
              value={safeText(hc.tuoi)}
              onChange={(v) => patchBranch('hanhChinh', { tuoi: v })}
            />
            <FieldInput
              label="Di động / Điện thoại"
              value={safeText(hc.diDong || hc.dienThoai)}
              onChange={(v) => patchBranch('hanhChinh', { diDong: v })}
            />
            <FieldInput
              label="Nghề nghiệp"
              value={safeText(hc.ngheNghiep)}
              onChange={(v) => patchBranch('hanhChinh', { ngheNghiep: v })}
            />
            <FieldInput
              label="Tình trạng hôn nhân"
              value={safeText(hc.tinhTrangHonNhan)}
              onChange={(v) => patchBranch('hanhChinh', { tinhTrangHonNhan: v })}
            />
          </div>
          <FieldInput
            label="Hội chứng chính (Main syndrome)"
            value={safeText(header.hoiChungChinh)}
            onChange={(v) => patchBranch('header', { hoiChungChinh: v })}
          />
          <FieldInput
            label="Địa chỉ hiện tại"
            value={safeText(hc.diaChi)}
            onChange={(v) => patchBranch('hanhChinh', { diaChi: v })}
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5 shadow-sm">
          <div className="text-xs font-bold text-teal-800 uppercase border-b pb-1.5">
            Trang 2 - 4: Tiền sử bệnh & Bệnh sử đau
          </div>
          <FieldTextarea
            label="Tiền sử dị ứng (Trang 2)"
            rows={2}
            value={safeText(tsb.diUng)}
            onChange={(v) => patchBranch('tienSuBenh', { diUng: v })}
          />
          <FieldTextarea
            label="Can thiệp phẫu thuật đã từng làm (Trang 2)"
            rows={2}
            value={safeText(tsb.phauThuatDaLam)}
            onChange={(v) => patchBranch('tienSuBenh', { phauThuatDaLam: v })}
          />
          <FieldTextarea
            label="Các bệnh lý đang điều trị & Thuốc đang dùng (Trang 2)"
            rows={2}
            value={safeText(tsb.tenThuocVaLieuDung)}
            onChange={(v) => patchBranch('tienSuBenh', { tenThuocVaLieuDung: v })}
          />
          <FieldTextarea
            label="Xét nghiệm cận lâm sàng (MRI, CT, máu...) & kết quả (Trang 2)"
            rows={2}
            value={safeText(tsb.xetNghiemCanLamSang)}
            onChange={(v) => patchBranch('tienSuBenh', { xetNghiemCanLamSang: v })}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <FieldInput
              label="Vị trí đau ban đầu (Trang 3)"
              value={safeText(bsd.viTriBanDau)}
              onChange={(v) => patchBranch('benhSuDau', { viTriBanDau: v })}
            />
            <FieldInput
              label="Vị trí lan tỏa (Trang 3)"
              value={safeText(bsd.viTriLanToa)}
              onChange={(v) => patchBranch('benhSuDau', { viTriLanToa: v })}
            />
          </div>
          <FieldTextarea
            label="Sự tiến triển của cơn đau (Trang 3)"
            rows={2}
            value={safeText(bsd.suTienTrien)}
            onChange={(v) => patchBranch('benhSuDau', { suTienTrien: v })}
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5 shadow-sm">
          <div className="text-xs font-bold text-teal-800 uppercase border-b pb-1.5">
            Trang 5 - 11: Thang VAS, Sơ đồ đau, DN4, Budapest & Thang Beck (BDI)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <FieldInput
              label="VAS Hiện tại (0-10)"
              value={safeText(vas.dauHienTai)}
              onChange={(v) => patchBranch('doCuongDoDauVas', { dauHienTai: Number(v) || 0 })}
            />
            <FieldInput
              label="VAS Cao nhất 4 tuần"
              value={safeText(vas.dauNhat4Tuan)}
              onChange={(v) => patchBranch('doCuongDoDauVas', { dauNhat4Tuan: Number(v) || 0 })}
            />
            <FieldInput
              label="VAS TB 4 tuần"
              value={safeText(vas.trungBinh4Tuan)}
              onChange={(v) => patchBranch('doCuongDoDauVas', { trungBinh4Tuan: Number(v) || 0 })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <FieldInput
              label="Điểm Score Diễn tiến đau (Trang 7)"
              value={safeText(dtvsd.diemScore)}
              onChange={(v) => patchBranch('dienTienVaSoDo', { diemScore: v })}
            />
            <FieldInput
              label="Tổng điểm DN4 (/10 - Trang 8)"
              value={safeText(dn4.tongDiem)}
              onChange={(v) => patchBranch('cauHoiDn4', { tongDiem: v })}
            />
            <FieldInput
              label="Kết luận Budapest (YES/NO - Trang 9)"
              value={safeText(bud.ketLuanBudapest)}
              onChange={(v) => patchBranch('tieuChuanBudapest', { ketLuanBudapest: v })}
            />
            <FieldInput
              label="Tổng điểm BDI Beck (Trang 11)"
              value={safeText(beck.tongDiemBdi)}
              onChange={(v) => patchBranch('thangTramCamBeck', { tongDiemBdi: v })}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5 shadow-sm">
          <div className="text-xs font-bold text-teal-800 uppercase border-b pb-1.5">
            Trang 12 - 19: Khám Cảm giác Bác sỹ, Quan sát, Tổng hợp & Can thiệp xâm lấn
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <FieldInput
              label="Bác sỹ khám cảm giác (Trang 12)"
              value={safeText(kcg.bacSyDieuTri)}
              onChange={(v) => patchBranch('khamCamGiacBacSy', { bacSyDieuTri: v })}
            />
            <FieldInput
              label="Giờ khám (Trang 12)"
              value={safeText(kcg.gioKham)}
              onChange={(v) => patchBranch('khamCamGiacBacSy', { gioKham: v })}
            />
          </div>
          <FieldTextarea
            label="Thông tin quan sát lâm sàng (Observation - Trang 15)"
            rows={3}
            value={safeText(qsvdt.thongTinQuanSat)}
            onChange={(v) => patchBranch('quanSatVaDieuTri', { thongTinQuanSat: v })}
          />
          <FieldTextarea
            label="Chẩn đoán mức độ tổn thương (Trang 16)"
            rows={2}
            value={safeText(thkq.chanDoanMucDoTonThuong)}
            onChange={(v) => patchBranch('tongHopKetQua', { chanDoanMucDoTonThuong: v })}
          />
          <FieldTextarea
            label="Chẩn đoán căn nguyên (Trang 16)"
            rows={2}
            value={safeText(thkq.chanDoanCanNguyen)}
            onChange={(v) => patchBranch('tongHopKetQua', { chanDoanCanNguyen: v })}
          />
          <FieldInput
            label="Loại thủ thuật xâm lấn (Trang 17)"
            value={safeText(dtxl.loaiThuThuat)}
            onChange={(v) => patchBranch('dieuTriXamLan', { loaiThuThuat: v })}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <FieldInput
              label="Mã ICD-10 (Trang 17)"
              value={safeText(dtxl.maIcd10)}
              onChange={(v) => patchBranch('dieuTriXamLan', { maIcd10: v })}
              mono
            />
            <FieldInput
              label="Mã CPT (Trang 17)"
              value={safeText(dtxl.maCpt)}
              onChange={(v) => patchBranch('dieuTriXamLan', { maCpt: v })}
              mono
            />
          </div>
          <FieldTextarea
            label="Báo cáo thủ thuật (Trang 17)"
            rows={3}
            value={safeText(dtxl.baoCaoThuThuat)}
            onChange={(v) => patchBranch('dieuTriXamLan', { baoCaoThuThuat: v })}
          />
          <FieldTextarea
            label="Đề xuất kế hoạch điều trị (Strategy proposed - Trang 18)"
            rows={2}
            value={safeText(cddh.deXuatKeHoach)}
            onChange={(v) => patchBranch('chanDoanDinhHuong', { deXuatKeHoach: v })}
          />
        </div>
      </div>
    );
  }
  const diaChi = hc.diaChi || {};
  const denKham = hc.denKhamLuc || {};
  const ql = data.quanLyNguoiBenh || {};
  const vaoVien = ql.vaoVien || {};
  const vaoKhoa = ql.vaoKhoa || {};
  const chuyenKhoaList: any[] = Array.isArray(ql.chuyenKhoa) ? ql.chuyenKhoa : [];
  const chuyenVien = ql.chuyenVien || {};
  const raVienQL = ql.raVien || {};

  const cd = data.chanDoan || {};
  const ncd = cd.noiChuyenDen || {};
  const kkb = cd.kkbCapCuu || {};
  const vkh = cd.khiVaoKhoaDieuTri || {};
  const rvCD = cd.raVien || {};

  const ttrv = data.tinhTrangRaVien || {};
  const tuVong = ttrv.tuVong || {};

  const ba = data.benhAn || {};
  const hoiBenh = ba.hoiBenh || {};
  const dacDiem = hoiBenh.dacDiemLienQuan || {};
  const sinhTruong = hoiBenh.quaTrinhSinhTruong || {};
  const khamBenh = ba.khamBenh || {};
  const sinhHieu = khamBenh.sinhHieu || {};
  const coQuan = khamBenh.coQuan || {};
  const cdKhoa = ba.chanDoanKhoa || {};
  const yhct = ba.yhct || {};
  const cdYHCT = yhct.chanDoanYHCT || {};
  const dtYHCT = yhct.dieuTriYHCT || {};

  const tk = data.tongKet || {};
  const hoSo = tk.hoSoPhimAnh || {};
  const cdRaVienTK = tk.chanDoanRaVien || {};
  const phauThuatList: any[] = Array.isArray(tk.phauThuatList) ? tk.phauThuatList : [];

  // Helpers để cập nhật từng nhánh JSON sạch sẽ
  const setHeader = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({ ...prev, header: { ...prev.header, ...patch } }));

  const setHC = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({ ...prev, hanhChinh: { ...prev.hanhChinh, ...patch } }));

  const setDiaChi = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({
      ...prev,
      hanhChinh: {
        ...prev.hanhChinh,
        diaChi: { ...(prev.hanhChinh?.diaChi || {}), ...patch },
      },
    }));

  const setQL = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({
      ...prev,
      quanLyNguoiBenh: { ...prev.quanLyNguoiBenh, ...patch },
    }));

  const setCD = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({ ...prev, chanDoan: { ...prev.chanDoan, ...patch } }));

  const setTTRV = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({
      ...prev,
      tinhTrangRaVien: { ...prev.tinhTrangRaVien, ...patch },
    }));

  const setBA = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({ ...prev, benhAn: { ...prev.benhAn, ...patch } }));

  const setHoiBenh = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({
      ...prev,
      benhAn: {
        ...prev.benhAn,
        hoiBenh: { ...(prev.benhAn?.hoiBenh || {}), ...patch },
      },
    }));

  const setKhamBenh = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({
      ...prev,
      benhAn: {
        ...prev.benhAn,
        khamBenh: { ...(prev.benhAn?.khamBenh || {}), ...patch },
      },
    }));

  const setSinhHieu = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({
      ...prev,
      benhAn: {
        ...prev.benhAn,
        khamBenh: {
          ...(prev.benhAn?.khamBenh || {}),
          sinhHieu: { ...(prev.benhAn?.khamBenh?.sinhHieu || {}), ...patch },
        },
      },
    }));

  const setCoQuan = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({
      ...prev,
      benhAn: {
        ...prev.benhAn,
        khamBenh: {
          ...(prev.benhAn?.khamBenh || {}),
          coQuan: { ...(prev.benhAn?.khamBenh?.coQuan || {}), ...patch },
        },
      },
    }));

  const setYHCT = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({
      ...prev,
      benhAn: {
        ...prev.benhAn,
        yhct: { ...(prev.benhAn?.yhct || {}), ...patch },
      },
    }));

  const setTK = (patch: Record<string, any>) =>
    onUpdateData((prev) => ({ ...prev, tongKet: { ...prev.tongKet, ...patch } }));

  const showAll = searchTerm.trim().length > 0;

  const subTabs: { id: SectionTab; label: string; icon: React.ReactNode; hidden?: boolean }[] = [
    { id: 'hanh-chinh', label: '1. Hành chính', icon: <UserCheck className="w-3.5 h-3.5" /> },
    {
      id: 'quan-ly',
      label: '2. Quản lý NB',
      icon: <ClipboardCheck className="w-3.5 h-3.5" />,
      hidden: isOutpatient,
    },
    {
      id: 'chan-doan',
      label: '3. Chẩn đoán & Ra viện',
      icon: <Activity className="w-3.5 h-3.5" />,
      hidden: isOutpatient,
    },
    { id: 'benh-an', label: '4. A. Bệnh án & Khám', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: 'tong-ket', label: '5. B. Tổng kết', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-navigation bar & Search */}
      <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 space-y-2">
        <div className="flex items-center gap-1 flex-wrap">
          {subTabs
            .filter((t) => !t.hidden)
            .map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setActiveSubTab(t.id);
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition ${
                  !showAll && activeSubTab === t.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Bấm vào các mục ở trên hoặc gõ bất kỳ để hiện tất cả các mục cùng lúc..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded-md border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* ==================== MỤC 1: HEADER & I. HÀNH CHÍNH ==================== */}
        {(showAll || activeSubTab === 'hanh-chinh') && (
          <div className="space-y-4">
            {/* Khối Tiêu đề bệnh án */}
            <section className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5">
              <h3 className="text-xs font-bold uppercase text-teal-800 border-b border-slate-200 pb-1">
                Tiêu đề &amp; Mã hồ sơ (Header)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <FieldInput
                  label="Sở Y tế / Bộ Y tế"
                  value={header.soYTe}
                  onChange={(v) => setHeader({ soYTe: v })}
                />
                <FieldInput
                  label="Bệnh viện"
                  value={header.benhVien}
                  onChange={(v) => setHeader({ benhVien: v })}
                />
                <FieldInput
                  label="Khoa"
                  value={header.khoa}
                  onChange={(v) => setHeader({ khoa: v })}
                />
                <FieldInput
                  label="Buồng"
                  value={header.buong}
                  onChange={(v) => setHeader({ buong: v })}
                />
                <FieldInput
                  label="Giường"
                  value={header.giuong}
                  onChange={(v) => setHeader({ giuong: v })}
                />
                <FieldInput
                  label="Mã số biểu mẫu (MS)"
                  value={header.maSo}
                  onChange={(v) => setHeader({ maSo: v })}
                  mono
                />
                <FieldInput
                  label="Số lưu trữ"
                  value={header.soLuuTru}
                  onChange={(v) => setHeader({ soLuuTru: v })}
                  mono
                />
                <FieldInput
                  label="Mã Y tế (Mã YT)"
                  value={header.maYT}
                  onChange={(v) => setHeader({ maYT: v })}
                  mono
                />
                <FieldInput
                  label="Tên tiêu đề Bệnh án"
                  value={header.tenBenhAn}
                  onChange={(v) => setHeader({ tenBenhAn: v })}
                />
                {isOutpatient && (
                  <FieldInput
                    label="Số ngoại trú"
                    value={header.soNgoaiTru}
                    onChange={(v) => setHeader({ soNgoaiTru: v })}
                    mono
                  />
                )}
                {isYHCT && (
                  <>
                    <FieldInput
                      label="Mã người bệnh (YHCT)"
                      value={header.maNguoiBenh}
                      onChange={(v) => setHeader({ maNguoiBenh: v })}
                      mono
                    />
                    <FieldInput
                      label="Số vào viện (YHCT)"
                      value={header.soVaoVien}
                      onChange={(v) => setHeader({ soVaoVien: v })}
                      mono
                    />
                  </>
                )}
              </div>
            </section>

            {/* Khối I. Hành chính */}
            <section className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5">
              <h3 className="text-xs font-bold uppercase text-teal-800 border-b border-slate-200 pb-1">
                I. Hành chính (Đầy đủ các trường)
              </h3>
              <div className="grid grid-cols-12 gap-2.5">
                <FieldInput
                  label="1. Họ và tên (In hoa)"
                  value={hc.hoVaTen}
                  onChange={(v) => setHC({ hoVaTen: v.toUpperCase() })}
                  className="col-span-12 sm:col-span-6"
                />
                <FieldInput
                  label="2. Sinh ngày (DD/MM/YYYY)"
                  value={hc.sinhNgay}
                  onChange={(v) => setHC({ sinhNgay: v })}
                  placeholder="15/08/1968"
                  className="col-span-6 sm:col-span-4"
                  mono
                />
                <FieldInput
                  label="Tuổi (2 ô)"
                  value={hc.tuoi}
                  onChange={(v) => setHC({ tuoi: v })}
                  className="col-span-6 sm:col-span-2"
                  mono
                />

                <div className="col-span-6 sm:col-span-4">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    3. Giới tính
                  </label>
                  <select
                    value={hc.gioi || 1}
                    onChange={(e) => setHC({ gioi: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                  >
                    <option value={1}>1. Nam</option>
                    <option value={2}>2. Nữ</option>
                  </select>
                </div>

                {!isPediatric && (
                  <>
                    <FieldInput
                      label="4. Nghề nghiệp"
                      value={hc.ngheNghiep}
                      onChange={(v) => setHC({ ngheNghiep: v })}
                      className="col-span-8 sm:col-span-6"
                    />
                    <FieldInput
                      label="Mã nghề (2 ô)"
                      value={hc.maNgheNghiep}
                      onChange={(v) => setHC({ maNgheNghiep: v })}
                      className="col-span-4 sm:col-span-2"
                      mono
                    />
                  </>
                )}

                <FieldInput
                  label="5. Dân tộc"
                  value={hc.danToc}
                  onChange={(v) => setHC({ danToc: v })}
                  className="col-span-8 sm:col-span-4"
                />
                <FieldInput
                  label="Mã DT (2 ô)"
                  value={hc.maDanToc}
                  onChange={(v) => setHC({ maDanToc: v })}
                  className="col-span-4 sm:col-span-2"
                  mono
                />
                <FieldInput
                  label="6. Ngoại kiều / Quốc tịch"
                  value={hc.ngoaiKieu}
                  onChange={(v) => setHC({ ngoaiKieu: v })}
                  className="col-span-8 sm:col-span-4"
                />
                <FieldInput
                  label="Mã NK (2 ô)"
                  value={hc.maNgoaiKieu}
                  onChange={(v) => setHC({ maNgoaiKieu: v })}
                  className="col-span-4 sm:col-span-2"
                  mono
                />

                {/* Địa chỉ */}
                <FieldInput
                  label="7. Số nhà"
                  value={diaChi.soNha}
                  onChange={(v) => setDiaChi({ soNha: v })}
                  className="col-span-4"
                />
                <FieldInput
                  label="Thôn, phố"
                  value={diaChi.thonPho}
                  onChange={(v) => setDiaChi({ thonPho: v })}
                  className="col-span-4"
                />
                <FieldInput
                  label="Xã, phường"
                  value={diaChi.xaPhuong}
                  onChange={(v) => setDiaChi({ xaPhuong: v })}
                  className="col-span-4"
                />
                <FieldInput
                  label="Huyện (Quận, Thị xã)"
                  value={diaChi.huyenQuan}
                  onChange={(v) => setDiaChi({ huyenQuan: v })}
                  className="col-span-8 sm:col-span-4"
                />
                <FieldInput
                  label="Mã Huyện (2 ô)"
                  value={diaChi.maHuyenQuan}
                  onChange={(v) => setDiaChi({ maHuyenQuan: v })}
                  className="col-span-4 sm:col-span-2"
                  mono
                />
                <FieldInput
                  label="Tỉnh, thành phố"
                  value={diaChi.tinhThanhPho}
                  onChange={(v) => setDiaChi({ tinhThanhPho: v })}
                  className="col-span-8 sm:col-span-4"
                />
                <FieldInput
                  label="Mã Tỉnh (2 ô)"
                  value={diaChi.maTinhThanhPho}
                  onChange={(v) => setDiaChi({ maTinhThanhPho: v })}
                  className="col-span-4 sm:col-span-2"
                  mono
                />

                {/* Nếu là Nhi khoa: Thông tin Bố / Mẹ */}
                {isPediatric ? (
                  <>
                    <FieldInput
                      label="7. Họ tên bố"
                      value={hc.hoTenBo}
                      onChange={(v) => setHC({ hoTenBo: v })}
                      className="col-span-4"
                    />
                    <FieldInput
                      label="Trình độ VH bố"
                      value={hc.trinhDoVHBo}
                      onChange={(v) => setHC({ trinhDoVHBo: v })}
                      className="col-span-2"
                    />
                    <FieldInput
                      label="Họ tên mẹ"
                      value={hc.hoTenMe}
                      onChange={(v) => setHC({ hoTenMe: v })}
                      className="col-span-4"
                    />
                    <FieldInput
                      label="Trình độ VH mẹ"
                      value={hc.trinhDoVHMe}
                      onChange={(v) => setHC({ trinhDoVHMe: v })}
                      className="col-span-2"
                    />
                    <FieldInput
                      label="Nghề nghiệp của bố"
                      value={hc.ngheNghiepBo}
                      onChange={(v) => setHC({ ngheNghiepBo: v })}
                      className="col-span-6"
                    />
                    <FieldInput
                      label="Nghề nghiệp của mẹ"
                      value={hc.ngheNghiepMe}
                      onChange={(v) => setHC({ ngheNghiepMe: v })}
                      className="col-span-6"
                    />
                  </>
                ) : (
                  <FieldInput
                    label="8. Nơi làm việc"
                    value={hc.noiLamViec}
                    onChange={(v) => setHC({ noiLamViec: v })}
                    className="col-span-12 sm:col-span-6"
                  />
                )}

                <div className="col-span-12 sm:col-span-6">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    9. Đối tượng
                  </label>
                  <select
                    value={hc.doiTuong || 1}
                    onChange={(e) => setHC({ doiTuong: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                  >
                    <option value={1}>1. BHYT</option>
                    <option value={2}>2. Thu phí</option>
                    <option value={3}>3. Miễn</option>
                    <option value={4}>4. Khác</option>
                  </select>
                </div>

                <FieldInput
                  label="10. BHYT giá trị đến ngày"
                  value={hc.bhytGiaTriDen}
                  onChange={(v) => setHC({ bhytGiaTriDen: v })}
                  className="col-span-6"
                />
                <FieldInput
                  label="Số thẻ BHYT (15 ký tự)"
                  value={hc.soTheBhyt}
                  onChange={(v) => setHC({ soTheBhyt: v })}
                  className="col-span-6"
                  mono
                />

                {isYHCT && (
                  <FieldInput
                    label="11. Số CCCD / Hộ chiếu / Định danh cá nhân"
                    value={hc.soCCCD}
                    onChange={(v) => setHC({ soCCCD: v })}
                    className="col-span-12"
                    mono
                  />
                )}

                <FieldInput
                  label="11. Họ tên, địa chỉ người nhà khi cần báo tin"
                  value={hc.nguoiNha}
                  onChange={(v) => setHC({ nguoiNha: v })}
                  className="col-span-8"
                />
                <FieldInput
                  label="Điện thoại số"
                  value={hc.dienThoaiNguoiNha}
                  onChange={(v) => setHC({ dienThoaiNguoiNha: v })}
                  className="col-span-4"
                  mono
                />

                {isOutpatient && (
                  <>
                    <FieldInput
                      label="12. Đến khám: Giờ"
                      value={denKham.gio}
                      onChange={(v) =>
                        setHC({ denKhamLuc: { ...denKham, gio: v } })
                      }
                      className="col-span-2"
                    />
                    <FieldInput
                      label="Phút"
                      value={denKham.phut}
                      onChange={(v) =>
                        setHC({ denKhamLuc: { ...denKham, phut: v } })
                      }
                      className="col-span-2"
                    />
                    <FieldInput
                      label="Ngày tháng năm"
                      value={denKham.ngay}
                      onChange={(v) =>
                        setHC({ denKhamLuc: { ...denKham, ngay: v } })
                      }
                      className="col-span-4"
                    />
                    <div className="col-span-4">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Nơi giới thiệu
                      </label>
                      <select
                        value={hc.noiGioiThieu || 2}
                        onChange={(e) => setHC({ noiGioiThieu: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                      >
                        <option value={1}>1. Y tế</option>
                        <option value={2}>2. Tự đến</option>
                      </select>
                    </div>
                    <FieldInput
                      label="13. Chẩn đoán của nơi giới thiệu"
                      value={hc.chanDoanNoiGioiThieu}
                      onChange={(v) => setHC({ chanDoanNoiGioiThieu: v })}
                      className="col-span-12"
                    />
                  </>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ==================== MỤC 2: II. QUẢN LÝ NGƯỜI BỆNH ==================== */}
        {!isOutpatient && (showAll || activeSubTab === 'quan-ly') && (
          <section className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
            <h3 className="text-xs font-bold uppercase text-teal-800 border-b border-slate-200 pb-1">
              II. Quản lý người bệnh (Vào viện, Chuyển khoa, Ra viện)
            </h3>

            <div className="grid grid-cols-12 gap-2.5">
              <FieldInput
                label="12. Vào viện: Giờ"
                value={vaoVien.gio}
                onChange={(v) => setQL({ vaoVien: { ...vaoVien, gio: v } })}
                className="col-span-2"
              />
              <FieldInput
                label="Phút"
                value={vaoVien.phut}
                onChange={(v) => setQL({ vaoVien: { ...vaoVien, phut: v } })}
                className="col-span-2"
              />
              <FieldInput
                label="Ngày vào viện"
                value={vaoVien.ngay}
                onChange={(v) => setQL({ vaoVien: { ...vaoVien, ngay: v } })}
                className="col-span-4"
              />
              <div className="col-span-4">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  13. Trực tiếp vào
                </label>
                <select
                  value={ql.trucTiepVao || 1}
                  onChange={(e) => setQL({ trucTiepVao: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                >
                  <option value={1}>1. Cấp cứu</option>
                  <option value={2}>2. KKB</option>
                  <option value={3}>3. Khoa điều trị</option>
                </select>
              </div>

              <div className="col-span-6">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  14. Nơi giới thiệu
                </label>
                <select
                  value={ql.noiGioiThieu || 1}
                  onChange={(e) => setQL({ noiGioiThieu: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                >
                  <option value={1}>1. Cơ quan y tế</option>
                  <option value={2}>2. Tự đến</option>
                  <option value={3}>3. Khác</option>
                </select>
              </div>
              <FieldInput
                label="Vào viện do bệnh này lần thứ"
                value={ql.vaoVienLanThu}
                onChange={(v) => setQL({ vaoVienLanThu: v })}
                className="col-span-6"
              />

              {/* 15. Vào khoa */}
              <FieldInput
                label="15. Vào khoa (Tên khoa)"
                value={vaoKhoa.khoa}
                onChange={(v) => setQL({ vaoKhoa: { ...vaoKhoa, khoa: v } })}
                className="col-span-4"
              />
              <FieldInput
                label="Giờ"
                value={vaoKhoa.gio}
                onChange={(v) => setQL({ vaoKhoa: { ...vaoKhoa, gio: v } })}
                className="col-span-2"
              />
              <FieldInput
                label="Phút"
                value={vaoKhoa.phut}
                onChange={(v) => setQL({ vaoKhoa: { ...vaoKhoa, phut: v } })}
                className="col-span-2"
              />
              <FieldInput
                label="Ngày vào khoa"
                value={vaoKhoa.ngay}
                onChange={(v) => setQL({ vaoKhoa: { ...vaoKhoa, ngay: v } })}
                className="col-span-2"
              />
              <FieldInput
                label="Số ngày ĐTr"
                value={vaoKhoa.soNgayDT}
                onChange={(v) => setQL({ vaoKhoa: { ...vaoKhoa, soNgayDT: v } })}
                className="col-span-2"
              />
            </div>

            {/* 16. Bảng Chuyển khoa động */}
            <div className="p-2.5 bg-white rounded border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  16. Chuyển khoa (Tối đa 3 lần hiển thị trên biểu mẫu)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQL({
                      chuyenKhoa: [
                        ...chuyenKhoaList,
                        { khoa: '', gio: '', phut: '', ngay: '', soNgayDT: '' },
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200"
                >
                  <Plus className="w-3 h-3" />
                  Thêm dòng chuyển khoa
                </button>
              </div>
              {chuyenKhoaList.map((ck, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <FieldInput
                    label={`Khoa chuyển #${idx + 1}`}
                    value={ck.khoa}
                    onChange={(v) => {
                      const next = [...chuyenKhoaList];
                      next[idx] = { ...next[idx], khoa: v };
                      setQL({ chuyenKhoa: next });
                    }}
                    className="col-span-3"
                  />
                  <FieldInput
                    label="Giờ"
                    value={ck.gio}
                    onChange={(v) => {
                      const next = [...chuyenKhoaList];
                      next[idx] = { ...next[idx], gio: v };
                      setQL({ chuyenKhoa: next });
                    }}
                    className="col-span-2"
                  />
                  <FieldInput
                    label="Phút"
                    value={ck.phut}
                    onChange={(v) => {
                      const next = [...chuyenKhoaList];
                      next[idx] = { ...next[idx], phut: v };
                      setQL({ chuyenKhoa: next });
                    }}
                    className="col-span-2"
                  />
                  <FieldInput
                    label="Ngày"
                    value={ck.ngay}
                    onChange={(v) => {
                      const next = [...chuyenKhoaList];
                      next[idx] = { ...next[idx], ngay: v };
                      setQL({ chuyenKhoa: next });
                    }}
                    className="col-span-2"
                  />
                  <FieldInput
                    label="Số ngày"
                    value={ck.soNgayDT}
                    onChange={(v) => {
                      const next = [...chuyenKhoaList];
                      next[idx] = { ...next[idx], soNgayDT: v };
                      setQL({ chuyenKhoa: next });
                    }}
                    className="col-span-2"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setQL({
                        chuyenKhoa: chuyenKhoaList.filter((_, i) => i !== idx),
                      })
                    }
                    className="col-span-1 p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                    title="Xóa dòng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* 17. Chuyển viện & 18. Ra viện */}
            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-4">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  17. Chuyển viện
                </label>
                <select
                  value={chuyenVien.loai || ''}
                  onChange={(e) =>
                    setQL({
                      chuyenVien: {
                        ...chuyenVien,
                        loai: e.target.value ? Number(e.target.value) : null,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                >
                  <option value="">-- Không chuyển viện --</option>
                  <option value={1}>1. Tuyến trên</option>
                  <option value={2}>2. Tuyến dưới</option>
                  <option value={3}>3. Chuyên khoa (CK)</option>
                </select>
              </div>
              <FieldInput
                label="Nơi chuyển đến"
                value={chuyenVien.chuyenDen}
                onChange={(v) =>
                  setQL({ chuyenVien: { ...chuyenVien, chuyenDen: v } })
                }
                className="col-span-8"
              />

              <FieldInput
                label="18. Ra viện: Giờ"
                value={raVienQL.gio}
                onChange={(v) => setQL({ raVien: { ...raVienQL, gio: v } })}
                className="col-span-2"
              />
              <FieldInput
                label="Phút"
                value={raVienQL.phut}
                onChange={(v) => setQL({ raVien: { ...raVienQL, phut: v } })}
                className="col-span-2"
              />
              <FieldInput
                label="Ngày ra viện"
                value={raVienQL.ngay}
                onChange={(v) => setQL({ raVien: { ...raVienQL, ngay: v } })}
                className="col-span-3"
              />
              <div className="col-span-3">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Hình thức ra viện
                </label>
                <select
                  value={raVienQL.hinhThuc || 1}
                  onChange={(e) =>
                    setQL({ raVien: { ...raVienQL, hinhThuc: Number(e.target.value) } })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                >
                  <option value={1}>1. Ra viện</option>
                  <option value={2}>2. Xin về</option>
                  <option value={3}>3. Bỏ về</option>
                  <option value={4}>4. Đưa về</option>
                </select>
              </div>
              <FieldInput
                label="19. Tổng số ngày ĐTr"
                value={ql.tongSoNgayDieuTri}
                onChange={(v) => setQL({ tongSoNgayDieuTri: v })}
                className="col-span-2"
                mono
              />
            </div>
          </section>
        )}

        {/* ==================== MỤC 3: III. CHẨN ĐOÁN & IV. TÌNH TRẠNG RA VIỆN ==================== */}
        {!isOutpatient && (showAll || activeSubTab === 'chan-doan') && (
          <div className="space-y-4">
            {/* III. CHẨN ĐOÁN */}
            <section className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5">
              <h3 className="text-xs font-bold uppercase text-teal-800 border-b border-slate-200 pb-1">
                III. Chẩn đoán (Nơi chuyển đến, KKB, Vào khoa, Ra viện)
              </h3>
              <div className="grid grid-cols-12 gap-2.5">
                <FieldInput
                  label="20. Nơi chuyển đến (YHHĐ)"
                  value={ncd.ten}
                  onChange={(v) => setCD({ noiChuyenDen: { ...ncd, ten: v } })}
                  className="col-span-9"
                />
                <FieldInput
                  label="Mã ICD (4 ô)"
                  value={ncd.ma}
                  onChange={(v) => setCD({ noiChuyenDen: { ...ncd, ma: v } })}
                  className="col-span-3"
                  mono
                />

                <FieldInput
                  label="21. KKB, Cấp cứu (YHHĐ)"
                  value={kkb.ten}
                  onChange={(v) => setCD({ kkbCapCuu: { ...kkb, ten: v } })}
                  className="col-span-9"
                />
                <FieldInput
                  label="Mã ICD (4 ô)"
                  value={kkb.ma}
                  onChange={(v) => setCD({ kkbCapCuu: { ...kkb, ma: v } })}
                  className="col-span-3"
                  mono
                />

                <FieldInput
                  label="22. Khi vào khoa điều trị (Bệnh chính)"
                  value={vkh.ten}
                  onChange={(v) => setCD({ khiVaoKhoaDieuTri: { ...vkh, ten: v } })}
                  className="col-span-9"
                />
                <FieldInput
                  label="Mã ICD (4 ô)"
                  value={vkh.ma}
                  onChange={(v) => setCD({ khiVaoKhoaDieuTri: { ...vkh, ma: v } })}
                  className="col-span-3"
                  mono
                />

                <div className="col-span-12 flex items-center gap-6 py-1">
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(cd.thuThuat)}
                      onChange={(e) => setCD({ thuThuat: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>+ Có Thủ thuật</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(cd.phauThuat)}
                      onChange={(e) => setCD({ phauThuat: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>+ Có Phẫu thuật</span>
                  </label>
                </div>

                {/* Chẩn đoán Ra viện */}
                <FieldInput
                  label="23/25. Ra viện: + Bệnh chính (tổn thương)"
                  value={rvCD.benhChinh}
                  onChange={(v) => setCD({ raVien: { ...rvCD, benhChinh: v } })}
                  className="col-span-9"
                />
                <FieldInput
                  label="Mã ICD (4 ô)"
                  value={rvCD.maBenhChinh}
                  onChange={(v) => setCD({ raVien: { ...rvCD, maBenhChinh: v } })}
                  className="col-span-3"
                  mono
                />

                {isSurgical && (
                  <>
                    <FieldInput
                      label="(Nguyên nhân tổn thương)"
                      value={rvCD.nguyenNhan}
                      onChange={(v) => setCD({ raVien: { ...rvCD, nguyenNhan: v } })}
                      className="col-span-9"
                    />
                    <FieldInput
                      label="Mã NN (4 ô)"
                      value={rvCD.maNguyenNhan}
                      onChange={(v) => setCD({ raVien: { ...rvCD, maNguyenNhan: v } })}
                      className="col-span-3"
                      mono
                    />
                  </>
                )}

                <FieldInput
                  label="+ Bệnh kèm theo"
                  value={rvCD.benhKemTheo}
                  onChange={(v) => setCD({ raVien: { ...rvCD, benhKemTheo: v } })}
                  className="col-span-9"
                />
                <FieldInput
                  label="Mã ICD (4 ô)"
                  value={rvCD.maBenhKemTheo}
                  onChange={(v) => setCD({ raVien: { ...rvCD, maBenhKemTheo: v } })}
                  className="col-span-3"
                  mono
                />

                {isSurgical && (
                  <>
                    <FieldInput
                      label="+ Chẩn đoán trước phẫu thuật"
                      value={rvCD.chanDoanTruocPhauThuat}
                      onChange={(v) =>
                        setCD({ raVien: { ...rvCD, chanDoanTruocPhauThuat: v } })
                      }
                      className="col-span-9"
                    />
                    <FieldInput
                      label="Mã ICD (4 ô)"
                      value={rvCD.maTruocPhauThuat}
                      onChange={(v) =>
                        setCD({ raVien: { ...rvCD, maTruocPhauThuat: v } })
                      }
                      className="col-span-3"
                      mono
                    />
                    <FieldInput
                      label="+ Chẩn đoán sau phẫu thuật"
                      value={rvCD.chanDoanSauPhauThuat}
                      onChange={(v) =>
                        setCD({ raVien: { ...rvCD, chanDoanSauPhauThuat: v } })
                      }
                      className="col-span-9"
                    />
                    <FieldInput
                      label="Mã ICD (4 ô)"
                      value={rvCD.maSauPhauThuat}
                      onChange={(v) =>
                        setCD({ raVien: { ...rvCD, maSauPhauThuat: v } })
                      }
                      className="col-span-3"
                      mono
                    />
                    <FieldInput
                      label="23. Tổng số ngày ĐTr sau phẫu thuật"
                      value={cd.tongSoNgaySauPhauThuat}
                      onChange={(v) => setCD({ tongSoNgaySauPhauThuat: v })}
                      className="col-span-4"
                      mono
                    />
                    <FieldInput
                      label="24. Tổng số lần phẫu thuật"
                      value={cd.tongSoLanPhauThuat}
                      onChange={(v) => setCD({ tongSoLanPhauThuat: v })}
                      className="col-span-4"
                      mono
                    />
                    <div className="col-span-4">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Nguyên nhân Tai biến/Biến chứng
                      </label>
                      <select
                        value={cd.taiBienBienChungNguyenNhan || ''}
                        onChange={(e) =>
                          setCD({
                            taiBienBienChungNguyenNhan: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                      >
                        <option value="">-- Không --</option>
                        <option value={1}>1. Do phẫu thuật</option>
                        <option value={2}>2. Do gây mê</option>
                        <option value={3}>3. Do nhiễm khuẩn</option>
                        <option value={4}>4. Khác</option>
                      </select>
                    </div>
                  </>
                )}

                {isYHCT && (
                  <>
                    <div className="col-span-12 font-semibold text-teal-800 pt-1">
                      Cột Chẩn đoán theo Y Học Cổ Truyền (YHCT):
                    </div>
                    <FieldInput
                      label="25. Nơi chuyển đến (YHCT)"
                      value={ncd.tenYHCT}
                      onChange={(v) => setCD({ noiChuyenDen: { ...ncd, tenYHCT: v } })}
                      className="col-span-9"
                    />
                    <FieldInput
                      label="Mã YHCT"
                      value={ncd.maYHCT}
                      onChange={(v) => setCD({ noiChuyenDen: { ...ncd, maYHCT: v } })}
                      className="col-span-3"
                      mono
                    />
                    <FieldInput
                      label="26. KKB/Cấp cứu (YHCT)"
                      value={kkb.tenYHCT}
                      onChange={(v) => setCD({ kkbCapCuu: { ...kkb, tenYHCT: v } })}
                      className="col-span-9"
                    />
                    <FieldInput
                      label="Mã YHCT"
                      value={kkb.maYHCT}
                      onChange={(v) => setCD({ kkbCapCuu: { ...kkb, maYHCT: v } })}
                      className="col-span-3"
                      mono
                    />
                    <FieldInput
                      label="27. Vào khoa: Bệnh chính (YHCT)"
                      value={vkh.tenYHCT}
                      onChange={(v) =>
                        setCD({ khiVaoKhoaDieuTri: { ...vkh, tenYHCT: v } })
                      }
                      className="col-span-9"
                    />
                    <FieldInput
                      label="Mã YHCT"
                      value={vkh.maYHCT}
                      onChange={(v) =>
                        setCD({ khiVaoKhoaDieuTri: { ...vkh, maYHCT: v } })
                      }
                      className="col-span-3"
                      mono
                    />
                    <FieldInput
                      label="28. Ra viện: Bệnh chính (YHCT)"
                      value={rvCD.benhChinhYHCT}
                      onChange={(v) =>
                        setCD({ raVien: { ...rvCD, benhChinhYHCT: v } })
                      }
                      className="col-span-9"
                    />
                    <FieldInput
                      label="Mã YHCT"
                      value={rvCD.maBenhChinhYHCT}
                      onChange={(v) =>
                        setCD({ raVien: { ...rvCD, maBenhChinhYHCT: v } })
                      }
                      className="col-span-3"
                      mono
                    />
                  </>
                )}

                <div className="col-span-12 flex items-center gap-6 pt-1">
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(rvCD.taiBien)}
                      onChange={(e) =>
                        setCD({ raVien: { ...rvCD, taiBien: e.target.checked } })
                      }
                      className="rounded text-teal-600"
                    />
                    <span>+ Có Tai biến</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(rvCD.bienChung)}
                      onChange={(e) =>
                        setCD({ raVien: { ...rvCD, bienChung: e.target.checked } })
                      }
                      className="rounded text-teal-600"
                    />
                    <span>+ Có Biến chứng</span>
                  </label>
                </div>
              </div>
            </section>

            {/* IV. TÌNH TRẠNG RA VIỆN */}
            <section className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5">
              <h3 className="text-xs font-bold uppercase text-teal-800 border-b border-slate-200 pb-1">
                IV. Tình trạng ra viện &amp; Chữ ký Bìa Bệnh Án
              </h3>
              <div className="grid grid-cols-12 gap-2.5">
                <div className="col-span-6">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    24. Kết quả điều trị
                  </label>
                  <select
                    value={ttrv.ketQuaDieuTri || 1}
                    onChange={(e) => setTTRV({ ketQuaDieuTri: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                  >
                    <option value={1}>1. Khỏi</option>
                    <option value={2}>2. Đỡ, giảm</option>
                    <option value={3}>3. Không thay đổi</option>
                    <option value={4}>4. Nặng hơn</option>
                    <option value={5}>5. Tử vong</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    25. Giải phẫu bệnh (khi có sinh thiết)
                  </label>
                  <select
                    value={ttrv.giaiPhauBenh || ''}
                    onChange={(e) =>
                      setTTRV({
                        giaiPhauBenh: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                  >
                    <option value="">-- Không sinh thiết --</option>
                    <option value={1}>1. Lành tính</option>
                    <option value={2}>2. Nghi ngờ</option>
                    <option value={3}>3. Ác tính</option>
                  </select>
                </div>

                <FieldInput
                  label="26. Tử vong: Giờ"
                  value={tuVong.gio}
                  onChange={(v) => setTTRV({ tuVong: { ...tuVong, gio: v } })}
                  className="col-span-2"
                />
                <FieldInput
                  label="Phút"
                  value={tuVong.phut}
                  onChange={(v) => setTTRV({ tuVong: { ...tuVong, phut: v } })}
                  className="col-span-2"
                />
                <FieldInput
                  label="Ngày tử vong"
                  value={tuVong.ngay}
                  onChange={(v) => setTTRV({ tuVong: { ...tuVong, ngay: v } })}
                  className="col-span-4"
                />
                <div className="col-span-4">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Nguyên nhân tử vong
                  </label>
                  <select
                    value={tuVong.nguyenNhan || ''}
                    onChange={(e) =>
                      setTTRV({
                        tuVong: {
                          ...tuVong,
                          nguyenNhan: e.target.value ? Number(e.target.value) : null,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                  >
                    <option value="">-- Không --</option>
                    <option value={1}>1. Do bệnh</option>
                    <option value={2}>2. Do tai biến điều trị</option>
                    <option value={3}>3. Khác</option>
                  </select>
                </div>

                <FieldInput
                  label="27. Nguyên nhân chính tử vong"
                  value={tuVong.nguyenNhanChinh}
                  onChange={(v) =>
                    setTTRV({ tuVong: { ...tuVong, nguyenNhanChinh: v } })
                  }
                  className="col-span-9"
                />
                <FieldInput
                  label="Mã ICD (4 ô)"
                  value={tuVong.maNguyenNhanChinh}
                  onChange={(v) =>
                    setTTRV({ tuVong: { ...tuVong, maNguyenNhanChinh: v } })
                  }
                  className="col-span-3"
                  mono
                />

                <FieldInput
                  label="Ngày ký"
                  value={ttrv.ngayKy}
                  onChange={(v) => setTTRV({ ngayKy: v })}
                  className="col-span-2"
                />
                <FieldInput
                  label="Tháng ký"
                  value={ttrv.thangKy}
                  onChange={(v) => setTTRV({ thangKy: v })}
                  className="col-span-2"
                />
                <FieldInput
                  label="Năm ký"
                  value={ttrv.namKy}
                  onChange={(v) => setTTRV({ namKy: v })}
                  className="col-span-2"
                />
                <FieldInput
                  label="Giám đốc bệnh viện"
                  value={ttrv.giamDocBenhVien}
                  onChange={(v) => setTTRV({ giamDocBenhVien: v })}
                  className="col-span-3"
                />
                <FieldInput
                  label="Trưởng khoa"
                  value={ttrv.truongKhoa}
                  onChange={(v) => setTTRV({ truongKhoa: v })}
                  className="col-span-3"
                />
              </div>
            </section>
          </div>
        )}

        {/* ==================== MỤC 4: A. BỆNH ÁN & KHÁM BỆNH ==================== */}
        {(showAll || activeSubTab === 'benh-an') && (
          <div className="space-y-4">
            {/* Lý do vào viện & Hỏi bệnh */}
            <section className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5">
              <h3 className="text-xs font-bold uppercase text-teal-800 border-b border-slate-200 pb-1">
                A. Bệnh án — I. Lý do vào viện &amp; II. Hỏi bệnh
              </h3>
              <div className="grid grid-cols-12 gap-2.5">
                <FieldInput
                  label="I. Lý do vào viện"
                  value={ba.lyDoVaoVien}
                  onChange={(v) => setBA({ lyDoVaoVien: v })}
                  className="col-span-9"
                />
                <FieldInput
                  label="Vào ngày thứ của bệnh"
                  value={ba.vaoNgayThu}
                  onChange={(v) => setBA({ vaoNgayThu: v })}
                  className="col-span-3"
                />

                <FieldTextarea
                  label="II.1. Quá trình bệnh lý (khởi phát, diễn biến, chẩn đoán, điều trị tuyến dưới...)"
                  value={hoiBenh.quaTrinhBenhLy}
                  onChange={(v) => setHoiBenh({ quaTrinhBenhLy: v })}
                  rows={4}
                  className="col-span-12"
                />
                <FieldTextarea
                  label="II.2. Tiền sử bệnh + Bản thân"
                  value={hoiBenh.tienSuBanThan}
                  onChange={(v) => setHoiBenh({ tienSuBanThan: v })}
                  rows={2}
                  className="col-span-12"
                />
                <FieldTextarea
                  label="+ Tiền sử Gia đình"
                  value={hoiBenh.tienSuGiaDinh}
                  onChange={(v) => setHoiBenh({ tienSuGiaDinh: v })}
                  rows={2}
                  className="col-span-12"
                />
              </div>

              {/* Bảng 6 đặc điểm liên quan bệnh */}
              {config.hasRelatedCharacteristicsTable && (
                <div className="p-2.5 bg-white rounded border border-slate-200 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Bảng Đặc điểm liên quan bệnh (01 Dị ứng .. 06 Khác)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'diUng', label: '01 - Dị ứng' },
                      { key: 'maTuy', label: '02 - Ma tuý' },
                      { key: 'ruouBia', label: '03 - Rượu bia' },
                      { key: 'thuocLa', label: '04 - Thuốc lá' },
                      { key: 'thuocLao', label: '05 - Thuốc lào' },
                      { key: 'khac', label: '06 - Khác' },
                    ].map((item) => {
                      const cur = dacDiem[item.key] || {};
                      return (
                        <div
                          key={item.key}
                          className="p-2 border border-slate-200 rounded bg-slate-50 flex flex-col gap-1"
                        >
                          <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(cur.checked)}
                              onChange={(e) =>
                                setHoiBenh({
                                  dacDiemLienQuan: {
                                    ...dacDiem,
                                    [item.key]: { ...cur, checked: e.target.checked },
                                  },
                                })
                              }
                            />
                            <span>{item.label}</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Thời gian (tháng)"
                            value={cur.thoiGian || ''}
                            onChange={(e) =>
                              setHoiBenh({
                                dacDiemLienQuan: {
                                  ...dacDiem,
                                  [item.key]: {
                                    ...cur,
                                    thoiGian: e.target.value,
                                    checked: Boolean(e.target.value) || cur.checked,
                                  },
                                },
                              })
                            }
                            className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Nếu là Nhi khoa: 3. Quá trình sinh trưởng */}
              {config.hasGrowthHistory && (
                <div className="p-2.5 bg-white rounded border border-slate-200 space-y-2.5">
                  <div className="text-xs font-bold text-teal-800">
                    3. Quá trình sinh trưởng (Dành cho Nhi khoa / Sơ sinh)
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <FieldInput
                      label="Con thứ mấy"
                      value={sinhTruong.conThuMay}
                      onChange={(v) =>
                        setHoiBenh({
                          quaTrinhSinhTruong: { ...sinhTruong, conThuMay: v },
                        })
                      }
                      className="col-span-3"
                    />
                    <FieldInput
                      label="Tiền thai (Para 4 số)"
                      value={sinhTruong.para}
                      onChange={(v) =>
                        setHoiBenh({
                          quaTrinhSinhTruong: { ...sinhTruong, para: v },
                        })
                      }
                      className="col-span-3"
                      mono
                    />
                    <div className="col-span-3">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Tình trạng khi sinh
                      </label>
                      <select
                        value={sinhTruong.tinhTrangKhiSinh || 1}
                        onChange={(e) =>
                          setHoiBenh({
                            quaTrinhSinhTruong: {
                              ...sinhTruong,
                              tinhTrangKhiSinh: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      >
                        <option value={1}>1. Đẻ thường</option>
                        <option value={2}>2. Forceps</option>
                        <option value={3}>3. Giác hút</option>
                        <option value={4}>4. Đẻ phẫu thuật</option>
                        <option value={5}>5. Đẻ chỉ huy</option>
                        <option value={6}>6. Khác</option>
                      </select>
                    </div>
                    <FieldInput
                      label="Cân nặng lúc sinh (kg)"
                      value={sinhTruong.canNangLucSinh}
                      onChange={(v) =>
                        setHoiBenh({
                          quaTrinhSinhTruong: { ...sinhTruong, canNangLucSinh: v },
                        })
                      }
                      className="col-span-3"
                    />
                    <FieldInput
                      label="Cụ thể dị tật bẩm sinh (nếu có)"
                      value={sinhTruong.cuTheTatBamSinh}
                      onChange={(v) =>
                        setHoiBenh({
                          quaTrinhSinhTruong: {
                            ...sinhTruong,
                            cuTheTatBamSinh: v,
                            diTatBamSinh: Boolean(v && v !== 'Không'),
                          },
                        })
                      }
                      className="col-span-6"
                    />
                    <FieldInput
                      label="Cai sữa tháng thứ"
                      value={sinhTruong.caiSuaThangThu}
                      onChange={(v) =>
                        setHoiBenh({
                          quaTrinhSinhTruong: { ...sinhTruong, caiSuaThangThu: v },
                        })
                      }
                      className="col-span-3"
                    />
                    <div className="col-span-3">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Nuôi dưỡng
                      </label>
                      <select
                        value={sinhTruong.nuoiDuong || 1}
                        onChange={(e) =>
                          setHoiBenh({
                            quaTrinhSinhTruong: {
                              ...sinhTruong,
                              nuoiDuong: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      >
                        <option value={1}>1. Sữa mẹ</option>
                        <option value={2}>2. Nhân tạo</option>
                        <option value={3}>3. Hỗn hợp</option>
                      </select>
                    </div>
                    <FieldInput
                      label="Phát triển về tinh thần"
                      value={sinhTruong.phatTrienTinhThan}
                      onChange={(v) =>
                        setHoiBenh({
                          quaTrinhSinhTruong: { ...sinhTruong, phatTrienTinhThan: v },
                        })
                      }
                      className="col-span-6"
                    />
                    <FieldInput
                      label="Phát triển về vận động"
                      value={sinhTruong.phatTrienVanDong}
                      onChange={(v) =>
                        setHoiBenh({
                          quaTrinhSinhTruong: { ...sinhTruong, phatTrienVanDong: v },
                        })
                      }
                      className="col-span-6"
                    />
                    <FieldInput
                      label="Các bệnh khác được tiêm chủng"
                      value={sinhTruong.tiemChungKhac}
                      onChange={(v) =>
                        setHoiBenh({
                          quaTrinhSinhTruong: { ...sinhTruong, tiemChungKhac: v },
                        })
                      }
                      className="col-span-12"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* III. Khám bệnh & Sinh hiệu */}
            <section className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5">
              <h3 className="text-xs font-bold uppercase text-teal-800 border-b border-slate-200 pb-1">
                III. Khám bệnh &amp; Bảng Sinh hiệu (VitalsBox)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2.5 bg-white rounded border border-slate-200">
                <FieldInput
                  label="Mạch (lần/ph)"
                  value={sinhHieu.mach}
                  onChange={(v) => setSinhHieu({ mach: v })}
                />
                <FieldInput
                  label="Nhiệt độ (°C)"
                  value={sinhHieu.nhietDo}
                  onChange={(v) => setSinhHieu({ nhietDo: v })}
                />
                <FieldInput
                  label="Huyết áp (mmHg)"
                  value={sinhHieu.huyetAp}
                  onChange={(v) => setSinhHieu({ huyetAp: v })}
                />
                <FieldInput
                  label="Nhịp thở (lần/ph)"
                  value={sinhHieu.nhipTho}
                  onChange={(v) => setSinhHieu({ nhipTho: v })}
                />
                <FieldInput
                  label="Cân nặng (kg)"
                  value={sinhHieu.canNang}
                  onChange={(v) => setSinhHieu({ canNang: v })}
                />
                {(config.vitalsFields.includes('chieuCao') || config.hasGrowthHistory) && (
                  <FieldInput
                    label="Chiều cao (cm)"
                    value={sinhHieu.chieuCao || khamBenh.chieuCao}
                    onChange={(v) => {
                      setSinhHieu({ chieuCao: v });
                      setKhamBenh({ chieuCao: v });
                    }}
                  />
                )}
                {config.vitalsFields.includes('bmi') && (
                  <FieldInput
                    label="Chỉ số BMI"
                    value={sinhHieu.bmi}
                    onChange={(v) => setSinhHieu({ bmi: v })}
                  />
                )}
                {config.hasGrowthHistory && (
                  <>
                    <FieldInput
                      label="Vòng ngực (cm)"
                      value={khamBenh.vongNguc}
                      onChange={(v) => setKhamBenh({ vongNguc: v })}
                    />
                    <FieldInput
                      label="Vòng đầu (cm)"
                      value={khamBenh.vongDau}
                      onChange={(v) => setKhamBenh({ vongDau: v })}
                    />
                  </>
                )}
              </div>

              <FieldTextarea
                label="1. Khám Toàn thân (ý thức, da niêm mạc, hệ thống hạch, tuyến giáp...)"
                value={khamBenh.toanThan}
                onChange={(v) => setKhamBenh({ toanThan: v })}
                rows={3}
              />

              {config.hasSurgicalBlock && (
                <FieldTextarea
                  label="2. Bệnh ngoại khoa (hoặc Khám chuyên khoa)"
                  value={khamBenh.benhNgoaiKhoa}
                  onChange={(v) => setKhamBenh({ benhNgoaiKhoa: v })}
                  rows={3}
                />
              )}

              {isOutpatient ? (
                <>
                  <FieldTextarea
                    label="2. Khám các bộ phận"
                    value={khamBenh.cacBoPhan}
                    onChange={(v) => setKhamBenh({ cacBoPhan: v })}
                    rows={3}
                  />
                  <FieldTextarea
                    label="3. Tóm tắt kết quả cận lâm sàng"
                    value={khamBenh.tomTatKetQuaCanLamSang}
                    onChange={(v) => setKhamBenh({ tomTatKetQuaCanLamSang: v })}
                    rows={2}
                  />
                  <FieldInput
                    label="4. Chẩn đoán ban đầu"
                    value={khamBenh.chanDoanBanDau}
                    onChange={(v) => setKhamBenh({ chanDoanBanDau: v })}
                  />
                  <FieldTextarea
                    label="5. Đã xử lý (thuốc, chăm sóc)"
                    value={khamBenh.daXuLy}
                    onChange={(v) => setKhamBenh({ daXuLy: v })}
                    rows={3}
                  />
                  <div className="grid grid-cols-12 gap-2">
                    <FieldInput
                      label="6. Chẩn đoán khi ra viện"
                      value={khamBenh.chanDoanKhiRaVien}
                      onChange={(v) => setKhamBenh({ chanDoanKhiRaVien: v })}
                      className="col-span-9"
                    />
                    <FieldInput
                      label="Mã ICD (4 ô)"
                      value={khamBenh.maChanDoanRaVien}
                      onChange={(v) => setKhamBenh({ maChanDoanRaVien: v })}
                      className="col-span-3"
                      mono
                    />
                    <FieldInput
                      label="7. Điều trị ngoại trú từ ngày"
                      value={khamBenh.dieuTriNgoaiTruTuNgay}
                      onChange={(v) => setKhamBenh({ dieuTriNgoaiTruTuNgay: v })}
                      className="col-span-6"
                    />
                    <FieldInput
                      label="Đến ngày"
                      value={khamBenh.dieuTriNgoaiTruDenNgay}
                      onChange={(v) => setKhamBenh({ dieuTriNgoaiTruDenNgay: v })}
                      className="col-span-6"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Khám các cơ quan động */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-slate-700">
                      Khám các cơ quan ({config.organFields.length} mục chuyên khoa):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {config.organFields.map((org) => (
                        <FieldTextarea
                          key={org.key}
                          label={org.label}
                          value={coQuan[org.key]}
                          onChange={(v) => setCoQuan({ [org.key]: v })}
                          rows={2}
                        />
                      ))}
                    </div>
                  </div>

                  <FieldTextarea
                    label="Các xét nghiệm cận lâm sàng cần làm"
                    value={khamBenh.xetNghiemCanLam}
                    onChange={(v) => setKhamBenh({ xetNghiemCanLam: v })}
                    rows={3}
                  />
                  <FieldTextarea
                    label="Tóm tắt bệnh án"
                    value={khamBenh.tomTatBenhAn}
                    onChange={(v) => setKhamBenh({ tomTatBenhAn: v })}
                    rows={3}
                  />
                </>
              )}

              {/* Phần Y Học Cổ Truyền (Tứ chẩn & Biện chứng luận trị) */}
              {config.hasTraditionalMedicine && (
                <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2.5">
                  <div className="text-xs font-bold uppercase text-amber-900">
                    B. Y Học Cổ Truyền (Tứ Chẩn &amp; Biện Chứng Luận Trị)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <FieldTextarea
                      label="I. Vọng chẩn"
                      value={yhct.vongChan}
                      onChange={(v) => setYHCT({ vongChan: v })}
                      rows={2}
                    />
                    <FieldTextarea
                      label="II. Văn chẩn"
                      value={yhct.vanChan}
                      onChange={(v) => setYHCT({ vanChan: v })}
                      rows={2}
                    />
                    <FieldTextarea
                      label="III. Vấn chẩn"
                      value={yhct.vanChanHoi}
                      onChange={(v) => setYHCT({ vanChanHoi: v })}
                      rows={2}
                    />
                    <FieldTextarea
                      label="IV. Thiết chẩn (Xúc chẩn, Mạch chẩn)"
                      value={yhct.thietChan}
                      onChange={(v) => setYHCT({ thietChan: v })}
                      rows={2}
                    />
                    <FieldTextarea
                      label="V. Tóm tắt tứ chẩn"
                      value={yhct.tomTatTuChan}
                      onChange={(v) => setYHCT({ tomTatTuChan: v })}
                      rows={2}
                    />
                    <FieldTextarea
                      label="VI. Biện chứng luận trị"
                      value={yhct.bienChungLuanTri}
                      onChange={(v) => setYHCT({ bienChungLuanTri: v })}
                      rows={2}
                    />
                    <FieldInput
                      label="VII.1. Bệnh danh"
                      value={cdYHCT.benhDanh}
                      onChange={(v) =>
                        setYHCT({ chanDoanYHCT: { ...cdYHCT, benhDanh: v } })
                      }
                    />
                    <FieldInput
                      label="2. Bát cương"
                      value={cdYHCT.batCuong}
                      onChange={(v) =>
                        setYHCT({ chanDoanYHCT: { ...cdYHCT, batCuong: v } })
                      }
                    />
                    <FieldInput
                      label="3. Nguyên nhân"
                      value={cdYHCT.nguyenNhan}
                      onChange={(v) =>
                        setYHCT({ chanDoanYHCT: { ...cdYHCT, nguyenNhan: v } })
                      }
                    />
                    <FieldInput
                      label="4. Tạng phủ"
                      value={cdYHCT.tangPhu}
                      onChange={(v) =>
                        setYHCT({ chanDoanYHCT: { ...cdYHCT, tangPhu: v } })
                      }
                    />
                    <FieldInput
                      label="5. Kinh mạch"
                      value={cdYHCT.kinhMach}
                      onChange={(v) =>
                        setYHCT({ chanDoanYHCT: { ...cdYHCT, kinhMach: v } })
                      }
                    />
                    <FieldInput
                      label="6. Định vị bệnh"
                      value={cdYHCT.dinhViBenh}
                      onChange={(v) =>
                        setYHCT({ chanDoanYHCT: { ...cdYHCT, dinhViBenh: v } })
                      }
                    />
                    <FieldInput
                      label="C.1. Pháp điều trị"
                      value={dtYHCT.phapDieuTri}
                      onChange={(v) =>
                        setYHCT({ dieuTriYHCT: { ...dtYHCT, phapDieuTri: v } })
                      }
                      className="sm:col-span-2"
                    />
                    <FieldTextarea
                      label="2. Phương dược"
                      value={dtYHCT.phuongDuoc}
                      onChange={(v) =>
                        setYHCT({ dieuTriYHCT: { ...dtYHCT, phuongDuoc: v } })
                      }
                      rows={2}
                    />
                    <FieldTextarea
                      label="3. Phương pháp điều trị không dùng thuốc"
                      value={dtYHCT.khongDungThuoc}
                      onChange={(v) =>
                        setYHCT({ dieuTriYHCT: { ...dtYHCT, khongDungThuoc: v } })
                      }
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* IV. Chẩn đoán khoa, Tiên lượng, Hướng điều trị */}
              {!isOutpatient && (
                <div className="grid grid-cols-12 gap-2.5 pt-2 border-t border-slate-200">
                  <FieldInput
                    label="IV. Chẩn đoán khi vào khoa: + Bệnh chính"
                    value={cdKhoa.benhChinh}
                    onChange={(v) =>
                      setBA({ chanDoanKhoa: { ...cdKhoa, benhChinh: v } })
                    }
                    className="col-span-12"
                  />
                  <FieldInput
                    label="+ Bệnh kèm theo (nếu có)"
                    value={cdKhoa.benhKemTheo}
                    onChange={(v) =>
                      setBA({ chanDoanKhoa: { ...cdKhoa, benhKemTheo: v } })
                    }
                    className="col-span-6"
                  />
                  <FieldInput
                    label="+ Phân biệt"
                    value={cdKhoa.phanBiet}
                    onChange={(v) =>
                      setBA({ chanDoanKhoa: { ...cdKhoa, phanBiet: v } })
                    }
                    className="col-span-6"
                  />
                  <FieldTextarea
                    label="V. Tiên lượng"
                    value={ba.tienLuong}
                    onChange={(v) => setBA({ tienLuong: v })}
                    rows={2}
                    className="col-span-12"
                  />
                  <FieldTextarea
                    label="VI. Hướng điều trị"
                    value={ba.huongDieuTri}
                    onChange={(v) => setBA({ huongDieuTri: v })}
                    rows={2}
                    className="col-span-12"
                  />
                </div>
              )}

              <div className="grid grid-cols-12 gap-2 pt-1">
                <FieldInput
                  label="Ngày làm BA"
                  value={ba.ngayLamBenhAn}
                  onChange={(v) => setBA({ ngayLamBenhAn: v })}
                  className="col-span-2"
                />
                <FieldInput
                  label="Tháng"
                  value={ba.thangLamBenhAn}
                  onChange={(v) => setBA({ thangLamBenhAn: v })}
                  className="col-span-2"
                />
                <FieldInput
                  label="Năm"
                  value={ba.namLamBenhAn}
                  onChange={(v) => setBA({ namLamBenhAn: v })}
                  className="col-span-2"
                />
                <FieldInput
                  label={isOutpatient ? 'Bác sỹ khám bệnh' : 'Bác sỹ làm bệnh án'}
                  value={isOutpatient ? ba.bacSyKhamBenh : ba.bacSyLamBenhAn}
                  onChange={(v) =>
                    setBA(
                      isOutpatient
                        ? { bacSyKhamBenh: v, bacSyLamBenhAn: v }
                        : { bacSyLamBenhAn: v }
                    )
                  }
                  className="col-span-6"
                />
              </div>
            </section>
          </div>
        )}

        {/* ==================== MỤC 5: B. TỔNG KẾT BỆNH ÁN ==================== */}
        {(showAll || activeSubTab === 'tong-ket') && (
          <section className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
            <h3 className="text-xs font-bold uppercase text-teal-800 border-b border-slate-200 pb-1">
              B. Tổng kết bệnh án &amp; Bàn giao Hồ sơ, Phim, Ảnh
            </h3>

            <FieldTextarea
              label="1. Quá trình bệnh lý và diễn biến lâm sàng"
              value={tk.quaTrinhBenhLyVaDienBien}
              onChange={(v) => setTK({ quaTrinhBenhLyVaDienBien: v })}
              rows={4}
            />
            <FieldTextarea
              label="2. Tóm tắt kết quả xét nghiệm cận lâm sàng có giá trị chẩn đoán"
              value={tk.tomTatKetQuaXetNghiem}
              onChange={(v) => setTK({ tomTatKetQuaXetNghiem: v })}
              rows={3}
            />

            {isOutpatient && (
              <div className="grid grid-cols-12 gap-2">
                <FieldInput
                  label="3. Chẩn đoán ra viện: - Bệnh chính"
                  value={cdRaVienTK.benhChinh}
                  onChange={(v) =>
                    setTK({ chanDoanRaVien: { ...cdRaVienTK, benhChinh: v } })
                  }
                  className="col-span-9"
                />
                <FieldInput
                  label="Mã ICD (4 ô)"
                  value={cdRaVienTK.maBenhChinh}
                  onChange={(v) =>
                    setTK({ chanDoanRaVien: { ...cdRaVienTK, maBenhChinh: v } })
                  }
                  className="col-span-3"
                  mono
                />
                <FieldInput
                  label="- Bệnh kèm theo"
                  value={cdRaVienTK.benhKemTheo}
                  onChange={(v) =>
                    setTK({ chanDoanRaVien: { ...cdRaVienTK, benhKemTheo: v } })
                  }
                  className="col-span-9"
                />
                <FieldInput
                  label="Mã ICD (4 ô)"
                  value={cdRaVienTK.maBenhKemTheo}
                  onChange={(v) =>
                    setTK({ chanDoanRaVien: { ...cdRaVienTK, maBenhKemTheo: v } })
                  }
                  className="col-span-3"
                  mono
                />
              </div>
            )}

            <FieldTextarea
              label="3. Phương pháp điều trị"
              value={tk.phuongPhapDieuTri}
              onChange={(v) => setTK({ phuongPhapDieuTri: v })}
              rows={3}
            />

            {/* Bảng Phẫu thuật / Thủ thuật động (Dành cho hệ Ngoại) */}
            {config.summaryVariant === 'surgical' && (
              <div className="p-2.5 bg-white rounded border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Bảng Phẫu thuật / Thủ thuật
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTK({
                        phauThuatList: [
                          ...phauThuatList,
                          {
                            gioNgay: '',
                            phuongPhapVoCam: '',
                            bacSyPhauThuat: '',
                            bacSyGayMe: '',
                          },
                        ],
                      })
                    }
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm ca Phẫu thuật / Thủ thuật
                  </button>
                </div>
                {phauThuatList.map((pt, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <FieldInput
                      label="Giờ, ngày"
                      value={pt.gioNgay}
                      onChange={(v) => {
                        const next = [...phauThuatList];
                        next[idx] = { ...next[idx], gioNgay: v };
                        setTK({ phauThuatList: next });
                      }}
                      className="col-span-3"
                    />
                    <FieldInput
                      label="Phương pháp phẫu thuật / vô cảm"
                      value={pt.phuongPhapVoCam}
                      onChange={(v) => {
                        const next = [...phauThuatList];
                        next[idx] = { ...next[idx], phuongPhapVoCam: v };
                        setTK({ phauThuatList: next });
                      }}
                      className="col-span-4"
                    />
                    <FieldInput
                      label="BS Phẫu thuật"
                      value={pt.bacSyPhauThuat}
                      onChange={(v) => {
                        const next = [...phauThuatList];
                        next[idx] = { ...next[idx], bacSyPhauThuat: v };
                        setTK({ phauThuatList: next });
                      }}
                      className="col-span-2"
                    />
                    <FieldInput
                      label="BS Gây mê"
                      value={pt.bacSyGayMe}
                      onChange={(v) => {
                        const next = [...phauThuatList];
                        next[idx] = { ...next[idx], bacSyGayMe: v };
                        setTK({ phauThuatList: next });
                      }}
                      className="col-span-2"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setTK({
                          phauThuatList: phauThuatList.filter((_, i) => i !== idx),
                        })
                      }
                      className="col-span-1 p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <FieldTextarea
              label="4. Tình trạng người bệnh ra viện"
              value={tk.tinhTrangRaVien}
              onChange={(v) => setTK({ tinhTrangRaVien: v })}
              rows={2}
            />
            <FieldTextarea
              label="5. Hướng điều trị và các chế độ tiếp theo"
              value={tk.huongDieuTriTiep}
              onChange={(v) => setTK({ huongDieuTriTiep: v })}
              rows={2}
            />

            {/* Bảng Hồ sơ phim ảnh */}
            <div className="p-2.5 bg-white rounded border border-slate-200 space-y-2">
              <div className="text-xs font-semibold text-slate-700">
                Bảng Bàn giao Hồ sơ, phim, ảnh (Số tờ)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <FieldInput
                  label="X - quang (số tờ)"
                  value={hoSo.xQuang}
                  onChange={(v) =>
                    setTK({ hoSoPhimAnh: { ...hoSo, xQuang: v } })
                  }
                />
                <FieldInput
                  label="CT Scanner (số tờ)"
                  value={hoSo.ctScanner}
                  onChange={(v) =>
                    setTK({ hoSoPhimAnh: { ...hoSo, ctScanner: v } })
                  }
                />
                <FieldInput
                  label="Siêu âm (số tờ)"
                  value={hoSo.sieuAm}
                  onChange={(v) =>
                    setTK({ hoSoPhimAnh: { ...hoSo, sieuAm: v } })
                  }
                />
                <FieldInput
                  label="Xét nghiệm (số tờ)"
                  value={hoSo.xetNghiem}
                  onChange={(v) =>
                    setTK({ hoSoPhimAnh: { ...hoSo, xetNghiem: v } })
                  }
                />
                <FieldInput
                  label="Loại hồ sơ khác"
                  value={hoSo.khacLoai}
                  onChange={(v) =>
                    setTK({ hoSoPhimAnh: { ...hoSo, khacLoai: v } })
                  }
                  className="col-span-2"
                />
                <FieldInput
                  label="Số tờ hồ sơ khác"
                  value={hoSo.khacSoTo}
                  onChange={(v) =>
                    setTK({ hoSoPhimAnh: { ...hoSo, khacSoTo: v } })
                  }
                />
                <FieldInput
                  label="Toàn bộ hồ sơ (tổng số tờ)"
                  value={hoSo.toanBoHoSo}
                  onChange={(v) =>
                    setTK({ hoSoPhimAnh: { ...hoSo, toanBoHoSo: v } })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2.5">
              <FieldInput
                label="Người giao hồ sơ"
                value={tk.nguoiGiaoHoSo}
                onChange={(v) => setTK({ nguoiGiaoHoSo: v })}
                className="col-span-4"
              />
              <FieldInput
                label="Người nhận hồ sơ"
                value={tk.nguoiNhanHoSo}
                onChange={(v) => setTK({ nguoiNhanHoSo: v })}
                className="col-span-4"
              />
              <FieldInput
                label="Bác sỹ điều trị"
                value={tk.bacSyDieuTri}
                onChange={(v) => setTK({ bacSyDieuTri: v })}
                className="col-span-4"
              />
              <FieldInput
                label="Ngày tổng kết"
                value={tk.ngayTongKet}
                onChange={(v) => setTK({ ngayTongKet: v })}
                className="col-span-4"
              />
              <FieldInput
                label="Tháng tổng kết"
                value={tk.thangTongKet}
                onChange={(v) => setTK({ thangTongKet: v })}
                className="col-span-4"
              />
              <FieldInput
                label="Năm tổng kết"
                value={tk.namTongKet}
                onChange={(v) => setTK({ namTongKet: v })}
                className="col-span-4"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
