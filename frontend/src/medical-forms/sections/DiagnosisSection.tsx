import React from 'react';
import { CharBoxes, DottedField, OptionCheck } from '../primitives/MedicalPrimitives';

export const DiagnosisSection: React.FC<{
  data?: Record<string, any>;
  variant?: 'internal' | 'surgical' | 'yhct_dual' | 'none';
}> = ({ data = {}, variant = 'internal' }) => {
  if (variant === 'none') return null;

  const ncd = data.noiChuyenDen || {};
  const kkb = data.kkbCapCuu || {};
  const vkh = data.khiVaoKhoaDieuTri || {};
  const rv = data.raVien || {};

  if (variant === 'yhct_dual') {
    return (
      <div className="mb-2 text-[11pt]">
        <div className="font-bold uppercase mb-0.5">III. CHẨN ĐOÁN:</div>
        <div className="med-box-frame grid grid-cols-12">
          {/* Cột Trái: CHẨN ĐOÁN THEO YHHĐ */}
          <div className="col-span-6 border-r border-black p-1.5">
            <div className="flex justify-between font-bold border-b border-black pb-0.5 mb-1">
              <span>CHẨN ĐOÁN THEO YHHĐ</span>
              <span>MÃ</span>
            </div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <DottedField label="21. Nơi chuyển đến:" value={ncd.ten} className="flex-1" />
              <CharBoxes value={ncd.ma} length={4} />
            </div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <DottedField label="22. KKB/Cấp cứu:" value={kkb.ten} className="flex-1" />
              <CharBoxes value={kkb.ma} length={4} />
            </div>
            <div className="mb-1">
              <div className="font-semibold">23. Vào khoa điều trị:</div>
              <div className="flex items-center justify-between gap-1">
                <DottedField label="- Bệnh chính:" value={vkh.ten} className="flex-1" />
                <CharBoxes value={vkh.ma} length={4} />
              </div>
              <div className="flex items-center justify-between gap-1">
                <DottedField label="- Bệnh kèm theo:" value={vkh.benhKemTheo} className="flex-1" />
                <CharBoxes value={vkh.maKemTheo} length={4} />
              </div>
              <div className="flex items-center gap-4 mt-1">
                <OptionCheck label="+ Thủ thuật" checked={Boolean(data.thuThuat)} />
                <OptionCheck label="+ Phẫu thuật" checked={Boolean(data.phauThuat)} />
              </div>
            </div>
            <div>
              <div className="font-semibold">24. Ra viện:</div>
              <div className="flex items-center justify-between gap-1">
                <DottedField label="- Bệnh chính:" value={rv.benhChinh} className="flex-1" />
                <CharBoxes value={rv.maBenhChinh} length={4} />
              </div>
              <div className="flex items-center justify-between gap-1">
                <DottedField label="- Bệnh kèm theo:" value={rv.benhKemTheo} className="flex-1" />
                <CharBoxes value={rv.maBenhKemTheo} length={4} />
              </div>
              <div className="flex items-center gap-4 mt-1">
                <OptionCheck label="+ Tai biến" checked={Boolean(rv.taiBien)} />
                <OptionCheck label="+ Biến chứng" checked={Boolean(rv.bienChung)} />
              </div>
            </div>
          </div>

          {/* Cột Phải: CHẨN ĐOÁN THEO YHCT */}
          <div className="col-span-6 p-1.5">
            <div className="flex justify-between font-bold border-b border-black pb-0.5 mb-1">
              <span>CHẨN ĐOÁN THEO YHCT</span>
              <span>MÃ</span>
            </div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <DottedField label="25. Nơi chuyển đến:" value={ncd.tenYHCT} className="flex-1" />
              <CharBoxes value={ncd.maYHCT} length={4} />
            </div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <DottedField label="26. KKB/Cấp cứu:" value={kkb.tenYHCT} className="flex-1" />
              <CharBoxes value={kkb.maYHCT} length={4} />
            </div>
            <div className="mb-1">
              <div className="font-semibold">27. Vào khoa điều trị:</div>
              <div className="flex items-center justify-between gap-1">
                <DottedField label="- Bệnh chính:" value={vkh.tenYHCT} className="flex-1" />
                <CharBoxes value={vkh.maYHCT} length={4} />
              </div>
              <div className="flex items-center justify-between gap-1">
                <DottedField
                  label="- Bệnh kèm theo:"
                  value={vkh.benhKemTheoYHCT}
                  className="flex-1"
                />
                <CharBoxes value={vkh.maKemTheoYHCT} length={4} />
              </div>
              <div className="flex items-center gap-4 mt-1">
                <OptionCheck label="+ Thủ thuật" checked={Boolean(data.thuThuat)} />
                <OptionCheck label="+ Phẫu thuật" checked={Boolean(data.phauThuat)} />
              </div>
            </div>
            <div>
              <div className="font-semibold">28. Ra viện:</div>
              <div className="flex items-center justify-between gap-1">
                <DottedField label="- Bệnh chính:" value={rv.benhChinhYHCT} className="flex-1" />
                <CharBoxes value={rv.maBenhChinhYHCT} length={4} />
              </div>
              <div className="flex items-center justify-between gap-1">
                <DottedField
                  label="- Bệnh kèm theo:"
                  value={rv.benhKemTheoYHCT}
                  className="flex-1"
                />
                <CharBoxes value={rv.maBenhKemTheoYHCT} length={4} />
              </div>
              <div className="flex items-center gap-4 mt-1">
                <OptionCheck label="+ Tai biến" checked={Boolean(rv.taiBien)} />
                <OptionCheck label="+ Biến chứng" checked={Boolean(rv.bienChung)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2 text-[11pt]">
      <div className="grid grid-cols-12 font-bold uppercase mb-0.5">
        <div className="col-span-5">III. CHẨN ĐOÁN</div>
        <div className="col-span-1 text-right pr-2">MÃ</div>
        <div className="col-span-5"></div>
        <div className="col-span-1 text-right pr-2">MÃ</div>
      </div>

      <div className="med-box-frame grid grid-cols-12">
        {/* Cột Trái: 20, 21, 22 */}
        <div className="col-span-6 border-r border-black p-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <DottedField label="20. Nơi chuyển đến:" value={ncd.ten} className="flex-1" />
              <CharBoxes value={ncd.ma} length={4} />
            </div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <DottedField label="21. KKB, Cấp cứu:" value={kkb.ten} className="flex-1" />
              <CharBoxes value={kkb.ma} length={4} />
            </div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <DottedField label="22. Khi vào khoa điều trị:" value={vkh.ten} className="flex-1" />
              <CharBoxes value={vkh.ma} length={4} />
            </div>
          </div>

          {variant === 'surgical' ? (
            <div className="pt-1 border-t border-dotted border-slate-400">
              <div className="flex items-center gap-6 mb-1">
                <OptionCheck label="- Tai biến:" checked={Boolean(rv.taiBien)} />
                <OptionCheck label="- Biến chứng:" checked={Boolean(rv.bienChung)} />
              </div>
              <div className="flex items-center flex-wrap gap-1 text-[10pt] italic mb-1">
                <OptionCheck
                  label="1.Do phẫu thuật"
                  checked={data.taiBienBienChungNguyenNhan === 1}
                />
                <OptionCheck label="2.Do gây mê" checked={data.taiBienBienChungNguyenNhan === 2} />
                <OptionCheck
                  label="3.Do nhiễm khuẩn"
                  checked={data.taiBienBienChungNguyenNhan === 3}
                />
                <OptionCheck label="4.Khác" checked={data.taiBienBienChungNguyenNhan === 4} />
              </div>
              <div className="flex items-center justify-between mb-1">
                <span>23. Tổng số ngày điều trị sau phẫu thuật:</span>
                <CharBoxes value={data.tongSoNgaySauPhauThuat} length={3} />
              </div>
              <div className="flex items-center justify-between">
                <span>24. Tổng số lần phẫu thuật:</span>
                <CharBoxes value={data.tongSoLanPhauThuat} length={2} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-around pt-1">
              <OptionCheck label="+ Thủ thuật:" checked={Boolean(data.thuThuat)} />
              <OptionCheck label="+ Phẫu thuật:" checked={Boolean(data.phauThuat)} />
            </div>
          )}
        </div>

        {/* Cột Phải: Ra viện */}
        <div className="col-span-6 p-1.5 flex flex-col justify-between">
          <div>
            <div className="font-semibold mb-1">
              {variant === 'surgical' ? '25. Ra viện:' : '23. Ra viện:'}
            </div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <DottedField
                label={
                  variant === 'surgical' ? '+ Bệnh chính (tổn thương):' : '+ Bệnh chính:'
                }
                value={rv.benhChinh}
                className="flex-1"
              />
              <CharBoxes value={rv.maBenhChinh} length={4} />
            </div>

            {variant === 'surgical' && (
              <div className="flex items-center justify-between gap-1 mb-1">
                <DottedField label="(nguyên nhân):" value={rv.nguyenNhan} className="flex-1" />
                <CharBoxes value={rv.maNguyenNhan} length={4} />
              </div>
            )}

            <div className="flex items-center justify-between gap-1 mb-1">
              <DottedField label="+ Bệnh kèm theo:" value={rv.benhKemTheo} className="flex-1" />
              <CharBoxes value={rv.maBenhKemTheo} length={4} />
            </div>

            {variant === 'surgical' && (
              <>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <DottedField
                    label="+ Chẩn đoán trước phẫu thuật:"
                    value={rv.chanDoanTruocPhauThuat}
                    className="flex-1"
                  />
                  <CharBoxes value={rv.maTruocPhauThuat} length={4} />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <DottedField
                    label="+ Chẩn đoán sau phẫu thuật:"
                    value={rv.chanDoanSauPhauThuat}
                    className="flex-1"
                  />
                  <CharBoxes value={rv.maSauPhauThuat} length={4} />
                </div>
              </>
            )}
          </div>

          {variant !== 'surgical' && (
            <div className="flex items-center justify-around pt-1 border-t border-dotted border-slate-400">
              <OptionCheck label="+ Tai biến:" checked={Boolean(rv.taiBien)} />
              <OptionCheck label="+ Biến chứng:" checked={Boolean(rv.bienChung)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
