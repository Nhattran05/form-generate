import React from 'react';
import { A4Page } from '../primitives/MedicalPrimitives';
import { AdminSection } from '../sections/AdminSection';
import { ClinicalRecordSection } from '../sections/ClinicalRecordSection';
import { DiagnosisSection } from '../sections/DiagnosisSection';
import { DischargeStatusSection } from '../sections/DischargeStatusSection';
import { HeaderSection } from '../sections/HeaderSection';
import { PatientManagementSection } from '../sections/PatientManagementSection';
import { SummarySection } from '../sections/SummarySection';
import { MedicalRecordJsonData, MedicalTemplateSchema } from '../types/form.types';

/**
 * Component chính nhận (schema, data) và tự động lắp ghép các khối (Sections)
 * thành các trang khổ A4 chuẩn Thông tư 32/2023/TT-BYT.
 */
export const MedicalFormRenderer: React.FC<{
  schema: MedicalTemplateSchema;
  data: MedicalRecordJsonData;
}> = ({ schema, data }) => {
  const { config } = schema;

  // Trường hợp 1: Bệnh án Ngoại trú (2 trang: Trang 1 = Hành chính + Bệnh án; Trang 2 = Tổng kết)
  if (config.headerVariant === 'outpatient') {
    return (
      <div className="medical-form-document">
        <A4Page>
          <HeaderSection
            header={data.header}
            defaultTitle={schema.title}
            defaultCode={schema.officialCode}
            variant="outpatient"
          />
          <AdminSection data={data.hanhChinh} variant="outpatient" />
          <ClinicalRecordSection data={data.benhAn} config={config} />
        </A4Page>

        <A4Page>
          <SummarySection data={data.tongKet} variant="outpatient" />
        </A4Page>
      </div>
    );
  }

  // Trường hợp 2: Bệnh án Nội trú chuẩn (Nội khoa, Nhi khoa, Ngoại khoa, YHCT...)
  return (
    <div className="medical-form-document">
      {/* Trang 1: Bìa Hành chính - Quản lý người bệnh - Chẩn đoán - Tình trạng ra viện */}
      <A4Page>
        <HeaderSection
          header={data.header}
          defaultTitle={schema.title}
          defaultCode={schema.officialCode}
          variant={config.headerVariant}
        />
        <AdminSection data={data.hanhChinh} variant={config.adminVariant} />
        {config.managementVariant === 'inpatient' && (
          <PatientManagementSection data={data.quanLyNguoiBenh} />
        )}
        <DiagnosisSection data={data.chanDoan} variant={config.diagnosisVariant} />
        <DischargeStatusSection data={data.tinhTrangRaVien} variant={config.dischargeVariant} />
      </A4Page>

      {/* Trang 2 (và tự động giãn): A. Bệnh án (Hỏi bệnh, Tiền sử, Khám bệnh, Sinh hiệu, Các cơ quan, Chẩn đoán khoa) */}
      <A4Page>
        <ClinicalRecordSection data={data.benhAn} config={config} />
      </A4Page>

      {/* Trang cuối: B. Tổng kết bệnh án + Bảng giao nhận Hồ sơ, phim, ảnh */}
      <A4Page>
        <SummarySection data={data.tongKet} variant={config.summaryVariant} />
      </A4Page>
    </div>
  );
};
