import React from 'react';
import { DottedField } from '../primitives/MedicalPrimitives';

export const HeaderSection: React.FC<{
  header?: Record<string, any>;
  defaultTitle?: string;
  defaultCode?: string;
  variant?: 'standard' | 'outpatient' | 'yhct';
}> = ({
  header = {},
  defaultTitle = 'BỆNH ÁN NỘI KHOA',
  defaultCode = 'MS: 01/BV-01',
  variant = 'standard',
}) => {
  const title = header.tenBenhAn || defaultTitle;
  const code = header.maSo || defaultCode;

  return (
    <div className="grid grid-cols-12 gap-2 items-start mb-2 text-[11.5pt]">
      {/* Cột trái */}
      <div className="col-span-4">
        <DottedField label="Sở Y tế:" value={header.soYTe} />
        <DottedField label="Bệnh viện:" value={header.benhVien} />
        {variant === 'outpatient' ? (
          <DottedField label="Khoa:" value={header.khoa} />
        ) : (
          <div className="flex items-baseline gap-1">
            <DottedField label="Khoa:" value={header.khoa} className="flex-1" />
            <DottedField label="Giường:" value={header.giuong} minWidth="28px" className="w-24" />
          </div>
        )}
      </div>

      {/* Cột giữa: Tên Bệnh Án */}
      <div className="col-span-4 text-center flex flex-col justify-center pt-1">
        <h1 className="text-[15.5pt] font-bold uppercase leading-tight tracking-tight">
          {title}
        </h1>
        {variant === 'yhct' && (
          <div className="text-[11.5pt] font-bold uppercase mt-1">PHẦN I: PHẦN CHUNG</div>
        )}
      </div>

      {/* Cột phải: Mã số, Số lưu trữ, Mã YT */}
      <div className="col-span-4 pl-2">
        <div className="font-medium mb-0.5">{code}</div>
        {variant === 'outpatient' && (
          <DottedField label="Số ngoại trú:" value={header.soNgoaiTru} />
        )}
        {variant === 'yhct' && (
          <>
            <DottedField label="Mã người bệnh:" value={header.maNguoiBenh} />
            <DottedField label="Số vào viện:" value={header.soVaoVien} />
          </>
        )}
        <DottedField label="Số lưu trữ:" value={header.soLuuTru} />
        <DottedField label="Mã YT:" value={header.maYT} />
      </div>
    </div>
  );
};
