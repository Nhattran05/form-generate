import React from 'react';
import { CharBoxes, DottedField, OptionCheck } from '../primitives/MedicalPrimitives';

export const DischargeStatusSection: React.FC<{
  data?: Record<string, any>;
  variant?: 'standard' | 'surgical' | 'none';
}> = ({ data = {}, variant = 'standard' }) => {
  if (variant === 'none') return null;

  const tv = data.tuVong || {};

  return (
    <div className="mb-1 text-[11pt]">
      <div className="font-bold uppercase mb-0.5">IV. TÌNH TRẠNG RA VIỆN:</div>
      <div className="med-box-frame grid grid-cols-12">
        {/* Cột Trái: Kết quả điều trị & Giải phẫu bệnh */}
        <div className="col-span-5 border-r border-black p-1.5 flex flex-col justify-between">
          <div>
            <div className="font-semibold mb-1">
              {variant === 'surgical' ? '26. Kết quả điều trị:' : '24. Kết quả điều trị:'}
            </div>
            <div className="grid grid-cols-2 gap-y-0.5 italic text-[10.5pt]">
              <OptionCheck label="1. Khỏi" checked={data.ketQuaDieuTri === 1} />
              <OptionCheck label="4. Nặng hơn" checked={data.ketQuaDieuTri === 4} />
              <OptionCheck label="2. Đỡ, giảm" checked={data.ketQuaDieuTri === 2} />
              <OptionCheck label="5. Tử vong" checked={data.ketQuaDieuTri === 5} />
              <OptionCheck label="3. Không thay đổi" checked={data.ketQuaDieuTri === 3} />
            </div>
          </div>

          <div className="mt-2 pt-1 border-t border-dotted border-slate-400">
            <div className="mb-1">
              {variant === 'surgical' ? '27.' : '25.'} Giải phẫu bệnh <i>(khi có sinh thiết)</i>:
            </div>
            <div className="flex items-center flex-wrap gap-1 italic text-[10.5pt]">
              <OptionCheck label="1. Lành tính" checked={data.giaiPhauBenh === 1} />
              <OptionCheck label="2. Nghi ngờ" checked={data.giaiPhauBenh === 2} />
              <OptionCheck label="3. Ác tính" checked={data.giaiPhauBenh === 3} />
            </div>
          </div>
        </div>

        {/* Cột Phải: Tình hình tử vong */}
        <div className="col-span-7 p-1.5 flex flex-col justify-between">
          <div>
            <div className="mb-1">
              {variant === 'surgical' ? '28.' : '26.'} Tình hình tử vong:{' '}
              <span className="border-b border-dotted border-black px-1">{tv.gio || '....'}</span> giờ{' '}
              <span className="border-b border-dotted border-black px-1">{tv.phut || '....'}</span> ph,
              ngày{' '}
              <span className="border-b border-dotted border-black px-2">
                {tv.ngay || '..../..../........'}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-2 italic text-[10.5pt] mb-1">
              <OptionCheck label="1. Do bệnh" checked={tv.nguyenNhan === 1} />
              <OptionCheck label="2. Do tai biến điều trị" checked={tv.nguyenNhan === 2} />
              <OptionCheck label="3. Khác" checked={tv.nguyenNhan === 3} />
            </div>
            <div className="flex items-center flex-wrap gap-2 italic text-[10.5pt] mb-1">
              <OptionCheck label="1. Trong 24 giờ vào viện" checked={tv.thoiGian === 1} />
              <OptionCheck
                label={
                  variant === 'surgical' ? '2. Trong 48 giờ vào viện' : '2. Sau 24 giờ vào viện'
                }
                checked={tv.thoiGian === 2}
              />
              {variant === 'surgical' && (
                <OptionCheck label="3. Trong 72 giờ vào viện" checked={tv.thoiGian === 3} />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <DottedField
                label={
                  variant === 'surgical'
                    ? '29. Nguyên nhân chính tử vong:'
                    : '27. Nguyên nhân chính tử vong:'
                }
                value={tv.nguyenNhanChinh}
                className="flex-1"
              />
              <CharBoxes value={tv.maNguyenNhanChinh} length={4} />
            </div>
            <div className="flex items-center justify-between gap-1">
              <OptionCheck
                label={
                  variant === 'surgical' ? '30. Khám nghiệm tử thi:' : '28. Khám nghiệm tử thi:'
                }
                checked={Boolean(tv.khamNghiemTuThi)}
              />
              <DottedField
                label={
                  variant === 'surgical'
                    ? '31. Chẩn đoán giải phẫu tử thi:'
                    : '29. Chẩn đoán giải phẫu tử thi:'
                }
                value={tv.chanDoanGiaiPhauTuThi}
                className="flex-1"
              />
              <CharBoxes value={tv.maGiaiPhauTuThi} length={4} />
            </div>
          </div>
        </div>
      </div>

      {/* Chữ ký Giám đốc bệnh viện & Trưởng khoa */}
      <div className="grid grid-cols-2 text-center mt-2">
        <div>
          <div className="font-bold text-[12pt] mt-4">Giám đốc bệnh viện</div>
          <div className="mt-10 px-6">
            <DottedField label="Họ và tên:" value={data.giamDocBenhVien} boldValue />
          </div>
        </div>
        <div>
          <div className="italic">
            Ngày {data.ngayKy || '....'} tháng {data.thangKy || '....'} năm{' '}
            {data.namKy || '........'}
          </div>
          <div className="font-bold text-[12pt]">Trưởng khoa</div>
          <div className="mt-10 px-6">
            <DottedField label="Họ và tên:" value={data.truongKhoa} boldValue />
          </div>
        </div>
      </div>
    </div>
  );
};
