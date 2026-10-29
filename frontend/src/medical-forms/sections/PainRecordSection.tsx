import React from 'react';
import { A4Page } from '../primitives/MedicalPrimitives';
import { MedicalRecordJsonData, MedicalTemplateSchema } from '../types/form.types';

/**
 * Chuyển đổi an toàn mọi kiểu dữ liệu (string, number, boolean, object) sang chuỗi hiển thị
 * để không bao giờ gây lỗi React Error #31 (Objects are not valid as a React child).
 */
export function safeText(val: any): string {
  if (val === null || val === undefined || val === 'N/A') return '';
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'Có / Yes' : 'Không / No';
  if (typeof val === 'object') {
    if ('value' in val) return safeText(val.value);
    if ('soNha' in val || 'tinhThanhPho' in val) {
      return [val.soNha, val.thonPho, val.xaPhuong, val.huyenQuan, val.tinhThanhPho]
        .filter(Boolean)
        .join(', ');
    }
    try {
      return JSON.stringify(val);
    } catch {
      return '';
    }
  }
  return String(val);
}

function safeObj(val: any): Record<string, any> {
  return val && typeof val === 'object' && !Array.isArray(val) ? val : {};
}

const PainPageContainer: React.FC<{
  page: number;
  totalPages?: number;
  docCode?: string;
  children: React.ReactNode;
}> = ({ page, totalPages = 19, docCode = 'VM - BS - V1 - 012', children }) => (
  <A4Page className="flex flex-col justify-between min-h-[297mm]">
    <div className="flex-1 text-[10.5pt] leading-[1.35]">{children}</div>
    <div className="mt-3 pt-1.5 border-t border-black flex items-center justify-between text-[9pt] text-slate-700">
      <span className="font-semibold">{safeText(docCode)}</span>
      <span className="font-bold text-black">{page}</span>
      <span>
        Trang {page} / Page {totalPages}
      </span>
    </div>
  </A4Page>
);

const Chk: React.FC<{ checked?: boolean; label?: React.ReactNode; className?: string }> = ({
  checked,
  label,
  className = '',
}) => (
  <span className={`inline-flex items-center gap-1.5 mr-3 ${className}`}>
    <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-[8.5pt] font-bold leading-none shrink-0">
      {checked ? 'X' : ''}
    </span>
    {label && <span>{label}</span>}
  </span>
);

const DotLine: React.FC<{
  label?: React.ReactNode;
  value?: any;
  className?: string;
}> = ({ label, value, className = '' }) => (
  <div className={`flex items-baseline gap-1.5 my-1 ${className}`}>
    {label && <span className="shrink-0">{label}</span>}
    <span className="flex-1 border-b border-dotted border-black min-h-[1.25em] font-semibold px-1">
      {safeText(value)}
    </span>
  </div>
);

const SectionBanner: React.FC<{ title: React.ReactNode }> = ({ title }) => (
  <div className="border border-black bg-slate-100 px-2.5 py-1.5 font-bold text-[10.5pt] my-2">
    {title}
  </div>
);

const BDI_GROUPS: {
  code: string;
  items: [number, string, string][];
}[] = [
  {
    code: 'A',
    items: [
      [0, 'Tôi không cảm thấy buồn', "I don't feel sad"],
      [1, 'Tôi cảm thấy buồn', 'I feel sad'],
      [2, 'Tôi luôn cảm thấy buồn và không thể loại bỏ nó', "I always feel sad and I can't sort it out"],
      [3, 'Tôi rất buồn và không vui, tôi không thể chịu đựng được nó', "I am so sad and unhappy and I can't bear it"],
    ],
  },
  {
    code: 'B',
    items: [
      [0, 'Tôi không thấy bi quan về tương lai', "I don't feel pessimistic about the future"],
      [1, 'Tôi có cảm giác không tốt về tương lai', 'I have a bad feeling about the future'],
      [2, 'Tôi không có hy vọng gì về tương lai', "I don't have any hope about my future."],
      [3, 'Tôi không có hy vọng gì về tương lai và tình trạng này sẽ không khá hơn', "I don't have any hope about my future and the situation will not be better"],
    ],
  },
  {
    code: 'C',
    items: [
      [0, 'Tôi không có cảm giác thất bại trong cuộc sống của mình', 'I have no sense of failure in my life.'],
      [1, 'Tôi có cảm giác cuộc sống của mình có nhiều thứ hơn những người khác', 'I have the feeling that I have in my life more than someone else'],
      [2, 'Khi tôi nhìn lại quá khứ, tất cả những gì tôi thấy là sự thất bại', 'When I look to my past all what I see are failures'],
      [3, 'Tôi cảm thấy rằng mình đã thất bại trong chính cuộc sống của mình', 'I have a feeling that I failed in all my personal life.'],
    ],
  },
  {
    code: 'D',
    items: [
      [0, 'Tôi không cảm thấy thỏa mãn chút nào', "I don't feel particularly satisfied"],
      [1, 'Tôi không biết làm thế nào để thích nghi với hoàn cảnh', "I don't know how to enjoy the circumstances"],
      [2, 'Tôi không thấy thỏa mãn với bất cứ điều gì', "I don't have any satisfaction with anything"],
      [3, 'Tôi thấy không vui với tất cả mọi thứ', 'I am so unhappy with everything'],
    ],
  },
  {
    code: 'E',
    items: [
      [0, 'Tôi không cảm thấy tội lỗi', "I don't feel guilty"],
      [1, 'Tôi cảm thấy rất tệ ở mọi lúc', 'I feel so bad most of the time'],
      [2, 'Tôi cảm thấy tội lỗi', 'I feel guilty'],
      [3, 'Tôi thấy rất tệ và tôi nghĩ rằng tôi không xứng đáng', 'I feel very bad and I think that I am not worth it'],
    ],
  },
  {
    code: 'F',
    items: [
      [0, 'Tôi không thất vọng về bản thân mình', 'I am not disappointed with myself'],
      [1, 'Tôi thất vọng về bản thân mình', 'I am disappointed by myself'],
      [2, 'Tôi cảm thấy ghê tởm bản thân mình', 'I disgust myself'],
      [3, 'Tôi ghét bản thân mình', 'I hate myself'],
    ],
  },
  {
    code: 'G',
    items: [
      [0, 'Tôi không nghĩ rằng sẽ làm tổn thương bản thân', "I don't think to hurt myself."],
      [1, 'Tôi nghĩ rằng cái chết sẽ giải thoát cho tôi', 'I think that dying will liberate me.'],
      [2, 'Tôi có những kế hoạch tỉ mỉ để tự tử', 'I have precise plans to suicide'],
      [3, 'Nếu có thể, tôi sẽ tự tử', 'If I can, I will kill myself'],
    ],
  },
  {
    code: 'H',
    items: [
      [0, 'Tôi vẫn thích những người khác', 'I am still interested in other people'],
      [1, 'Hiện nay tôi ít hứng thú với những người khác', 'Now, I am less interested in others'],
      [2, 'Tôi mất hết cảm giác với những người khác và tôi không cảm thấy gì về họ cả', "I lost all my interest in others and I don't feel anything for them"],
      [3, 'Tôi mất hết cảm giác với những người khác và tôi không quan tâm về nó', "I lost all my interest in others and I don't care about it"],
    ],
  },
  {
    code: 'I',
    items: [
      [0, 'Tôi vẫn có thể đưa ra quyết định', 'I am still capable to take decisions'],
      [1, 'Tôi đang cố tránh đưa ra quyết định', 'I am trying to avoid taking decisions.'],
      [2, 'Thật khó để đưa ra quyết định', 'It is so hard to take decisions'],
      [3, 'Tôi không thể đưa ra quyết định', 'I am so uncapable to take decisions'],
    ],
  },
  {
    code: 'J',
    items: [
      [0, 'Tôi không cảm thấy mình xấu xí', "I don't have the feeling that I look ugly."],
      [1, 'Tôi sợ già', 'I am afraid to look old.'],
      [2, 'Tôi cảm thấy có gì đó về ngoại hình khiến tôi trở nên thật xấu xí', 'I feel that there is something in my appearance that make me look really ugly'],
      [3, 'Tôi cảm thấy mình trông thật tệ', 'I feel that I look bad.'],
    ],
  },
  {
    code: 'K',
    items: [
      [0, 'Tôi làm việc dễ dàng như trước', 'I work as easy as before.'],
      [1, 'Tôi cần một chút nỗ lực', 'I need to do some effort.'],
      [2, 'Tôi cần rất nhiều nỗ lực mà không làm được gì', 'I need to do a lot of effort to do anything.'],
      [3, 'Tôi không thể làm gì kể cả việc nhỏ nhất', 'I am so uncapable to do the smallest job.'],
    ],
  },
  {
    code: 'L',
    items: [
      [0, 'Tôi không mệt mỏi như mọi khi', 'I am not so tired like usual.'],
      [1, 'Tôi thấy mệt mỏi rất dễ dàng', 'I get tired so easily.'],
      [2, 'Không làm gì cũng khiến tôi mệt mỏi', 'Doing anything makes me tired.'],
      [3, 'Tôi không thể làm bất cứ công việc gì', 'I am not able to do anywork.'],
    ],
  },
  {
    code: 'M',
    items: [
      [0, 'Tôi ăn ngon miệng', 'I have a good appetite.'],
      [1, 'Tôi không thấy ngon miệng như mọi khi', "I don't have a good appetite like usual."],
      [2, 'Bữa ăn của tôi tệ hơn trước rất nhiều', 'My appetite is much worse.'],
      [3, 'Tôi không cảm thấy ngon miệng chút nào', 'I lost my appetite.'],
    ],
  },
];

export const PainRecordSection: React.FC<{
  schema: MedicalTemplateSchema;
  data: MedicalRecordJsonData;
}> = ({ schema, data }) => {
  const header = safeObj(data.header);
  const hc = safeObj(data.hanhChinh);
  const ts = safeObj(data.tienSuBenh);
  const bsd = safeObj(data.benhSuDau);
  const khoiPhat = safeObj(bsd.khoiPhat);
  const mieuTa = safeObj(bsd.mieuTaConDau);
  const cuongDo = safeObj(bsd.cuongDoDau);
  const yeuToTang = safeObj(bsd.yeuToTangDau);
  const cs = safeObj(data.cuocSongHangNgay);
  const vas = safeObj(data.doCuongDoDauVas);
  const likert = safeObj(data.bangDanhGiaDau);
  const bsDienP6 = safeObj(likert.bacSyDien);
  const dtSd = safeObj(data.dienTienVaSoDo);
  const dn4 = safeObj(data.cauHoiDn4);
  const buda = safeObj(data.tieuChuanBudapest);
  const bdi = safeObj(data.thangTramCamBeck);
  const khamCg = safeObj(data.khamCamGiacBacSy);
  const qsDt = safeObj(data.quanSatVaDieuTri);
  const thKq = safeObj(data.tongHopKetQua);
  const ytCn = safeObj(thKq.yeuToCanNguyen);
  const dtXl = safeObj(data.dieuTriXamLan);
  const camKet = safeObj(dtXl.camKet);
  const cdDh = safeObj(data.chanDoanDinhHuong);
  const nbDh = safeObj(cdDh.ngoaiBien);
  const tuDh = safeObj(cdDh.trungUong);
  const td = safeObj(data.theoDoi);

  const docCode = safeText(header.maSo || schema.config.documentCode || 'VM - BS - V1 - 012');
  const totalPages = schema.config.totalPages || 19;

  const bangDieuTriList: any[] = Array.isArray(qsDt.bangDieuTri) ? qsDt.bangDieuTri : [];
  const lichTrinhList: any[] = Array.isArray(td.lichTrinh) ? td.lichTrinh : [];

  const gioiStr =
    safeText(hc.gioiTinh) ||
    (hc.gioi === 1 ? 'Nam / Male' : hc.gioi === 2 ? 'Nữ / Female' : '');

  const renderDailyLifeRow = (key: string, labelVi: string, labelEn: string) => {
    const item = cs[key];
    const val = typeof item === 'object' && item !== null ? safeText(item.value) : safeText(item);
    const checked = typeof item === 'object' && item !== null ? Boolean(item.checked) : false;
    return (
      <div key={key} className="flex items-baseline gap-2 my-1.5">
        <span className="shrink-0 font-semibold">
          {labelVi} / <i className="font-normal">{labelEn}</i>:
        </span>
        <span className="flex-1 border-b border-dotted border-black min-h-[1.2em] px-1 font-medium">
          {val}
        </span>
        <Chk checked={checked} className="mr-0" />
      </div>
    );
  };

  const renderVasBar = (titleVi: string, titleEn: string, selectedVal: any) => {
    const selNum =
      selectedVal !== undefined && selectedVal !== null && String(selectedVal) !== ''
        ? Number(selectedVal)
        : -1;
    return (
      <div className="my-4">
        <div className="font-bold">{titleVi}</div>
        <div className="italic text-[9.5pt] mb-1.5">{titleEn}</div>
        <table className="w-full border-collapse border border-black text-center text-[10pt]">
          <tbody>
            <tr>
              {Array.from({ length: 11 }, (_, i) => (
                <td
                  key={i}
                  className={`border border-black py-1.5 font-bold ${
                    selNum === i ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  {selNum === i ? `[${i}]` : i}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="flex justify-between text-[8.5pt] italic mt-0.5">
          <span>Không đau / None</span>
          <span>Đau nhiều nhất / Max</span>
        </div>
      </div>
    );
  };

  const renderLikertBlock = (qVi: string, qEn: string, selectedIdx: any) => {
    const sel =
      selectedIdx !== undefined && selectedIdx !== null && String(selectedIdx) !== ''
        ? Number(selectedIdx)
        : -1;
    const cols = [
      ['Không bao giờ', 'Never'],
      ['Không rõ', 'Hardly noticed'],
      ['Ít khi', 'Slightly'],
      ['Thường xuyên', 'Moderately'],
      ['Nhiều', 'Strongly'],
      ['Rất nhiều', 'Very strongly'],
    ];
    return (
      <div className="mb-2.5">
        <div className="font-bold text-[9.5pt]">{qVi}</div>
        <div className="italic text-[8.5pt] mb-1">{qEn}</div>
        <table className="w-full border-collapse border border-black text-center text-[8.5pt]">
          <thead>
            <tr className="bg-slate-50">
              {cols.map(([vi, en], idx) => (
                <th key={idx} className="border border-black p-1 font-semibold">
                  <div>{vi}</div>
                  <div className="italic font-normal text-[7.5pt]">{en}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {cols.map((_, idx) => (
                <td key={idx} className="border border-black p-1">
                  <Chk checked={sel === idx} className="mr-0" />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="medical-form-document">
      {/* ==================== TRANG 1 / PAGE 19 ==================== */}
      <PainPageContainer page={1} totalPages={totalPages} docCode={docCode}>
        <div className="mb-2">
          <img
            src="/images/logo.jpg"
            alt="Vinmec Logo"
            className="object-contain"
            style={{ height: '1.2cm' }}
          />
        </div>
        <div className="text-center mb-3">
          <div className="text-[15pt] font-bold uppercase">
            {safeText(header.tenBenhAn) || 'BỆNH ÁN ĐAU'}
          </div>
          <div className="text-[11pt] font-bold uppercase">
            {safeText(header.tenBenhAnEn) || 'PAIN RECORD'}
          </div>
        </div>

        <DotLine
          label={<span><b>Bác sỹ điều trị đau</b> / <i>Pain Clinic Physician</i>:</span>}
          value={header.bacSyDieuTriDau}
        />
        <DotLine
          label={<span><b>Người bệnh</b> / <i>Patient</i>:</span>}
          value={header.nguoiBenh || hc.hoVaTen}
        />
        <DotLine
          label={<span><b>Mã người bệnh</b> / <i>PID</i>:</span>}
          value={header.maNguoiBenh || header.pid}
        />
        <DotLine
          label={<span><b>Hội chứng chính</b> / <i>Main syndrome</i>:</span>}
          value={header.hoiChungChinh}
        />
        <div className="grid grid-cols-2 gap-4">
          <DotLine
            label={<span><b>Ngày khám đầu</b> / <i>Date of first Visit</i>:</span>}
            value={header.ngayKhamDau || hc.ngayKham}
          />
          <DotLine
            label={<span><b>Điều dưỡng</b> / <i>Nurse</i>:</span>}
            value={header.dieuDuong}
          />
        </div>

        <div className="border-b border-dotted border-black my-2" />

        <SectionBanner title="THÔNG TIN NGƯỜI BỆNH / PATIENT INFORMATION:" />

        <div className="grid grid-cols-3 gap-3">
          <DotLine
            label={<span><b>Ngày sinh</b> / <i>DOB</i>:</span>}
            value={hc.sinhNgay}
          />
          <DotLine
            label={<span><b>Tuổi</b> / <i>Age</i>:</span>}
            value={hc.tuoi}
          />
          <DotLine
            label={<span><b>Giới tính</b> / <i>Gender</i>:</span>}
            value={gioiStr}
          />
        </div>
        <DotLine
          label={<span><b>Địa chỉ</b> / <i>Address</i>:</span>}
          value={hc.diaChi}
        />
        <div className="grid grid-cols-2 gap-4">
          <DotLine label={<span><b>Đất nước</b> / <i>Country</i>:</span>} value={hc.datNuoc} />
          <DotLine label={<span><b>Quốc tịch</b> / <i>Nationality</i>:</span>} value={hc.quocTich} />
          <DotLine label={<b>Email:</b>} value={hc.email} />
          <DotLine label={<span><b>ĐT nhà</b> / <i>Home No</i>:</span>} value={hc.dtNha} />
          <DotLine label={<span><b>ĐT nơi làm việc</b> / <i>Work No</i>:</span>} value={hc.dtNoiLamViec} />
          <DotLine label={<span><b>Di động</b> / <i>Mobile No</i>:</span>} value={hc.diDong || hc.dienThoai} />
        </div>
        <DotLine label={<span><b>Nghề nghiệp</b> / <i>Job</i>:</span>} value={hc.ngheNghiep} />
        <DotLine
          label={<span><b>Bạn đã khám bác sĩ bao giờ chưa</b> / <i>Have you seen/seeing a doctor?</i>:</span>}
          value={hc.daKhamBacSiChua}
        />
        <DotLine
          label={<span><b>Nếu có, tên và chuyên ngành của bác sĩ</b> / <i>If yes, Name & Specialty</i>:</span>}
          value={hc.tenVaChuyenNganhBacSi}
        />
        <DotLine
          label={<span><b>Tình trạng hôn nhân</b> / <i>Marital Status</i>:</span>}
          value={hc.tinhTrangHonNhan}
        />
        <DotLine
          label={<span><b>Bạn có bao nhiêu người con</b> / <i>How many kids do you have?</i>:</span>}
          value={hc.soCon}
        />
        <DotLine
          label={<span><b>Bạn có đang công tác không</b> / <i>Are you working?</i>:</span>}
          value={hc.dangCongTacKhong}
        />
        <DotLine
          label={<span><b>Nghề nghiệp công tác</b> / <i>Occupation</i>:</span>}
          value={hc.ngheNghiepCongTac || hc.ngheNghiep}
        />
        <DotLine
          label={<span><b>Nếu ngừng công tác, có phải vì lý do đau/bệnh lý không?</b>:</span>}
          value={hc.ngungCongTacViDau}
        />
        <DotLine
          label={<span><b>Bệnh lý mạn tính</b> / <i>Do you have any chronic diseases?</i>:</span>}
          value={hc.benhLyManTinh}
        />
        <DotLine
          label={<span><b>Khuyết tật</b> / <i>Any physical disability?</i>:</span>}
          value={hc.khuyetTat}
        />
      </PainPageContainer>

      {/* ==================== TRANG 2 / PAGE 19 ==================== */}
      <PainPageContainer page={2} totalPages={totalPages} docCode={docCode}>
        <SectionBanner title="TIỀN SỬ BỆNH / ANTECEDENTS / ASSOCIATED DISEASES" />
        <div className="font-bold mt-2">DỊ ỨNG / ALLERGIES</div>
        <DotLine
          label={<span>Bạn có bị dị ứng không? (Thuốc, nhựa cao su, i-ốt...) / <i>Do you have any allergies?</i>:</span>}
          value={ts.diUng}
        />

        <div className="font-bold mt-3">PHẪU THUẬT / SURGERY</div>
        <DotLine
          label={<span>Những can thiệp phẫu thuật đã từng làm, thời gian nào? / <i>Past surgical interventions</i>:</span>}
          value={ts.phauThuatDaLam}
        />
        <DotLine
          label={<span>Biến chứng trong và sau phẫu thuật / <i>Any complication during or after surgery</i>:</span>}
          value={ts.bienChungPhauThuat}
        />

        <div className="font-bold mt-3">THUỐC & BỆNH LÝ NỘI KHOA / MEDICAL</div>
        <DotLine
          label={<span>Bệnh lý khác đã từng mắc phải ngoài bệnh từ nhỏ / <i>Other past diseases</i>:</span>}
          value={ts.benhLyKhacNgoaiNho}
        />
        <DotLine
          label={<span>Tất cả các bệnh lý đang điều trị (hen, tiểu đường, THA...) / <i>Currently treated diseases</i>:</span>}
          value={ts.benhLyDangDieuTri}
        />

        <div className="font-bold mt-3">ĐIỀU TRỊ / TREATMENTS</div>
        <DotLine
          label={<span>Tên thuốc và liều dùng / <i>Medication list and dosage</i>:</span>}
          value={ts.tenThuocVaLieuDung}
        />
        <DotLine
          label={<span>Bạn có đang dùng thuốc chống đông không? / <i>Are you under anticoagulants?</i>:</span>}
          value={ts.dungThuocChongDong}
        />
        <div className="grid grid-cols-2 gap-4">
          <DotLine label={<span>Thuốc / <i>Medication</i>:</span>} value={ts.thuocChongDong} />
          <DotLine label={<span>Liều dùng / <i>Dosage</i>:</span>} value={ts.lieuThuocChongDong} />
        </div>
        <DotLine label={<span>Lý do điều trị / <i>Reason</i>:</span>} value={ts.lyDoChongDong} />

        <DotLine
          label={<span>Bạn có đang dùng thuốc chống ngưng tập tiểu cầu không? / <i>Under antiplatelet?</i>:</span>}
          value={ts.dungThuocChongNgungTapTieuCau}
        />
        <div className="grid grid-cols-2 gap-4">
          <DotLine label={<span>Thuốc / <i>Medication</i>:</span>} value={ts.thuocChongNgungTap} />
          <DotLine label={<span>Liều dùng / <i>Dosage</i>:</span>} value={ts.lieuThuocChongNgungTap} />
        </div>
        <DotLine label={<span>Lý do điều trị / <i>Reason</i>:</span>} value={ts.lyDoChongNgungTap} />

        <div className="font-bold mt-3">CƠN ĐAU / PAIN</div>
        <DotLine
          label={<span>Theo bạn, nguyên nhân dẫn đến cơn đau của bạn là gì? / <i>Causes of your pain</i>:</span>}
          value={ts.nguyenNhanDauTheoBenhNhan}
        />
        <DotLine
          label={<span>Các phương pháp điều trị đau hiệu quả từng sử dụng / <i>Previous effective pain treatments</i>:</span>}
          value={ts.phuongPhapDieuTriHieuQua}
        />
        <DotLine
          label={<span>Xét nghiệm cận lâm sàng từng làm (MRI, CT, máu...) và kết quả / <i>Explorations & results</i>:</span>}
          value={ts.xetNghiemCanLamSang}
        />
      </PainPageContainer>

      {/* ==================== TRANG 3 / PAGE 19 ==================== */}
      <PainPageContainer page={3} totalPages={totalPages} docCode={docCode}>
        <SectionBanner title="BỆNH SỬ ĐAU / HISTORY OF THE PAIN" />
        <div className="grid grid-cols-2 gap-4">
          <DotLine label={<span><b>Ngày bắt đầu</b> / <i>Start Date</i>:</span>} value={bsd.ngayBatDau} />
          <DotLine label={<span><b>Ngày tăng nặng</b> / <i>Aggravation Date</i>:</span>} value={bsd.ngayTangNang} />
          <DotLine label={<span><b>Vị trí ban đầu</b> / <i>Primary Location</i>:</span>} value={bsd.viTriBanDau} />
          <DotLine label={<span><b>Vị trí lan tỏa</b> / <i>Extension</i>:</span>} value={bsd.viTriLanToa} />
        </div>

        <div className="my-2">
          <Chk checked={Boolean(khoiPhat.dotNgot)} label={<span>Đột ngột / <i>Suddenly</i></span>} />
          <Chk checked={Boolean(khoiPhat.tuPhat)} label={<span>Tự phát / <i>Spontaneously</i></span>} />
          <Chk checked={Boolean(khoiPhat.tuTu)} label={<span>Từ từ / <i>Progressive</i></span>} />
          <Chk checked={Boolean(khoiPhat.nhoi)} label={<span>Nhói / <i>Trigger</i></span>} />
        </div>

        <DotLine label={<span><b>Sự tiến triển</b> / <i>Evolution</i>:</span>} value={bsd.suTienTrien} />

        <SectionBanner title="MIÊU TẢ CƠN ĐAU HIỆN TẠI / DESCRIPTION OF THE CURRENT PAIN" />
        <div className="font-semibold mb-1">Từ dành cho người bệnh / <i>Terms used by the patient</i>:</div>
        <div className="grid grid-cols-3 gap-1.5 my-2 text-[9.5pt]">
          <Chk checked={Boolean(mieuTa.beating)} label="Đau như cú đấm / Beating" />
          <Chk checked={Boolean(mieuTa.crushed)} label="Đau thắt / Crushed" />
          <Chk checked={Boolean(mieuTa.burning)} label="Đau bỏng rát / Burning" />
          <Chk checked={Boolean(mieuTa.tingling)} label="Đau râm ran / Tingling" />
          <Chk checked={Boolean(mieuTa.stabbing)} label="Đau như dao đâm / Stabbing" />
          <Chk checked={Boolean(mieuTa.radiating)} label="Đau lan tỏa / Radiating" />
          <Chk checked={Boolean(mieuTa.cramps)} label="Đau như chuột rút / Cramps" />
          <Chk checked={Boolean(mieuTa.electricShock)} label="Cảm giác điện giật / Electric shock" />
          <Chk checked={Boolean(mieuTa.scratching)} label="Ngứa / Scratching" />
          <Chk checked={Boolean(mieuTa.clenching)} label="Đau siết/thắt / Clenching" />
          <Chk checked={Boolean(mieuTa.slenderness)} label="Đau âm ỉ / Slenderness" />
          <Chk checked={Boolean(mieuTa.pinsAndNeedles)} label="Đau như kim châm / Pins & needles" />
        </div>

        <div className="font-semibold mt-3 mb-1">
          Sự xuất hiện và cường độ đau (0 = không đau, 10 = đau nhiều nhất):
        </div>
        <div className="space-y-1.5 text-[9.5pt]">
          <div className="flex items-center justify-between">
            <Chk checked={Boolean(cuongDo.lienTucChecked)} label="Đau liên tục / Continuous pain:" />
            <span>Nhỏ nhất / min: <b>[{safeText(cuongDo.lienTucMin) || '_'}]</b></span>
            <span>Lớn nhất / max: <b>[{safeText(cuongDo.lienTucMax) || '_'}]</b></span>
          </div>
          <div className="flex items-center justify-between">
            <Chk checked={Boolean(cuongDo.tungHoiChecked)} label="Đau từng hồi / Intermittent pain:" />
            <span>Nhỏ nhất / min: <b>[{safeText(cuongDo.tungHoiMin) || '_'}]</b></span>
            <span>Lớn nhất / max: <b>[{safeText(cuongDo.tungHoiMax) || '_'}]</b></span>
          </div>
          <div className="flex items-center justify-between">
            <Chk checked={Boolean(cuongDo.theoConChecked)} label="Đau theo cơn / Pain by crisis:" />
            <span>Nhỏ nhất / min: <b>[{safeText(cuongDo.theoConMin) || '_'}]</b></span>
            <span>Lớn nhất / max: <b>[{safeText(cuongDo.theoConMax) || '_'}]</b></span>
          </div>
        </div>

        <DotLine
          label={<Chk checked={Boolean(cuongDo.doKichThichChecked)} label="Đau do kích thích / Provocated pain - Nguyên nhân:" />}
          value={cuongDo.doKichThichNguyenNhan}
        />
        <DotLine
          label={<Chk checked={Boolean(cuongDo.tuPhatChecked)} label="Cơn đau tự phát / Spontaneous pain - Ban ngày/Đêm:" />}
          value={[safeText(cuongDo.tuPhatBanNgay), safeText(cuongDo.tuPhatBanDem)].filter(Boolean).join(' | ')}
        />
        <DotLine label={<span><b>Loại hoạt động</b> / <i>Type of activity</i>:</span>} value={cuongDo.loaiHoatDong} />

        <div className="font-semibold mt-3 mb-1">Các yếu tố tăng đau / <i>Factors aggravating pain</i>:</div>
        <div className="grid grid-cols-4 gap-1.5 text-[9.5pt]">
          <Chk checked={Boolean(yeuToTang.coHoc)} label="Cơ học / Mechanical" />
          <Chk checked={Boolean(yeuToTang.cuDong)} label="Cử động / Movement" />
          <Chk checked={Boolean(yeuToTang.diBo)} label="Đi bộ / Walking" />
          <Chk checked={Boolean(yeuToTang.khoangCach)} label="Khoảng cách / Distance" />
          <Chk checked={Boolean(yeuToTang.tuThe)} label="Tư thế / Positional" />
          <Chk checked={Boolean(yeuToTang.dung)} label="Đứng / Standing" />
          <Chk checked={Boolean(yeuToTang.nam)} label="Nằm / Lying" />
          <Chk checked={Boolean(yeuToTang.ngoi)} label="Ngồi / Sitting" />
          <Chk checked={Boolean(yeuToTang.tiepXucDa)} label="Tiếp xúc da / Skin" />
          <Chk checked={Boolean(yeuToTang.tiepXucDonThuan)} label="Tiếp xúc đơn thuần" />
          <Chk checked={Boolean(yeuToTang.tiepXucLanh)} label="Tiếp xúc lạnh / Cold" />
          <Chk checked={Boolean(yeuToTang.tiepXucNong)} label="Tiếp xúc nóng / Heat" />
          <Chk checked={Boolean(yeuToTang.yeuToKhac)} label="Yếu tố khác / Other" />
          <Chk checked={Boolean(yeuToTang.metMoi)} label="Mệt mỏi / Fatigue" />
          <Chk checked={Boolean(yeuToTang.cangThang)} label="Căng thẳng / Stress" />
          <Chk checked={Boolean(yeuToTang.khac)} label="Khác / Others" />
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 4 / PAGE 19 ==================== */}
      <PainPageContainer page={4} totalPages={totalPages} docCode={docCode}>
        <SectionBanner title="CUỘC SỐNG HÀNG NGÀY / DAILY LIFE" />
        <div className="font-bold mb-2">Tác động của cơn đau lên / <i>Impact of pain on</i>:</div>
        {renderDailyLifeRow('sinhHoatGiaDinh', 'Sinh hoạt gia đình', 'Family activities')}
        {renderDailyLifeRow('sinhHoatCaNhan', 'Sinh hoạt cá nhân', 'Personal leisure activities')}
        {renderDailyLifeRow('hoatDongXaHoi', 'Hoạt động xã hội và các mối quan hệ', 'Social and relational activities')}
        {renderDailyLifeRow('congViec', 'Công việc', 'Work')}
        {renderDailyLifeRow('tinhCach', 'Tính cách (dễ bị kích động)', 'Character (irritability)')}
        {renderDailyLifeRow('chucNangNhanThuc', 'Chức năng nhận thức (sự tập trung)', 'Cognitive functions (concentration)')}
        {renderDailyLifeRow('giacNgu', 'Giấc ngủ', 'Sleep')}
        {renderDailyLifeRow('tamTrang', 'Tâm trạng', 'Mood')}
        {renderDailyLifeRow('suyGiamChucNangCoThe', 'Có suy giảm chức năng nào của cơ thể không', 'Is there a loss of body function')}
        {renderDailyLifeRow('matTuChuLaiXe', 'Có mất tự chủ không (không thể lái xe?)', 'Is there a loss of autonomy (cannot drive?)')}
        {renderDailyLifeRow('matKhaNangThamGiaXaHoi', 'Có mất khả năng tham gia các hoạt động xã hội không?', 'Is there a loss of participation in social life?')}
        {renderDailyLifeRow('moiTruongNguoiBenh', 'Môi trường của người bệnh', 'Environment of the patient')}
        {renderDailyLifeRow('dieuKienLamViecAnhHuong', 'Điều kiện làm việc có làm cơn đau trầm trọng hơn không?', 'Does working conditions have an influence on aggravating pain?')}
        {renderDailyLifeRow('boiThuongTaiChinh', 'Điều trị đau có được bồi thường về tài chính không?', 'Is there any financial procedure compensation with the pain')}
      </PainPageContainer>

      {/* ==================== TRANG 5 / PAGE 19 ==================== */}
      <PainPageContainer page={5} totalPages={totalPages} docCode={docCode}>
        <div className="text-center mb-3">
          <div className="text-[14pt] font-bold">ĐO CƯỜNG ĐỘ ĐAU</div>
          <div className="text-[11pt] font-bold">MEASURING THE INTENSITY OF PAIN</div>
          <div className="font-semibold text-[10pt] mt-1">
            Thước đo / <i>Scale 1</i>: Thang điểm cường độ đau dạng nhìn (VAS) / <i>Visual Analog Scale (VAS)</i>
          </div>
        </div>

        <div className="border border-black p-2.5 text-[9.5pt] space-y-1 mb-4">
          <div>Chúng tôi khuyên bạn nên sử dụng thang điểm để giúp bạn đo mức độ đau / <i>We advise you to use a pain thermometer to help you measure the intensity of the pain:</i></div>
          <div>Một đầu thể hiện &ldquo;mức đau cao nhất có thể&rdquo;, một đầu khác thể hiện mức &ldquo;không đau&rdquo;.</div>
          <div className="flex items-center justify-between pt-2 font-semibold">
            <span>Không đau / <i>No pain</i></span>
            <span className="flex-1 border-b border-black mx-4" />
            <span>Mức đau cao nhất có thể / <i>Maximum imaginable pain</i></span>
          </div>
        </div>

        {renderVasBar(
          'Bạn cảm thấy cơn đau hiện tại như thế nào?',
          'How would you assess your pain now, at this moment?',
          vas.dauHienTai
        )}
        {renderVasBar(
          'Cơn đau nhiều nhất trong 4 tuần qua như thế nào?',
          'How strong was the strongest pain during the past 4 weeks?',
          vas.dauNhat4Tuan
        )}
        {renderVasBar(
          'Trung bình các cơn đau trong 4 tuần qua như thế nào?',
          'How strong was the pain during the past 4 weeks on average?',
          vas.trungBinh4Tuan
        )}
      </PainPageContainer>

      {/* ==================== TRANG 6 / PAGE 19 ==================== */}
      <PainPageContainer page={6} totalPages={totalPages} docCode={docCode}>
        {renderLikertBlock(
          'Bạn có đau bỏng rát (đau nhức) tại vị trí đánh dấu không?',
          'Do you suffer from a burning sensation (e.g., stinging nettles) in the marked areas?',
          likert.q1_bongRat
        )}
        {renderLikertBlock(
          'Bạn có cảm giác râm ran ở vị trí đau không (như kiến bò hay tê điện)?',
          'Do you have a tingling or prickling sensation in the area of your pain (like crawling ants or electrical tingling)?',
          likert.q2_ramRan
        )}
        {renderLikertBlock(
          'Đau khi dùng miếng vải hay khăn chạm nhẹ vào vùng đau?',
          'Is light touching with a cloth or towel painful?',
          likert.q3_chamNhe
        )}
        {renderLikertBlock(
          'Bạn có cơn đau đột ngột nào như điện giật ở khu vực đau không?',
          'Do you have sudden pain attacks in the area of your pain, like electric shocks?',
          likert.q4_dienGiat
        )}
        {renderLikertBlock(
          'Khu vực bị đau cảm thấy nóng hay lạnh khi tắm?',
          'Is cold or heat (bath water) in this area occasionally painful?',
          likert.q5_nongLanh
        )}
        {renderLikertBlock(
          'Bạn có bị tê bì tại vị trí đánh dấu không?',
          'Do you suffer from a sensation of numbness in the areas that you marked?',
          likert.q6_teBi
        )}
        {renderLikertBlock(
          'Bạn có bị tức nhẹ tại vị trí đau không (khi ấn ngón tay, khi chạm vào điểm đau kích thích)',
          'Does slight pressure in this area, e.g., with a finger, trigger pain?',
          likert.q7_tucNhe
        )}

        <div className="mt-2">
          <div className="font-bold text-[9.5pt] mb-1">
            Bác sỹ điền / <i>To be filled out by the physician</i>
          </div>
          <div className="flex items-center justify-between gap-2">
            <table className="border-collapse border border-black text-[9pt]">
              <tbody>
                <tr>
                  <td className="border border-black px-2.5 py-1">× 0 = <b>{safeText(bsDienP6.x0)}</b></td>
                  <td className="border border-black px-2.5 py-1">× 1 = <b>{safeText(bsDienP6.x1)}</b></td>
                  <td className="border border-black px-2.5 py-1">× 2 = <b>{safeText(bsDienP6.x2)}</b></td>
                  <td className="border border-black px-2.5 py-1">× 3 = <b>{safeText(bsDienP6.x3)}</b></td>
                  <td className="border border-black px-2.5 py-1">× 4 = <b>{safeText(bsDienP6.x4)}</b></td>
                  <td className="border border-black px-2.5 py-1">× 5 = <b>{safeText(bsDienP6.x5)}</b></td>
                </tr>
              </tbody>
            </table>
            <div className="font-bold">
              Điểm / Score:{' '}
              <span className="inline-block border border-black px-3 py-1">
                {safeText(bsDienP6.tongDiem)}
              </span>
            </div>
          </div>
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 7 / PAGE 19 ==================== */}
      <PainPageContainer page={7} totalPages={totalPages} docCode={docCode}>
        <div className="font-bold text-[10.5pt] mb-2">
          Chọn bức ảnh miêu tả chính xác nhất cảm giác đau của bạn: /{' '}
          <i>Mark the picture that best describes the course of your pain</i>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-[8.5pt] mb-3">
          {[
            {
              idx: 0,
              score: '+0',
              img: '/images/pain_course_1.png',
              vi: 'Đau từng cơn nhẹ, trên nền đau liên tục',
              en: 'Persistent pain with slight fluctuations',
            },
            {
              idx: 1,
              score: '-1',
              img: '/images/pain_course_2.png',
              vi: 'Đau từng cơn rõ rệt, trên nền đau liên tục',
              en: 'Persistent pain with pain attacks',
            },
            {
              idx: 2,
              score: '+1',
              img: '/images/pain_course_3.png',
              vi: 'Đau từng cơn rõ rệt, trên nền không đau',
              en: 'Pain attacks without pain between them',
            },
            {
              idx: 3,
              score: '+1',
              img: '/images/pain_course_4.png',
              vi: 'Đau tăng giảm liên tục',
              en: 'Pain attacks with pain between',
            },
          ].map((item) => (
            <div key={item.idx} className="border border-slate-300 rounded p-1.5 flex flex-col items-center">
              <div className="mb-1">
                <Chk checked={Number(dtSd.selectedCourse) === item.idx} label={<b>{item.score}</b>} className="mr-0" />
              </div>
              <img
                src={item.img}
                alt={item.en}
                className="mx-auto object-contain mb-1"
                style={{ height: '1.3cm' }}
              />
              <div className="font-medium leading-tight">{item.vi}</div>
              <div className="italic text-slate-600 leading-tight mt-0.5">{item.en}</div>
            </div>
          ))}
        </div>

        <div className="text-center font-bold my-2">
          Điểm / Score: <span className="border-b border-black px-6">{safeText(dtSd.diemScore)}</span>
        </div>

        <table className="w-full border-collapse border border-black text-center text-[9pt] mb-2">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-1">Đau cảm thụ / <i>Nociceptive</i></th>
              <th className="border border-black p-1">Chưa xác định / <i>Unclear</i></th>
              <th className="border border-black p-1">Đau thần kinh / <i>Neuropathic</i></th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-[8pt]">
              <td className="border border-black p-1">
                0 – 12: Không có yếu tố đau thần kinh (&lt; 15%) / <i>Unlikely</i>
              </td>
              <td className="border border-black p-1">
                13 – 18: Kết quả không rõ ràng, có thể có đau thần kinh / <i>Ambiguous</i>
              </td>
              <td className="border border-black p-1">
                19 – 38: Có yếu tố đau thần kinh (&gt; 90%) / <i>Likely</i>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-center mt-2">
          <img
            src="/images/body_map_clean.png"
            alt="Body Map Diagram"
            className="mx-auto object-contain"
            style={{ height: '9.5cm' }}
          />
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 8 / PAGE 19 ==================== */}
      <PainPageContainer page={8} totalPages={totalPages} docCode={docCode}>
        <SectionBanner title="CÂU HỎI DN4 / QUESTIONNAIRE DN4" />
        <div className="italic text-[9.5pt] mb-2">
          (Chọn 1 câu trả lời cho mỗi câu hỏi dưới đây / Choose one answer for each of these questions)
        </div>

        <div className="font-bold mb-1">Thu thập thông tin người bệnh / <i>Patient Interrogation</i>:</div>
        <div className="font-semibold mb-1">
          Câu hỏi 1: Cơn đau hiện tại giống một hay nhiều tính chất nào dưới đây? /{' '}
          <i>Question 1: Does the pain present one or more of these characteristics?</i>
        </div>
        <div className="space-y-1 mb-3 pl-2">
          <div className="flex justify-between">
            <Chk checked={Boolean(dn4.q1_nongRat)} label={<span>Nóng rát / <i>Burning</i></span>} />
            <span className="border border-black px-2 font-bold">{dn4.q1_nongRat ? 1 : 0}</span>
          </div>
          <div className="flex justify-between">
            <Chk checked={Boolean(dn4.q1_dauLanh)} label={<span>Cảm giác đau lạnh / <i>Painful cold feeling</i></span>} />
            <span className="border border-black px-2 font-bold">{dn4.q1_dauLanh ? 1 : 0}</span>
          </div>
          <div className="flex justify-between">
            <Chk checked={Boolean(dn4.q1_dienGiat)} label={<span>Cảm giác điện giật / <i>Electric shock</i></span>} />
            <span className="border border-black px-2 font-bold">{dn4.q1_dienGiat ? 1 : 0}</span>
          </div>
        </div>

        <div className="font-semibold mb-1">
          Câu hỏi 2: Cơn đau cùng vị trí có liên quan đến những cảm giác dưới đây không? /{' '}
          <i>Question 2: Is the pain in the same area related to one or more of the following?</i>
        </div>
        <div className="space-y-1 mb-3 pl-2">
          <div className="flex justify-between">
            <Chk checked={Boolean(dn4.q2_kimCham)} label={<span>Đau như kim châm / <i>Pins and needles</i></span>} />
            <span className="border border-black px-2 font-bold">{dn4.q2_kimCham ? 1 : 0}</span>
          </div>
          <div className="flex justify-between">
            <Chk checked={Boolean(dn4.q2_ramRan)} label={<span>Đau râm ran / <i>Tingling</i></span>} />
            <span className="border border-black px-2 font-bold">{dn4.q2_ramRan ? 1 : 0}</span>
          </div>
          <div className="flex justify-between">
            <Chk checked={Boolean(dn4.q2_teBi)} label={<span>Tê bì / <i>Numbness</i></span>} />
            <span className="border border-black px-2 font-bold">{dn4.q2_teBi ? 1 : 0}</span>
          </div>
          <div className="flex justify-between">
            <Chk checked={Boolean(dn4.q2_ngua)} label={<span>Ngứa / <i>Itching</i></span>} />
            <span className="border border-black px-2 font-bold">{dn4.q2_ngua ? 1 : 0}</span>
          </div>
        </div>

        <div className="border-b border-black my-3" />

        <div className="font-bold mb-1">
          Kiểm tra người bệnh: bác sĩ đánh giá / <i>Examination of the patient: filled by the physician</i>
        </div>
        <div className="font-semibold mb-1">
          Câu hỏi 3: Đau nhiều tại vị trí được kiểm tra hay không? /{' '}
          <i>Question 3: Is the pain located to an area where the exam is evident?</i>
        </div>
        <div className="space-y-1 mb-3 pl-2">
          <div className="flex justify-between">
            <Chk checked={Boolean(dn4.q3_matCamGiacTiepXuc)} label={<span>Tact hypoesthesia / <i>Mất cảm giác khi tiếp xúc</i></span>} />
            <span className="border border-black px-2 font-bold">{dn4.q3_matCamGiacTiepXuc ? 1 : 0}</span>
          </div>
          <div className="flex justify-between">
            <Chk checked={Boolean(dn4.q3_matCamGiacChichKim)} label={<span>Prick hypoesthesia / <i>Mất cảm giác khi chích kim</i></span>} />
            <span className="border border-black px-2 font-bold">{dn4.q3_matCamGiacChichKim ? 1 : 0}</span>
          </div>
        </div>

        <div className="font-semibold mb-1">
          Câu hỏi 4: Cơn đau có tăng lên khi? / <i>Question 4: Does the pain increase by?</i>
        </div>
        <div className="space-y-1 mb-4 pl-2">
          <div className="flex justify-between">
            <Chk checked={Boolean(dn4.q4_coXat)} label={<span>Cọ xát / <i>The rubbing</i></span>} />
            <span className="border border-black px-2 font-bold">{dn4.q4_coXat ? 1 : 0}</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-[12pt] font-bold border-t border-black pt-3">
          <span>Tổng điểm / <i>Patient Score</i>:</span>
          <span>{safeText(dn4.tongDiem) || '0'} / 10</span>
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 9 / PAGE 19 ==================== */}
      <PainPageContainer page={9} totalPages={totalPages} docCode={docCode}>
        <SectionBanner title="TIÊU CHUẨN CHẨN ĐOÁN HỘI CHỨNG ĐAU VÙNG PHỨC TẠP BUDAPEST / BUDAPEST CRITERIA FOR CRPS" />
        <p className="text-[9.5pt] mb-3">
          <b>Hội chứng đau vùng phức tạp là đau liên tục không bị ảnh hưởng bởi các tác nhân kích thích. Người bệnh cần có ít nhất 1 triệu chứng ở 3 trong 4 mục dưới đây:</b>
          <br />
          <i>CRPS is defined as continuing pain disproportionate to any inciting event. A patient must have at least 1 symptom in 3 of the 4 following categories:</i>
        </p>

        <div className="space-y-3 text-[10pt]">
          <div>
            <div className="font-bold">1. Cảm giác - <i>Sensory</i>:</div>
            <div className="pl-4 mt-1 space-y-1">
              <div>
                <Chk checked={Boolean(buda.camGiac_loanCamDau)} label={<b>Loạn cảm đau / <i>Allodynia</i></b>} />
                <div className="pl-6 text-[9pt] italic">
                  (khi chạm nhẹ và/hoặc nhạy cảm với nhiệt độ và/hoặc áp lực cơ thể sâu và/hoặc vận động khớp)
                </div>
              </div>
              <div className="font-bold pl-2">Và/hoặc - <i>and/or</i></div>
              <div>
                <Chk checked={Boolean(buda.camGiac_tangCamGiacDau)} label={<b>Tăng cảm giác đau (châm kim) / <i>Hyperalgesia (to pinprick)</i></b>} />
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold">2. Vasomotor - <i>Vận mạch</i>:</div>
            <div className="pl-4 mt-1 space-y-1">
              <div>
                <Chk
                  checked={Boolean(buda.vanMach_nhietDoDa)}
                  label={<b>Nhiệt độ da khác nhau (hơn 1°C) và/hoặc thay đổi màu sắc da không đồng nhất</b>}
                />
              </div>
              <div>
                <Chk
                  checked={Boolean(buda.vanMach_khacBietMauDa)}
                  label={<b>Khác biệt màu da ở các bên cơ thể khác nhau / <i>Differences in skin colouration</i></b>}
                />
              </div>
              <div>
                <Chk
                  checked={Boolean(buda.vanMach_thayDoiMauDa)}
                  label={<b>Thay đổi màu da / <i>Skin colour changes</i></b>}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold">3. Bài tiết mồ hôi / Phù nề - <i>Sudomotor / Oedema</i>:</div>
            <div className="pl-4 mt-1 space-y-1">
              <div>
                <Chk checked={Boolean(buda.phuNe_sungNe)} label={<b>Hai bên cơ thể sưng nề khác nhau / <i>Asymmetry in swelling</i></b>} />
              </div>
              <div>
                <Chk checked={Boolean(buda.phuNe_toatMoHoi)} label={<b>Hai bên cơ thể toát mồ hôi khác nhau / <i>Asymmetry in sweating</i></b>} />
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold">4. Vận động / Dinh dưỡng - <i>Motor / Trophic</i>:</div>
            <div className="pl-4 mt-1 space-y-1">
              <div>
                <Chk checked={Boolean(buda.vanDong_hanChe)} label={<b>Hạn chế vận động / <i>Decreased range of movement</i></b>} />
              </div>
              <div>
                <Chk checked={Boolean(buda.vanDong_trieuChung)} label={<b>Triệu chứng vận động (rùng mình, yếu ớt, rối loạn trương lực...) / <i>Motor symptoms</i></b>} />
              </div>
              <div>
                <Chk checked={Boolean(buda.vanDong_thayDoiDinhDuong)} label={<b>Thay đổi về tóc, da, móng tay chân (dinh dưỡng) / <i>Trophic changes</i></b>} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-black flex items-center gap-6">
          <span className="font-bold">Tiêu chuẩn Budapest / <i>Budapest criteria</i>:</span>
          <Chk checked={safeText(buda.ketLuanBudapest).toUpperCase() === 'YES'} label={<b>CÓ / <i>YES</i></b>} />
          <Chk checked={safeText(buda.ketLuanBudapest).toUpperCase() === 'NO'} label={<b>KHÔNG / <i>NO</i></b>} />
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 10 / PAGE 19 (BECK A - G) ==================== */}
      <PainPageContainer page={10} totalPages={totalPages} docCode={docCode}>
        <SectionBanner title="THANG ĐÁNH GIÁ TRẦM CẢM BECK / ECHELLE DE BECK (BDI: BECK DEPRESSION INVENTORY)" />
        <div className="font-semibold text-[9.5pt] mb-2">
          Chọn câu trả lời đúng nhất / <i>Please select the best answer</i>:
        </div>
        <div className="space-y-2 text-[9pt]">
          {BDI_GROUPS.slice(0, 7).map((grp) => {
            const selVal = bdi[grp.code];
            const selNum = selVal !== undefined && selVal !== null && String(selVal) !== '' ? Number(selVal) : -1;
            return (
              <div key={grp.code} className="border-b border-slate-200 pb-1.5">
                <div className="font-bold">{grp.code}</div>
                {grp.items.map(([score, vi, en]) => (
                  <div key={score} className="pl-3 flex items-baseline gap-1.5">
                    <span className="font-mono font-bold w-3">{score}</span>
                    <Chk checked={selNum === score} label={<span>{vi} / <i>{en}</i></span>} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 11 / PAGE 19 (BECK H - M & RESULTS) ==================== */}
      <PainPageContainer page={11} totalPages={totalPages} docCode={docCode}>
        <div className="space-y-2 text-[9pt]">
          {BDI_GROUPS.slice(7).map((grp) => {
            const selVal = bdi[grp.code];
            const selNum = selVal !== undefined && selVal !== null && String(selVal) !== '' ? Number(selVal) : -1;
            return (
              <div key={grp.code} className="border-b border-slate-200 pb-1.5">
                <div className="font-bold">{grp.code}</div>
                {grp.items.map(([score, vi, en]) => (
                  <div key={score} className="pl-3 flex items-baseline gap-1.5">
                    <span className="font-mono font-bold w-3">{score}</span>
                    <Chk checked={selNum === score} label={<span>{vi} / <i>{en}</i></span>} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="mt-4 border border-black p-3 bg-slate-50 text-right text-[9.5pt] space-y-0.5">
          <div className="font-bold text-[10.5pt]">
            KẾT QUẢ / <i>RESULTS</i>: (Điểm BDI: {safeText(bdi.tongDiemBdi) || '0'})
          </div>
          <div><b>0 đến 3:</b> không có trầm cảm / <i>0 to 3: no depression</i></div>
          <div><b>4 đến 7:</b> trầm cảm nhẹ / <i>4 to 7: mild depression</i></div>
          <div><b>8 đến 15:</b> trầm cảm ở mức độ vừa / <i>8 to 15: moderate depression intensity</i></div>
          <div><b>Từ 16 trở lên:</b> trầm cảm nặng / <i>16 and above: severe depression</i></div>
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 12 / PAGE 19 (ẢNH 3: TRƯỚC & SAU) ==================== */}
      <PainPageContainer page={12} totalPages={totalPages} docCode={docCode}>
        <div className="text-center mb-2">
          <div className="text-[13pt] font-bold">Phần bác sỹ điền</div>
          <div className="text-[10.5pt] font-bold">Part to be filled by the physician</div>
        </div>
        <DotLine
          label={<span><b>Bác sỹ điều trị</b> / <i>Physician</i>:</span>}
          value={khamCg.bacSyDieuTri || header.bacSyDieuTriDau}
        />
        <div className="grid grid-cols-2 gap-4 mb-2">
          <DotLine label={<span><b>Ngày</b> / <i>Date</i>:</span>} value={khamCg.ngayKham || header.ngayKhamDau} />
          <DotLine label={<span><b>Giờ</b> / <i>Time</i>:</span>} value={khamCg.gioKham} />
        </div>
        <div className="text-center my-1">
          <img
            src="/images/full_body_sensory_anterior_posterior.png"
            alt="Full Body Sensory Anterior Posterior"
            className="mx-auto object-contain"
            style={{ height: '17.5cm' }}
          />
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 13 / PAGE 19 (ẢNH 4: NGHIÊNG) ==================== */}
      <PainPageContainer page={13} totalPages={totalPages} docCode={docCode}>
        <div className="text-center mb-2">
          <div className="text-[13pt] font-bold">Sơ đồ cảm giác toàn thân (Tư thế nghiêng)</div>
          <div className="text-[10.5pt] font-bold">Full Body Sensory Profile (Lateral View)</div>
        </div>
        <div className="text-center my-1">
          <img
            src="/images/full_body_sensory_lateral.png"
            alt="Full Body Sensory Lateral"
            className="mx-auto object-contain"
            style={{ height: '17.5cm' }}
          />
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 14 / PAGE 19 (ẢNH 5: CỤC BỘ) ==================== */}
      <PainPageContainer page={14} totalPages={totalPages} docCode={docCode}>
        <div className="text-center mb-2">
          <div className="text-[13pt] font-bold">Sơ đồ khám cảm giác cục bộ</div>
          <div className="text-[10.5pt] font-bold">Focal Sensory Examination Maps (Face, Hands, Perineal)</div>
        </div>
        <div className="text-center my-1">
          <img
            src="/images/physician_focal_clean.png"
            alt="Physician Focal Sensory Clean"
            className="mx-auto object-contain"
            style={{ height: '17.5cm' }}
          />
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 15 / PAGE 19 ==================== */}
      <PainPageContainer page={15} totalPages={totalPages} docCode={docCode}>
        <SectionBanner title="Observation / Thông tin quan sát :" />
        <div className="border border-dotted border-black p-2.5 min-h-[4.5cm] mb-4 whitespace-pre-wrap font-medium">
          {safeText(qsDt.thongTinQuanSat)}
        </div>

        <table className="w-full border-collapse border border-black text-[9.5pt]">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-1.5 text-left w-[28%]">
                Điều trị<br /><i>Treatments</i>
              </th>
              <th className="border border-black p-1.5 text-center w-[13%]">
                Ngày<br /><i>Date</i>
              </th>
              <th className="border border-black p-1.5 text-center w-[13%]">
                Thời gian<br /><i>Duration</i>
              </th>
              <th className="border border-black p-1.5 text-left w-[23%]">
                Khả năng thích ứng của NB<br /><i>Tolerability</i>
              </th>
              <th className="border border-black p-1.5 text-left">
                Tác dụng<br /><i>Effect</i>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(6, bangDieuTriList.length) }, (_, idx) => {
              const r = safeObj(bangDieuTriList[idx]);
              return (
                <tr key={idx}>
                  <td className="border border-black p-2 font-semibold">{safeText(r.dieuTri)}</td>
                  <td className="border border-black p-2 text-center">{safeText(r.ngay)}</td>
                  <td className="border border-black p-2 text-center">{safeText(r.thoiGian)}</td>
                  <td className="border border-black p-2">{safeText(r.khaNangThichUng)}</td>
                  <td className="border border-black p-2">{safeText(r.tacDung)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </PainPageContainer>

      {/* ==================== TRANG 16 / PAGE 19 ==================== */}
      <PainPageContainer page={16} totalPages={totalPages} docCode={docCode}>
        <SectionBanner title="TỔNG HỢP KẾT QUẢ / SYNTHESIS:" />
        <div className="font-bold mt-2">
          Chẩn đoán mức độ tổn thương dựa trên đo lường / <i>Topographic diagnostic of the lesion level</i>:
        </div>
        <DotLine value={thKq.chanDoanMucDoTonThuong} className="mb-4" />

        <div className="font-bold mt-2">
          Chẩn đoán căn nguyên / <i>Diagnostic Etiology</i>:
        </div>
        <DotLine value={thKq.chanDoanCanNguyen} className="mb-4" />

        <div className="font-bold mt-2">
          Đau khó chịu nhất hoặc vị trí đau xác định là / <i>The most annoying pain or target pain</i>:
        </div>
        <DotLine value={thKq.dauKhoChiuNhat} className="mb-4" />

        <div className="font-bold mt-3 mb-1">
          Yếu tố căn nguyên / <i>Etiological factor</i>:
        </div>
        <DotLine label={<span><b>Yếu tố căn nguyên</b> / <i>Etiological factor</i>:</span>} value={ytCn.yeuToChung} />
        <DotLine label={<span><b>Nhiễm trùng</b> / <i>Infectious</i>:</span>} value={ytCn.nhiemTrung} />
        <DotLine label={<span><b>Chấn thương</b> / <i>Traumatic</i>:</span>} value={ytCn.chanThuong} />
        <DotLine label={<span><b>Mạch máu</b> / <i>Vascular</i>:</span>} value={ytCn.machMau} />
        <DotLine label={<span><b>Chuyển hóa</b> / <i>Metabolic</i>:</span>} value={ytCn.chuyenHoa} />
        <DotLine label={<span><b>Viêm nhiễm</b> / <i>Inflammatory</i>:</span>} value={ytCn.viemNhiem} />
        <DotLine label={<span><b>Nhiễm độc</b> / <i>Toxic</i>:</span>} value={ytCn.nhiemDoc} />
        <DotLine label={<span><b>Khác</b> / <i>Other</i>:</span>} value={ytCn.khac} />
      </PainPageContainer>

      {/* ==================== TRANG 17 / PAGE 19 ==================== */}
      <PainPageContainer page={17} totalPages={totalPages} docCode={docCode}>
        <SectionBanner title="ĐIỀU TRỊ CÓ XÂM LẤN / INVASIVE TREATMENT" />
        <div className="font-semibold mb-2">
          Nếu thủ thuật có xâm lấn được đề xuất / <i>If an invasive procedure is proposed</i>:
        </div>
        <DotLine label={<span><b>Loại thủ thuật</b> / <i>Type of procedure</i>:</span>} value={dtXl.loaiThuThuat} />
        <DotLine label={<span><b>Mức độ</b> / <i>Level</i>:</span>} value={dtXl.mucDo} />
        <DotLine label={<span><b>Loại block</b> / <i>Type of block</i>:</span>} value={dtXl.loaiBlock} />
        <DotLine label={<b>Side:</b>} value={dtXl.side} />
        <DotLine label={<b>Mã ICD 10:</b>} value={dtXl.maIcd10} />
        <DotLine label={<b>Mã CPT:</b>} value={dtXl.maCpt} />
        <div className="grid grid-cols-2 gap-4">
          <DotLine label={<span><b>Ngày</b> / <i>Date</i>:</span>} value={dtXl.ngay} />
          <DotLine label={<span><b>Giờ</b> / <i>Time</i>:</span>} value={dtXl.gio} />
        </div>

        <div className="space-y-2 my-4">
          <div>
            <Chk
              checked={Boolean(camKet.loiIchNguyCo)}
              label={<span><b>Thông tin về lợi ích và nguy cơ đã được giải thích cho người bệnh</b> / <i>Oral Information Benefits risks</i></span>}
            />
          </div>
          <div>
            <Chk
              checked={Boolean(camKet.huongDanNhapVien)}
              label={<span><b>Hướng dẫn người bệnh về thủ tục nhập viện</b> / <i>Patient instructions for the admission</i></span>}
            />
          </div>
          <div>
            <Chk
              checked={Boolean(camKet.huongDanGia)}
              label={<span><b>Hướng dẫn người bệnh về giá</b> / <i>Information concerning price</i></span>}
            />
          </div>
          <div>
            <Chk
              checked={Boolean(camKet.thongTinGhiChep)}
              label={<span><b>Thông tin đã được ghi chép</b> / <i>Written information</i></span>}
            />
          </div>
        </div>

        <div className="text-center font-bold my-4">
          <div>PHIẾU CAM KẾT ĐƯỢC KÝ VÀO NGÀY LÀM THỦ THUẬT</div>
          <div className="italic">CONSENT WILL BE SIGNED THE DAY OF THE PROCEDURE</div>
        </div>

        <div className="font-bold mb-1">Báo cáo thủ thuật / <i>Procedure Report</i>:</div>
        <div className="border border-dotted border-black p-2.5 min-h-[3.5cm] whitespace-pre-wrap font-medium">
          {safeText(dtXl.baoCaoThuThuat)}
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 18 / PAGE 19 ==================== */}
      <PainPageContainer page={18} totalPages={totalPages} docCode={docCode}>
        <SectionBanner title="CHẨN ĐOÁN ĐỊNH HƯỚNG / DIAGNOSTIC ORIENTATION:" />
        <div className="font-bold mb-1">- Đau TK ngoại biên / <i>Peripheral neuropathic pain</i>:</div>
        <div className="pl-4 mb-3">
          <Chk checked={Boolean(nbDh.duoiDa)} label={<span><b>TK dưới da</b> / <i>Superficial shoot skin</i></span>} />
          <Chk checked={Boolean(nbDh.trucTk)} label={<span><b>Trục TK</b> / <i>Troncular</i></span>} />
          <Chk checked={Boolean(nbDh.reTk)} label={<span><b>Rễ TK</b> / <i>Radicular</i></span>} />
        </div>

        <div className="font-bold mb-1">- Đau TK trung ương / <i>Central Neuropathic pain</i>:</div>
        <div className="pl-4 mb-4">
          <Chk checked={Boolean(tuDh.tuySong)} label={<span><b>Tủy sống</b> / <i>Medullar</i></span>} />
          <Chk checked={Boolean(tuDh.canhTuySong)} label={<span><b>Cạnh tủy sống</b> / <i>Supra-medullar</i></span>} />
        </div>

        <SectionBanner title="TỔNG HỢP / SYNTHESIS:" />
        <div className="font-bold mb-1">
          Đánh giá yêu cầu của người bệnh / <i>Evaluation of the patient request</i>
        </div>
        <DotLine
          label={<span><b>- Ưu tiên của người bệnh là gì?</b> / <i>What is the patient priority?</i>:</span>}
          value={cdDh.uuTienNguoiBenh}
        />
        <DotLine
          label={<span><b>- Mức độ cải thiện chung có thể chấp nhận?</b> / <i>Percentage of amelioration</i>:</span>}
          value={cdDh.mucDoCaiThienChapNhan}
        />
        <DotLine
          label={<span><b>- Thái độ của NB đối với phương pháp điều trị đặc biệt?</b>:</span>}
          value={cdDh.thaiDoVoiDieuTriDacBiet}
        />
        <DotLine
          label={<span><b>Đề xuất kế hoạch</b> / <i>Strategy proposed</i>:</span>}
          value={cdDh.deXuatKeHoach}
        />
        <DotLine label={<span><b>Lợi ích</b> / <i>Benefits</i>:</span>} value={cdDh.loiIch} />
        <DotLine label={<span><b>Tỷ lệ thành công</b> / <i>Success rate</i> (%):</span>} value={cdDh.tyLeThanhCong} />
        <DotLine label={<span><b>Nguy cơ</b> / <i>Risks</i>:</span>} value={cdDh.nguyCo} />

        <div className="mt-4 flex items-center gap-6">
          <span className="font-bold">Người bệnh đồng ý / <i>Patient acceptance</i>:</span>
          <Chk checked={safeText(cdDh.nguoiBenhDongY).toUpperCase() === 'YES'} label={<b>Có / <i>Yes</i></b>} />
          <Chk checked={safeText(cdDh.nguoiBenhDongY).toUpperCase() === 'NO'} label={<b>Không / <i>No</i></b>} />
        </div>
      </PainPageContainer>

      {/* ==================== TRANG 19 / PAGE 19 ==================== */}
      <PainPageContainer page={19} totalPages={totalPages} docCode={docCode}>
        <SectionBanner title="THEO DÕI / FOLLOW UP" />
        <div className="space-y-3">
          {Array.from({ length: Math.max(6, lichTrinhList.length) }, (_, idx) => {
            const it = safeObj(lichTrinhList[idx]);
            return (
              <div key={idx} className="border-b border-black pb-2">
                <div className="grid grid-cols-2 gap-4">
                  <DotLine label={<span><b>Ngày</b> / <i>Date</i>:</span>} value={it.ngay} />
                  <DotLine label={<span><b>Bác sỹ điều trị</b> / <i>Physician</i>:</span>} value={it.bacSyDieuTri} />
                </div>
                <DotLine label={<span><b>Bước tiếp theo</b> / <i>Next step</i>:</span>} value={it.buocTiepTheo} />
                <DotLine label={<span><b>Lần khám tiếp theo</b> / <i>Next appointment</i>:</span>} value={it.lanKhamTiepTheo} />
              </div>
            );
          })}
        </div>
      </PainPageContainer>
    </div>
  );
};
