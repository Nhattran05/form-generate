import React from 'react';
import {
  CharBoxes,
  DottedBlock,
  DottedField,
  OptionCheck,
  RelatedCharacteristicsTable,
  VitalsBox,
} from '../primitives/MedicalPrimitives';
import { TemplateConfig } from '../types/form.types';

export const ClinicalRecordSection: React.FC<{
  data?: Record<string, any>;
  config: TemplateConfig;
}> = ({ data = {}, config }) => {
  const hoiBenh = data.hoiBenh || {};
  const khamBenh = data.khamBenh || {};
  const sinhHieu = khamBenh.sinhHieu || {};
  const coQuan = khamBenh.coQuan || {};
  const cdKhoa = data.chanDoanKhoa || {};
  const sinhTruong = hoiBenh.quaTrinhSinhTruong || {};
  const yhct = data.yhct || {};
  const cdYHCT = yhct.chanDoanYHCT || {};
  const dtYHCT = yhct.dieuTriYHCT || {};

  // Trường hợp Bệnh Án Ngoại Trú (15/BV1): Nằm gọn ngay trên Trang 1
  if (config.headerVariant === 'outpatient') {
    const tiemChungList: number[] = Array.isArray(sinhTruong.daTiemChung)
      ? sinhTruong.daTiemChung
      : [];
    void tiemChungList;

    return (
      <div className="mt-1 text-[11.5pt]">
        <DottedField
          label={<span className="font-bold uppercase">II. LÝ DO VÀO VIỆN:</span>}
          value={data.lyDoVaoVien}
        />

        <div className="font-bold uppercase mt-1">III. HỎI BỆNH:</div>
        <DottedBlock
          label="1. Quá trình bệnh lý:"
          value={hoiBenh.quaTrinhBenhLy}
          lines={3}
        />
        <div className="font-bold mb-0.5">2. Tiền sử bệnh:</div>
        <DottedField label="+ Bản thân:" value={hoiBenh.tienSuBanThan} />
        <DottedField label="+ Gia đình:" value={hoiBenh.tienSuGiaDinh} />

        <div className="font-bold uppercase mt-1.5 mb-0.5">IV. KHÁM BỆNH:</div>
        <div className="grid grid-cols-12 gap-3 items-start mb-1">
          <div className="col-span-8">
            <DottedBlock label="1. Toàn thân:" value={khamBenh.toanThan} lines={3} />
            <DottedBlock label="2. Các bộ phận:" value={khamBenh.cacBoPhan} lines={3} />
          </div>
          <div className="col-span-4">
            <VitalsBox vitals={sinhHieu} fields={config.vitalsFields} />
          </div>
        </div>

        <DottedBlock
          label="3. Tóm tắt kết quả cận lâm sàng:"
          value={khamBenh.tomTatKetQuaCanLamSang}
          lines={2}
        />
        <DottedField
          label={<span className="font-bold">4. Chẩn đoán ban đầu:</span>}
          value={khamBenh.chanDoanBanDau}
        />
        <DottedBlock
          label="5. Đã xử lý (thuốc, chăm sóc):"
          value={khamBenh.daXuLy}
          lines={3}
        />
        <div className="flex items-center justify-between gap-2 my-1">
          <DottedField
            label={<span className="font-bold">6. Chẩn đoán khi ra viện:</span>}
            value={khamBenh.chanDoanKhiRaVien}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <span>Mã</span>
            <CharBoxes value={khamBenh.maChanDoanRaVien} length={4} />
          </div>
        </div>
        <div className="mb-2">
          <span className="font-bold">7. Điều trị ngoại trú từ ngày: </span>
          <span className="border-b border-dotted border-black px-3 font-medium">
            {khamBenh.dieuTriNgoaiTruTuNgay || '..../..../........'}
          </span>{' '}
          đến ngày{' '}
          <span className="border-b border-dotted border-black px-3 font-medium">
            {khamBenh.dieuTriNgoaiTruDenNgay || '..../..../........'}
          </span>
        </div>

        <div className="grid grid-cols-2 text-center mt-2">
          <div>
            <div className="font-bold mt-4">Giám đốc bệnh viện</div>
            <div className="mt-10 px-6">
              <DottedField label="Họ và tên:" value={data.giamDocBenhVien} boldValue />
            </div>
          </div>
          <div>
            <div className="italic">
              Ngày {data.ngayLamBenhAn || '....'} tháng {data.thangLamBenhAn || '....'} năm{' '}
              {data.namLamBenhAn || '........'}
            </div>
            <div className="font-bold">Bác sỹ khám bệnh</div>
            <div className="mt-10 px-6">
              <DottedField label="Họ và tên:" value={data.bacSyKhamBenh} boldValue />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Trường hợp Bệnh Án Nội Trú Chuẩn (Nội khoa, Nhi khoa, Ngoại khoa, YHCT...)
  const tiemChungArr: number[] = Array.isArray(sinhTruong.daTiemChung)
    ? sinhTruong.daTiemChung
    : [];

  return (
    <div className="text-[11.5pt]">
      <div className="font-bold text-[13pt] uppercase mb-1">
        {config.hasTraditionalMedicine ? 'PHẦN II: BỆNH ÁN — A. Y HỌC HIỆN ĐẠI' : 'A- BỆNH ÁN'}
      </div>

      {/* I. Lý do vào viện */}
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <DottedField
          label={<span className="font-bold">I. Lý do vào viện:</span>}
          value={data.lyDoVaoVien}
          className="flex-1"
        />
        <div className="whitespace-nowrap">
          Vào ngày thứ{' '}
          <span className="border-b border-dotted border-black px-2 font-semibold">
            {data.vaoNgayThu || '....'}
          </span>{' '}
          của bệnh
        </div>
      </div>

      {/* II. Hỏi bệnh */}
      <div className="font-bold mb-1">II. Hỏi bệnh:</div>
      <DottedBlock
        label="1. Quá trình bệnh lý:"
        subLabel="(khởi phát, diễn biến, chẩn đoán, điều trị của tuyến dưới v.v...)"
        value={hoiBenh.quaTrinhBenhLy}
        lines={4}
      />

      <div className="font-bold mb-0.5">2. Tiền sử bệnh:</div>
      <DottedBlock
        label="+ Bản thân:"
        subLabel="(phát triển thể lực từ nhỏ đến lớn, những bệnh đã mắc, phương pháp ĐTr, tiêm phòng, ăn uống, sinh hoạt...)"
        value={hoiBenh.tienSuBanThan}
        lines={2}
      />

      {config.hasRelatedCharacteristicsTable && (
        <RelatedCharacteristicsTable data={hoiBenh.dacDiemLienQuan} />
      )}

      <DottedBlock
        label="+ Gia đình:"
        subLabel="(Những người trong gia đình: bệnh đã mắc, đời sống, tinh thần, vật chất v.v...)"
        value={hoiBenh.tienSuGiaDinh}
        lines={2}
      />

      {/* Nếu là Nhi Khoa: thêm mục 3. Quá trình sinh trưởng */}
      {config.hasGrowthHistory && (
        <div className="my-2 p-2 border border-dashed border-slate-400 rounded-sm text-[11pt]">
          <div className="font-bold mb-1">3. Quá trình sinh trưởng:</div>
          <div className="flex items-center flex-wrap gap-3 mb-1">
            <span>
              - Con thứ mấy:{' '}
              <strong className="border-b border-dotted border-black px-2">
                {sinhTruong.conThuMay || '..'}
              </strong>
            </span>
            <span className="inline-flex items-center gap-1">
              - Tiền thai (Para): <CharBoxes value={sinhTruong.para} length={4} />
              <i className="text-[10pt]">(Sinh đủ tháng, Sớm đẻ non, Sẩy, Sống)</i>
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-1 mb-1">
            <span>- Tình trạng khi sinh:</span>
            <OptionCheck label="1.Đẻ thường" checked={sinhTruong.tinhTrangKhiSinh === 1} />
            <OptionCheck label="2.Forceps" checked={sinhTruong.tinhTrangKhiSinh === 2} />
            <OptionCheck label="3.Giác hút" checked={sinhTruong.tinhTrangKhiSinh === 3} />
            <OptionCheck label="4.Đẻ phẫu thuật" checked={sinhTruong.tinhTrangKhiSinh === 4} />
            <OptionCheck label="5.Đẻ chỉ huy" checked={sinhTruong.tinhTrangKhiSinh === 5} />
            <OptionCheck label="6.Khác" checked={sinhTruong.tinhTrangKhiSinh === 6} />
          </div>
          <div className="flex items-center gap-3 mb-1">
            <span>
              - Cân nặng lúc sinh:{' '}
              <strong className="border-b border-dotted border-black px-2">
                {sinhTruong.canNangLucSinh || '....'}
              </strong>{' '}
              kg.
            </span>
            <OptionCheck label="Dị tật bẩm sinh:" checked={Boolean(sinhTruong.diTatBamSinh)} />
            <DottedField
              label="Cụ thể tật bẩm sinh:"
              value={sinhTruong.cuTheTatBamSinh}
              className="flex-1"
            />
          </div>
          <DottedField label="- Phát triển về tinh thần:" value={sinhTruong.phatTrienTinhThan} />
          <DottedField label="- Phát triển về vận động:" value={sinhTruong.phatTrienVanDong} />
          <DottedField label="- Các bệnh lý khác:" value={sinhTruong.cacBenhLyKhac} />
          <div className="flex items-center flex-wrap gap-2 my-1">
            <span>- Nuôi dưỡng:</span>
            <OptionCheck label="1. Sữa mẹ" checked={sinhTruong.nuoiDuong === 1} />
            <OptionCheck label="2. Nuôi nhân tạo" checked={sinhTruong.nuoiDuong === 2} />
            <OptionCheck label="3. Hỗn hợp" checked={sinhTruong.nuoiDuong === 3} />
            <span>
              - Cai sữa tháng thứ:{' '}
              <strong className="border-b border-dotted border-black px-2">
                {sinhTruong.caiSuaThangThu || '..'}
              </strong>
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-1 mb-1">
            <span>- Đã tiêm chủng:</span>
            <OptionCheck label="1.Lao" checked={tiemChungArr.includes(1)} />
            <OptionCheck label="2.Bại liệt" checked={tiemChungArr.includes(2)} />
            <OptionCheck label="3.Sởi" checked={tiemChungArr.includes(3)} />
            <OptionCheck label="4.Ho gà" checked={tiemChungArr.includes(4)} />
            <OptionCheck label="5.Uốn ván" checked={tiemChungArr.includes(5)} />
            <OptionCheck label="6.Bạch hầu" checked={tiemChungArr.includes(6)} />
          </div>
          <DottedField
            label="- Cụ thể những bệnh khác được tiêm chủng:"
            value={sinhTruong.tiemChungKhac}
          />
        </div>
      )}

      {/* III. Khám bệnh */}
      <div className="font-bold mt-2 mb-1">III. Khám bệnh:</div>
      <div className="grid grid-cols-12 gap-3 items-start mb-2">
        <div className="col-span-8">
          <div className="mb-1">
            <span className="font-bold">1. Toàn thân: </span>
            <span className="italic text-[11pt]">
              (ý thức, da niêm mạc, hệ thống hạch, tuyến giáp, vị trí, kích thước, số lượng, di động v.v...)
            </span>
          </div>
          {config.hasGrowthHistory && (
            <div className="flex items-center gap-4 mb-1 text-[11pt]">
              <span>
                - Chiều cao: <strong>{khamBenh.chieuCao || '....'}</strong> cm;
              </span>
              <span>
                - Vòng ngực: <strong>{khamBenh.vongNguc || '....'}</strong> cm;
              </span>
              <span>
                - Vòng đầu: <strong>{khamBenh.vongDau || '....'}</strong> cm
              </span>
            </div>
          )}
          <DottedBlock value={khamBenh.toanThan} lines={4} />
        </div>
        <div className="col-span-4">
          <VitalsBox vitals={sinhHieu} fields={config.vitalsFields} />
        </div>
      </div>

      {/* Nếu là Ngoại khoa: 2. Bệnh ngoại khoa */}
      {config.hasSurgicalBlock && (
        <DottedBlock
          label="2. Bệnh ngoại khoa (hoặc Bệnh chuyên khoa):"
          value={khamBenh.benhNgoaiKhoa}
          lines={4}
        />
      )}

      {/* Khám các cơ quan */}
      <div className="font-bold mb-1">
        {config.hasSurgicalBlock ? '3. Các cơ quan:' : '2. Các cơ quan:'}
      </div>
      {config.organFields.map((org) => (
        <DottedBlock
          key={org.key}
          label={`${org.label}:`}
          value={coQuan[org.key]}
          lines={org.lines || 2}
        />
      ))}

      {/* Xét nghiệm cận lâm sàng & Tóm tắt bệnh án */}
      <DottedBlock
        label={
          config.hasSurgicalBlock
            ? '4. Các xét nghiệm cận lâm sàng cần làm:'
            : '3. Các xét nghiệm cận lâm sàng cần làm:'
        }
        value={khamBenh.xetNghiemCanLam}
        lines={3}
      />

      <DottedBlock
        label={config.hasSurgicalBlock ? '5. Tóm tắt bệnh án:' : '4. Tóm tắt bệnh án:'}
        value={khamBenh.tomTatBenhAn}
        lines={4}
      />

      {/* Nếu là YHCT: Hiển thị thêm phần B. Y HỌC CỔ TRUYỀN (Tứ chẩn & Biện chứng luận trị) */}
      {config.hasTraditionalMedicine && (
        <div className="mt-3 pt-2 border-t border-black">
          <div className="font-bold text-[12.5pt] uppercase mb-1">B. Y HỌC CỔ TRUYỀN</div>
          <DottedBlock label="I. VỌNG CHẨN:" value={yhct.vongChan} lines={2} />
          <DottedBlock label="II. VĂN CHẨN:" value={yhct.vanChan} lines={2} />
          <DottedBlock label="III. VẤN CHẨN:" value={yhct.vanChanHoi} lines={3} />
          <DottedBlock label="IV. THIẾT CHẨN (Xúc chẩn, Mạch chẩn):" value={yhct.thietChan} lines={2} />
          <DottedBlock label="V. TÓM TẮT TỨ CHẨN:" value={yhct.tomTatTuChan} lines={2} />
          <DottedBlock label="VI. BIỆN CHỨNG LUẬN TRỊ:" value={yhct.bienChungLuanTri} lines={3} />
          <div className="font-bold mt-1 mb-0.5">VII. CHẨN ĐOÁN YHCT:</div>
          <DottedField label="1. Bệnh danh:" value={cdYHCT.benhDanh} />
          <DottedField label="2. Bát cương:" value={cdYHCT.batCuong} />
          <DottedField label="3. Nguyên nhân:" value={cdYHCT.nguyenNhan} />
          <DottedField label="4. Tạng phủ:" value={cdYHCT.tangPhu} />
          <DottedField label="5. Kinh mạch:" value={cdYHCT.kinhMach} />
          <DottedField label="6. Định vị bệnh:" value={cdYHCT.dinhViBenh} />
          <div className="font-bold mt-1 mb-0.5">C. ĐIỀU TRỊ YHCT:</div>
          <DottedField label="1. Pháp điều trị:" value={dtYHCT.phapDieuTri} />
          <DottedBlock label="2. Phương dược:" value={dtYHCT.phuongDuoc} lines={2} />
          <DottedBlock
            label="3. Phương pháp điều trị không dùng thuốc:"
            value={dtYHCT.khongDungThuoc}
            lines={2}
          />
        </div>
      )}

      {/* IV. Chẩn đoán khi vào khoa điều trị, V. Tiên lượng, VI. Hướng điều trị */}
      <div className="font-bold mt-2 mb-0.5">IV. Chẩn đoán khi vào khoa điều trị:</div>
      <DottedField label="+ Bệnh chính:" value={cdKhoa.benhChinh} boldValue />
      <DottedField label="+ Bệnh kèm theo (nếu có):" value={cdKhoa.benhKemTheo} />
      <DottedField label="+ Phân biệt:" value={cdKhoa.phanBiet} />

      <DottedBlock label="V. Tiên lượng:" value={data.tienLuong} lines={2} className="mt-1" />
      <DottedBlock label="VI. Hướng điều trị:" value={data.huongDieuTri} lines={2} />

      <div className="flex justify-end mt-3">
        <div className="w-72 text-center">
          <div className="italic">
            Ngày {data.ngayLamBenhAn || '....'} tháng {data.thangLamBenhAn || '....'} năm{' '}
            {data.namLamBenhAn || '........'}
          </div>
          <div className="font-bold text-[12pt]">
            {config.hasTraditionalMedicine
              ? 'Thầy thuốc khám bệnh, chữa bệnh'
              : 'Bác sỹ làm bệnh án'}
          </div>
          <div className="mt-10">
            <DottedField label="Họ và tên:" value={data.bacSyLamBenhAn} boldValue />
          </div>
        </div>
      </div>
    </div>
  );
};
