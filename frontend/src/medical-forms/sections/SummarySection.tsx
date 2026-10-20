import React from 'react';
import {
  CharBoxes,
  DottedBlock,
  DottedField,
  OptionCheck,
  SurgeryTable,
} from '../primitives/MedicalPrimitives';

export const SummarySection: React.FC<{
  data?: Record<string, any>;
  variant?: 'internal' | 'surgical' | 'outpatient' | 'yhct';
}> = ({ data = {}, variant = 'internal' }) => {
  const hoSo = data.hoSoPhimAnh || {};
  const cdRaVien = data.chanDoanRaVien || {};

  return (
    <div className="text-[11.5pt]">
      <div className="font-bold text-[13pt] uppercase mb-1.5">
        {variant === 'yhct' ? 'PHẦN III: TỔNG KẾT BỆNH ÁN RA VIỆN' : 'B. TỔNG KẾT BỆNH ÁN'}
      </div>

      <div className="med-box-frame">
        {/* Phần nội dung tổng kết */}
        <div className="p-2.5 border-b border-black">
          <DottedBlock
            label="1. Quá trình bệnh lý và diễn biến lâm sàng:"
            value={data.quaTrinhBenhLyVaDienBien}
            lines={6}
          />

          <DottedBlock
            label="2. Tóm tắt kết quả xét nghiệm cận lâm sàng có giá trị chẩn đoán:"
            value={data.tomTatKetQuaXetNghiem}
            lines={4}
          />

          {variant === 'outpatient' && (
            <div className="my-1.5">
              <div className="font-bold mb-0.5">3. Chẩn đoán ra viện:</div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <DottedField
                  label="- Bệnh chính:"
                  value={cdRaVien.benhChinh}
                  boldValue
                  className="flex-1"
                />
                <CharBoxes value={cdRaVien.maBenhChinh} length={4} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <DottedField
                  label="- Bệnh kèm theo (nếu có):"
                  value={cdRaVien.benhKemTheo}
                  className="flex-1"
                />
                <CharBoxes value={cdRaVien.maBenhKemTheo} length={4} />
              </div>
            </div>
          )}

          <DottedBlock
            label={
              variant === 'outpatient' ? '4. Phương pháp điều trị:' : '3. Phương pháp điều trị:'
            }
            value={data.phuongPhapDieuTri}
            lines={4}
          />

          {variant === 'surgical' && (
            <div className="my-2">
              <div className="flex items-center justify-around mb-1">
                <OptionCheck
                  label="- Phẫu thuật"
                  checked={Array.isArray(data.phauThuatList) && data.phauThuatList.length > 0}
                />
                <OptionCheck label="- Thủ thuật" checked={false} />
              </div>
              <SurgeryTable rows={data.phauThuatList} />
            </div>
          )}

          <DottedBlock
            label={
              variant === 'outpatient'
                ? '5. Tình trạng người bệnh ra viện:'
                : '4. Tình trạng người bệnh ra viện:'
            }
            value={data.tinhTrangRaVien}
            lines={3}
          />

          <DottedBlock
            label={
              variant === 'outpatient'
                ? '6. Hướng điều trị và các chế độ tiếp theo:'
                : '5. Hướng điều trị và các chế độ tiếp theo:'
            }
            value={data.huongDieuTriTiep}
            lines={3}
          />
        </div>

        {/* Khung bàn giao Hồ sơ, phim, ảnh & Chữ ký Bác sỹ điều trị (Chuẩn mọi mẫu bệnh án) */}
        <table className="w-full border-collapse text-[11pt]">
          <tbody>
            <tr>
              <th colSpan={2} className="border-r border-b border-black py-1 text-center w-[42%]">
                Hồ sơ, phim, ảnh
              </th>
              <td rowSpan={4} className="border-r border-b border-black p-2 align-top w-[28%]">
                <div className="font-bold text-center">Người giao hồ sơ:</div>
                <div className="mt-8">
                  <DottedField label="Họ tên:" value={data.nguoiGiaoHoSo} />
                </div>
              </td>
              <td rowSpan={8} className="p-2 align-top text-center w-[30%]">
                <div className="italic">
                  Ngày {data.ngayTongKet || '....'} tháng {data.thangTongKet || '....'} năm{' '}
                  {data.namTongKet || '........'}
                </div>
                <div className="font-bold mt-1">
                  {variant === 'yhct'
                    ? 'Thầy thuốc khám bệnh, chữa bệnh'
                    : 'Bác sỹ điều trị'}
                </div>
                <div className="mt-24 text-left">
                  <DottedField label="Họ tên:" value={data.bacSyDieuTri} boldValue />
                </div>
              </td>
            </tr>
            <tr>
              <th className="border-r border-b border-black py-1 text-center">Loại</th>
              <th className="border-r border-b border-black py-1 text-center w-16">Số tờ</th>
            </tr>
            <tr>
              <td className="border-r border-b border-black px-2 py-1">- X - quang</td>
              <td className="border-r border-b border-black px-2 py-1 text-center font-semibold">
                {hoSo.xQuang || ''}
              </td>
            </tr>
            <tr>
              <td className="border-r border-b border-black px-2 py-1">- CT Scanner</td>
              <td className="border-r border-b border-black px-2 py-1 text-center font-semibold">
                {hoSo.ctScanner || ''}
              </td>
            </tr>
            <tr>
              <td className="border-r border-b border-black px-2 py-1">- Siêu âm</td>
              <td className="border-r border-b border-black px-2 py-1 text-center font-semibold">
                {hoSo.sieuAm || ''}
              </td>
              <td rowSpan={4} className="border-r p-2 align-top">
                <div className="font-bold text-center">Người nhận hồ sơ:</div>
                <div className="mt-8">
                  <DottedField label="Họ tên:" value={data.nguoiNhanHoSo} />
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-r border-b border-black px-2 py-1">- Xét nghiệm</td>
              <td className="border-r border-b border-black px-2 py-1 text-center font-semibold">
                {hoSo.xetNghiem || ''}
              </td>
            </tr>
            <tr>
              <td className="border-r border-b border-black px-2 py-1">
                - Khác: <span className="italic">{hoSo.khacLoai || '................'}</span>
              </td>
              <td className="border-r border-b border-black px-2 py-1 text-center font-semibold">
                {hoSo.khacSoTo || ''}
              </td>
            </tr>
            <tr>
              <td className="border-r px-2 py-1 font-medium">- Toàn bộ hồ sơ</td>
              <td className="border-r px-2 py-1 text-center font-bold">
                {hoSo.toanBoHoSo || ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
