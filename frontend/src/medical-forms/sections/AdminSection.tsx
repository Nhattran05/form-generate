import React from 'react';
import {
  BhytBoxes,
  CharBoxes,
  DateBoxes,
  DottedField,
  OptionCheck,
} from '../primitives/MedicalPrimitives';

export const AdminSection: React.FC<{
  data?: Record<string, any>;
  variant?: 'adult' | 'pediatric' | 'outpatient' | 'yhct';
}> = ({ data = {}, variant = 'adult' }) => {
  const diaChi = data.diaChi || {};
  const denKham = data.denKhamLuc || {};

  return (
    <div className="mb-2 text-[11.5pt]">
      <div className="flex items-center justify-between font-bold uppercase mb-0.5">
        <span>I. HÀNH CHÍNH:</span>
        <span className="font-normal capitalize pr-1 text-[11pt]">
          Tuổi {data.donViTuoi ? `(${data.donViTuoi})` : ''}
        </span>
      </div>

      {/* Dòng 1: Họ tên + Ngày sinh + Tuổi */}
      <div className="flex items-center gap-2 mb-1">
        <DottedField
          label={<span>1. Họ và tên <i>(In hoa)</i>:</span>}
          value={data.hoVaTen}
          boldValue
          uppercase
          className="flex-1"
        />
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span>2. Sinh ngày:</span>
          <DateBoxes value={data.sinhNgay} />
        </div>
        <div className="ml-2">
          <CharBoxes value={data.tuoi} length={2} />
        </div>
      </div>

      {/* Dòng 2: Giới + Nghề nghiệp */}
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span>3. Giới:</span>
          <OptionCheck label="1. Nam" checked={data.gioi === 1} />
          <OptionCheck label="2. Nữ" checked={data.gioi === 2} />
        </div>
        {variant !== 'pediatric' && (
          <div className="flex items-center gap-1 flex-1">
            <DottedField label="4. Nghề nghiệp:" value={data.ngheNghiep} className="flex-1" />
            <CharBoxes value={data.maNgheNghiep} length={2} />
          </div>
        )}
      </div>

      {/* Dòng 3: Dân tộc + Ngoại kiều */}
      <div className="grid grid-cols-12 gap-2 mb-1">
        <div className="col-span-6 flex items-center gap-1">
          <DottedField
            label={variant === 'pediatric' ? '4. Dân tộc:' : '5. Dân tộc:'}
            value={data.danToc}
            className="flex-1"
          />
          <CharBoxes value={data.maDanToc} length={2} />
        </div>
        <div className="col-span-6 flex items-center gap-1">
          <DottedField
            label={variant === 'pediatric' ? '5. Ngoại kiều:' : '6. Ngoại kiều:'}
            value={data.ngoaiKieu}
            className="flex-1"
          />
          <CharBoxes value={data.maNgoaiKieu} length={2} />
        </div>
      </div>

      {/* Dòng 4 & 5: Địa chỉ */}
      <div className="grid grid-cols-12 gap-2 mb-1">
        <div className="col-span-3">
          <DottedField
            label={variant === 'pediatric' ? '6. Địa chỉ: Số nhà' : '7. Địa chỉ: Số nhà'}
            value={diaChi.soNha}
          />
        </div>
        <div className="col-span-4">
          <DottedField label="Thôn, phố:" value={diaChi.thonPho} />
        </div>
        <div className="col-span-5">
          <DottedField label="Xã, phường:" value={diaChi.xaPhuong} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 mb-1">
        <div className="col-span-6 flex items-center gap-1">
          <DottedField label="Huyện (Q, Tx):" value={diaChi.huyenQuan} className="flex-1" />
          <CharBoxes value={diaChi.maHuyenQuan} length={2} />
        </div>
        <div className="col-span-6 flex items-center gap-1">
          <DottedField label="Tỉnh, thành phố:" value={diaChi.tinhThanhPho} className="flex-1" />
          <CharBoxes value={diaChi.maTinhThanhPho} length={2} />
        </div>
      </div>

      {/* Nếu là Nhi khoa: Hiển thị thông tin Bố / Mẹ */}
      {variant === 'pediatric' ? (
        <>
          <div className="grid grid-cols-12 gap-2 mb-1">
            <div className="col-span-4">
              <DottedField label="7. Họ tên bố:" value={data.hoTenBo} />
            </div>
            <div className="col-span-2">
              <DottedField label="Trình độ VH:" value={data.trinhDoVHBo} />
            </div>
            <div className="col-span-4">
              <DottedField label="Họ tên mẹ:" value={data.hoTenMe} />
            </div>
            <div className="col-span-2">
              <DottedField label="Trình độ VH:" value={data.trinhDoVHMe} />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 mb-1">
            <div className="col-span-6">
              <DottedField label="Nghề nghiệp của bố:" value={data.ngheNghiepBo} />
            </div>
            <div className="col-span-6">
              <DottedField label="Nghề nghiệp của mẹ:" value={data.ngheNghiepMe} />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span>8. Đối tượng:</span>
            <OptionCheck label="1. BHYT" checked={data.doiTuong === 1} />
            <OptionCheck label="2. Thu phí" checked={data.doiTuong === 2} />
            <OptionCheck label="3. Miễn" checked={data.doiTuong === 3} />
            <OptionCheck label="4. Khác" checked={data.doiTuong === 4} />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-12 gap-2 items-center mb-1">
          <div className="col-span-5">
            <DottedField label="8. Nơi làm việc:" value={data.noiLamViec} />
          </div>
          <div className="col-span-7 flex items-center justify-end gap-1 flex-wrap">
            <span className="mr-1">9. Đối tượng:</span>
            <OptionCheck label="1.BHYT" checked={data.doiTuong === 1} />
            <OptionCheck label="2.Thu phí" checked={data.doiTuong === 2} />
            <OptionCheck label="3.Miễn" checked={data.doiTuong === 3} />
            <OptionCheck label="4.Khác" checked={data.doiTuong === 4} />
          </div>
        </div>
      )}

      {/* BHYT */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <DottedField
          label={
            variant === 'pediatric'
              ? '9. BHYT giá trị đến ngày:'
              : '10. BHYT giá trị đến ngày:'
          }
          value={data.bhytGiaTriDen}
          className="flex-1"
        />
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span>Số thẻ BHYT:</span>
          <BhytBoxes value={data.soTheBhyt} />
        </div>
      </div>

      {/* Người nhà & Điện thoại */}
      <div className="grid grid-cols-12 gap-2 mb-1">
        <div className="col-span-8">
          <DottedField
            label={
              variant === 'pediatric'
                ? '10. Họ tên, địa chỉ người nhà khi cần báo tin:'
                : '11. Họ tên, địa chỉ người nhà khi cần báo tin:'
            }
            value={data.nguoiNha}
          />
        </div>
        <div className="col-span-4">
          <DottedField label="Điện thoại số:" value={data.dienThoaiNguoiNha} />
        </div>
      </div>

      {/* Nếu là Ngoại trú: thêm mục 12. Đến khám bệnh lúc & 13. Chẩn đoán nơi giới thiệu */}
      {variant === 'outpatient' && (
        <>
          <div className="flex items-center gap-2 mb-1">
            <span>12. Đến khám bệnh lúc:</span>
            <span className="border-b border-dotted border-black px-2 font-medium">
              {denKham.gio || '....'} giờ {denKham.phut || '....'} phút, ngày {denKham.ngay || '..../..../........'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <DottedField
              label="13. Chẩn đoán của nơi giới thiệu:"
              value={data.chanDoanNoiGioiThieu}
              className="flex-1"
            />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <OptionCheck label="1. Y tế" checked={data.noiGioiThieu === 1} />
              <OptionCheck label="2. Tự đến" checked={data.noiGioiThieu === 2} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
