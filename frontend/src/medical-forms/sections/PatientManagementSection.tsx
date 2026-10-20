import React from 'react';
import { CharBoxes, DottedField, OptionCheck } from '../primitives/MedicalPrimitives';

export const PatientManagementSection: React.FC<{
  data?: Record<string, any>;
}> = ({ data = {} }) => {
  const vaoVien = data.vaoVien || {};
  const vaoKhoa = data.vaoKhoa || {};
  const chuyenKhoaList: any[] =
    Array.isArray(data.chuyenKhoa) && data.chuyenKhoa.length > 0
      ? data.chuyenKhoa
      : [{}, {}, {}];
  const displayChuyenKhoa =
    chuyenKhoaList.length >= 3
      ? chuyenKhoaList.slice(0, 3)
      : [...chuyenKhoaList, ...Array(3 - chuyenKhoaList.length).fill({})];
  const chuyenVien = data.chuyenVien || {};
  const raVien = data.raVien || {};

  return (
    <div className="mb-2 text-[11pt]">
      <div className="font-bold uppercase mb-0.5">II. QUẢN LÝ NGƯỜI BỆNH:</div>
      <div className="med-box-frame grid grid-cols-12">
        {/* Nửa trái: 12, 13, 15, 16 */}
        <div className="col-span-6 border-r border-black flex flex-col">
          <div className="p-1.5 border-b border-black">
            <div className="mb-1">
              12. Vào viện:{' '}
              <span className="border-b border-dotted border-black px-1 font-semibold">
                {vaoVien.gio || '....'}
              </span>{' '}
              giờ{' '}
              <span className="border-b border-dotted border-black px-1 font-semibold">
                {vaoVien.phut || '....'}
              </span>{' '}
              ph, ngày{' '}
              <span className="border-b border-dotted border-black px-2 font-semibold">
                {vaoVien.ngay || '..../..../........'}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-1">
              <span>13. Trực tiếp vào:</span>
              <OptionCheck label="1.Cấp cứu" checked={data.trucTiepVao === 1} />
              <OptionCheck label="2.KKB" checked={data.trucTiepVao === 2} />
              <OptionCheck label="3.Khoa điều trị" checked={data.trucTiepVao === 3} />
            </div>
          </div>

          <div className="p-1.5 flex-1">
            <div className="grid grid-cols-12 text-[10pt] font-semibold text-center mb-1">
              <div className="col-span-3"></div>
              <div className="col-span-3">Khoa</div>
              <div className="col-span-4">Giờ / Ngày</div>
              <div className="col-span-2">Số ngày ĐTr</div>
            </div>

            {/* 15. Vào khoa */}
            <div className="grid grid-cols-12 items-center gap-1 mb-1.5">
              <div className="col-span-3">15. Vào khoa</div>
              <div className="col-span-3 border border-black px-1 py-0.5 text-center font-semibold min-h-[22px] truncate">
                {vaoKhoa.khoa || ''}
              </div>
              <div className="col-span-4 text-[10pt] text-center border-b border-dotted border-black">
                {vaoKhoa.gio ? `${vaoKhoa.gio}h${vaoKhoa.phut || '00'} ${vaoKhoa.ngay || ''}` : '....giờ....ph ..../..../....'}
              </div>
              <div className="col-span-2 text-right">
                <CharBoxes value={vaoKhoa.soNgayDT} length={2} />
              </div>
            </div>

            {/* 16. Chuyển khoa */}
            {displayChuyenKhoa.map((ck, idx) => (
              <div key={idx} className="grid grid-cols-12 items-center gap-1 mb-1 last:mb-0">
                <div className="col-span-3">
                  {idx === 0 ? '16. Chuyển' : idx === 1 ? 'Khoa' : ''}
                </div>
                <div className="col-span-3 border border-black px-1 py-0.5 text-center font-semibold min-h-[22px] truncate">
                  {ck.khoa || ''}
                </div>
                <div className="col-span-4 text-[10pt] text-center border-b border-dotted border-black">
                  {ck.gio ? `${ck.gio}h${ck.phut || '00'} ${ck.ngay || ''}` : '....giờ....ph ..../..../....'}
                </div>
                <div className="col-span-2 text-right">
                  <CharBoxes value={ck.soNgayDT} length={2} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nửa phải: 14, 17, 18, 19 */}
        <div className="col-span-6 flex flex-col">
          <div className="p-1.5 border-b border-black">
            <div className="flex items-center flex-wrap gap-1 mb-1">
              <span>14. Nơi giới thiệu:</span>
              <OptionCheck label="1.Cơ quan y tế" checked={data.noiGioiThieu === 1} />
              <OptionCheck label="2.Tự đến" checked={data.noiGioiThieu === 2} />
              <OptionCheck label="3.Khác" checked={data.noiGioiThieu === 3} />
            </div>
            <div className="flex items-center justify-between">
              <span>- Vào viện do bệnh này lần thứ:</span>
              <CharBoxes value={data.vaoVienLanThu} length={1} />
            </div>
          </div>

          <div className="p-1.5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center flex-wrap gap-1 mb-1">
                <span>17. Chuyển viện:</span>
                <OptionCheck label="1.Tuyến trên" checked={chuyenVien.loai === 1} />
                <OptionCheck label="2.Tuyến dưới" checked={chuyenVien.loai === 2} />
                <OptionCheck label="3.CK" checked={chuyenVien.loai === 3} />
              </div>
              <DottedField label="- Chuyển đến:" value={chuyenVien.chuyenDen} />
            </div>

            <div className="mt-1">
              <div className="mb-1">
                18. Ra viện:{' '}
                <span className="border-b border-dotted border-black px-1 font-semibold">
                  {raVien.gio || '....'}
                </span>{' '}
                giờ{' '}
                <span className="border-b border-dotted border-black px-1 font-semibold">
                  {raVien.phut || '....'}
                </span>{' '}
                ngày{' '}
                <span className="border-b border-dotted border-black px-2 font-semibold">
                  {raVien.ngay || '..../..../........'}
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-1 mb-1">
                <OptionCheck label="1.Ra viện" checked={raVien.hinhThuc === 1} />
                <OptionCheck label="2.Xin về" checked={raVien.hinhThuc === 2} />
                <OptionCheck label="3.Bỏ về" checked={raVien.hinhThuc === 3} />
                <OptionCheck label="4.Đưa về" checked={raVien.hinhThuc === 4} />
              </div>
              <div className="flex items-center justify-between">
                <DottedField
                  label="19. Tổng số ngày điều trị:"
                  value={data.tongSoNgayDieuTri}
                  className="flex-1 mr-2"
                />
                <CharBoxes value={data.tongSoNgayDieuTri} length={3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
