import React from 'react';

/**
 * 1. Khung trang chuẩn A4
 */
export const A4Page: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`a4-page print-page ${className}`}>{children}</div>;
};

/**
 * 2. Dòng chấm chấm (Label + Giá trị nằm trên đường chấm)
 */
export const DottedField: React.FC<{
  label?: React.ReactNode;
  value?: React.ReactNode;
  boldValue?: boolean;
  uppercase?: boolean;
  className?: string;
  minWidth?: string;
  suffix?: React.ReactNode;
}> = ({
  label,
  value,
  boldValue = false,
  uppercase = false,
  className = '',
  minWidth = '60px',
  suffix,
}) => {
  return (
    <div className={`med-dotted-row ${className}`}>
      {label && <span className="med-dotted-label">{label}</span>}
      <span
        className={`med-dotted-value ${boldValue ? 'font-bold' : ''} ${
          uppercase ? 'uppercase' : ''
        }`}
        style={{ minWidth }}
      >
        {value ?? ''}
      </span>
      {suffix && <span className="ml-1 whitespace-nowrap">{suffix}</span>}
    </div>
  );
};

/**
 * 3. Khối văn bản nhiều dòng có dòng kẻ chấm chấm
 */
export const DottedBlock: React.FC<{
  label?: React.ReactNode;
  subLabel?: React.ReactNode;
  value?: string;
  lines?: number;
  className?: string;
}> = ({ label, subLabel, value, lines = 3, className = '' }) => {
  const minHeight = `${lines * 1.42}em`;
  return (
    <div className={`mb-1.5 ${className}`}>
      {(label || subLabel) && (
        <div className="mb-0.5">
          {label && <span className="font-bold">{label}</span>}{' '}
          {subLabel && <span className="italic">{subLabel}</span>}
        </div>
      )}
      <div className="med-dotted-multiline" style={{ minHeight }}>
        {value || ''}
      </div>
    </div>
  );
};

/**
 * 4. Cụm ô vuông ký tự (Dùng cho Mã ICD-10, Tuổi, Mã dân tộc, Para...)
 */
export const CharBoxes: React.FC<{
  value?: string | number;
  length: number;
  className?: string;
}> = ({ value = '', length, className = '' }) => {
  const clean = String(value ?? '')
    .replace(/[/\-.\s]/g, '')
    .slice(0, length);
  const chars = Array.from({ length }, (_, idx) => clean[idx] || '');
  return (
    <span className={`med-char-boxes ${className}`}>
      {chars.map((ch, idx) => (
        <span key={idx} className="med-char-box">
          {ch}
        </span>
      ))}
    </span>
  );
};

/**
 * 5. Cụm ô vuông Ngày sinh chuẩn Bộ Y tế (DD | MM | YYYY)
 */
export const DateBoxes: React.FC<{ value?: string }> = ({ value = '' }) => {
  const digits = String(value || '').replace(/\D/g, '');
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <CharBoxes value={dd} length={2} />
      <CharBoxes value={mm} length={2} />
      <CharBoxes value={yyyy} length={4} />
    </span>
  );
};

/**
 * 6. Cụm 5 ô Số thẻ BHYT chuẩn Bộ Y tế
 */
export const BhytBoxes: React.FC<{ value?: string }> = ({ value = '' }) => {
  const clean = String(value || '').replace(/\s+/g, '');
  const p1 = clean.slice(0, 2);
  const p2 = clean.slice(2, 3);
  const p3 = clean.slice(3, 5);
  const p4 = clean.slice(5, 7);
  const p5 = clean.slice(7, 15);
  const segs = [p1, p2, p3, p4, p5];
  const widths = ['w-8', 'w-6', 'w-8', 'w-8', 'w-28'];
  return (
    <span className="inline-flex items-center align-middle">
      {segs.map((seg, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center justify-center h-[21px] border border-black -mr-[1px] text-[10.5pt] font-semibold bg-white px-1 ${widths[idx]}`}
        >
          {seg}
        </span>
      ))}
    </span>
  );
};

/**
 * 7. Ô vuông lựa chọn (Checkbox Option)
 */
export const OptionCheck: React.FC<{
  label: React.ReactNode;
  checked?: boolean;
  className?: string;
}> = ({ label, checked = false, className = '' }) => {
  return (
    <span className={`inline-flex items-center whitespace-nowrap ${className}`}>
      <span>{label}</span>
      <span className="med-check-box">{checked ? 'X' : ''}</span>
    </span>
  );
};

/**
 * 8. Khung Sinh Hiệu (Mạch, Nhiệt độ, Huyết áp, Nhịp thở, Cân nặng, Chiều cao, BMI)
 */
export const VitalsBox: React.FC<{
  vitals?: Record<string, any>;
  fields?: string[];
}> = ({ vitals = {}, fields = ['mach', 'nhietDo', 'huyetAp', 'nhipTho', 'canNang'] }) => {
  const rows: { key: string; label: string; unit: string }[] = [
    { key: 'mach', label: 'Mạch', unit: 'lần/ph' },
    { key: 'nhietDo', label: 'Nhiệt độ', unit: '°C' },
    { key: 'huyetAp', label: 'Huyết áp', unit: 'mmHg' },
    { key: 'nhipTho', label: 'Nhịp thở', unit: 'lần/ph' },
    { key: 'canNang', label: 'Cân nặng', unit: 'kg' },
    { key: 'chieuCao', label: 'Chiều cao', unit: 'cm' },
    { key: 'bmi', label: 'Chỉ số BMI', unit: '' },
  ];

  const activeRows = rows.filter((r) => fields.includes(r.key));

  return (
    <div className="med-box-frame p-2 text-[11pt] italic leading-snug bg-white">
      {activeRows.map((r) => (
        <div key={r.key} className="flex items-baseline justify-between mb-1 last:mb-0">
          <span className="whitespace-nowrap">{r.label}:</span>
          <span className="flex-1 border-b border-dotted border-black mx-1 text-center not-italic font-semibold">
            {vitals[r.key] ?? ''}
          </span>
          {r.unit && <span className="whitespace-nowrap">{r.unit}</span>}
        </div>
      ))}
    </div>
  );
};

/**
 * 9. Bảng Đặc điểm liên quan bệnh (01-Dị ứng .. 06-Khác)
 */
export const RelatedCharacteristicsTable: React.FC<{
  data?: Record<string, { checked?: boolean; thoiGian?: string }>;
}> = ({ data = {} }) => {
  const leftItems = [
    { num: '01', key: 'diUng', label: '- Dị ứng', note: '(dị nguyên)' },
    { num: '02', key: 'maTuy', label: '- Ma tuý', note: '' },
    { num: '03', key: 'ruouBia', label: '- Rượu bia', note: '' },
  ];
  const rightItems = [
    { num: '04', key: 'thuocLa', label: '- Thuốc lá', note: '' },
    { num: '05', key: 'thuocLao', label: '- Thuốc lào', note: '' },
    { num: '06', key: 'khac', label: '- Khác', note: '' },
  ];

  return (
    <div className="my-1.5">
      <div className="mb-1">Đặc điểm liên quan bệnh:</div>
      <table className="med-table text-[11pt]">
        <thead>
          <tr>
            <th className="w-8 text-center">TT</th>
            <th className="text-left">Ký hiệu</th>
            <th className="w-7 text-center"></th>
            <th className="w-36 text-center">Thời gian (tính theo tháng)</th>
            <th className="w-8 text-center">TT</th>
            <th className="text-left">Ký hiệu</th>
            <th className="w-7 text-center"></th>
            <th className="w-36 text-center">Thời gian (tính theo tháng)</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2].map((i) => {
            const l = leftItems[i];
            const r = rightItems[i];
            const lVal = data[l.key] || {};
            const rVal = data[r.key] || {};
            return (
              <tr key={i}>
                <td className="text-center">{l.num}</td>
                <td>{l.label}</td>
                <td className="text-center font-bold">{lVal.checked ? 'X' : ''}</td>
                <td className="text-center">
                  {lVal.thoiGian || <span className="italic text-slate-600">{l.note}</span>}
                </td>
                <td className="text-center">{r.num}</td>
                <td>{r.label}</td>
                <td className="text-center font-bold">{rVal.checked ? 'X' : ''}</td>
                <td className="text-center">{rVal.thoiGian || ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/**
 * 10. Bảng Phẫu thuật / Thủ thuật (Dùng chung cho Ngoại, Sản, Phụ, Bỏng, RHM, TMH, Mắt)
 */
export const SurgeryTable: React.FC<{
  rows?: Array<{
    gioNgay?: string;
    phuongPhapVoCam?: string;
    bacSyPhauThuat?: string;
    bacSyGayMe?: string;
  }>;
}> = ({ rows = [] }) => {
  const displayRows = rows.length >= 3 ? rows : [...rows, ...Array(3 - rows.length).fill({})];
  return (
    <table className="med-table my-2 text-[11pt]">
      <thead>
        <tr>
          <th className="w-1/5 text-center">Giờ, ngày</th>
          <th className="w-2/5 text-center">Phương pháp phẫu thuật/vô cảm</th>
          <th className="w-1/5 text-center">Bác sỹ phẫu thuật</th>
          <th className="w-1/5 text-center">Bác sỹ gây mê</th>
        </tr>
      </thead>
      <tbody>
        {displayRows.map((row, idx) => (
          <tr key={idx} className="h-7">
            <td className="text-center">{row.gioNgay || ''}</td>
            <td>{row.phuongPhapVoCam || ''}</td>
            <td className="text-center">{row.bacSyPhauThuat || ''}</td>
            <td className="text-center">{row.bacSyGayMe || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
