import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  Code2,
  Copy,
  Eraser,
  FileEdit,
  Layers,
  SlidersHorizontal,
  Wand2,
} from 'lucide-react';
import {
  MedicalRecordJsonData,
  MedicalTemplateSchema,
  RegistryTemplateMeta,
} from '@medical-forms/types/form.types';
import { FullFormEditor } from './FullFormEditor';

interface JsonEditorPanelProps {
  rawJson: string;
  jsonError: string | null;
  parsedData: MedicalRecordJsonData;
  schema: MedicalTemplateSchema;
  meta: RegistryTemplateMeta;
  onRawJsonChange: (text: string) => void;
  onUpdateData: (updater: (prev: MedicalRecordJsonData) => MedicalRecordJsonData) => void;
}

type EditorTab = 'json' | 'full-form' | 'quick-form' | 'schema';

export const JsonEditorPanel: React.FC<JsonEditorPanelProps> = ({
  rawJson,
  jsonError,
  parsedData,
  schema,
  meta,
  onRawJsonChange,
  onUpdateData,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('json');
  const [copied, setCopied] = useState(false);

  const handleFormatJson = () => {
    try {
      const obj = JSON.parse(rawJson);
      onRawJsonChange(JSON.stringify(obj, null, 2));
    } catch {
      // ignore if invalid
    }
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onRawJsonChange(text);
      }
    } catch {
      // fallback: user can Ctrl+V directly in textarea
    }
  };

  const hc = parsedData.hanhChinh || {};
  const header = parsedData.header || {};
  const ba = parsedData.benhAn || {};
  const khamBenh = ba.khamBenh || {};
  const sinhHieu = khamBenh.sinhHieu || {};
  const cdKhoa = ba.chanDoanKhoa || {};

  return (
    <div className="no-print flex flex-col h-full bg-white border-r border-slate-200">
      {/* 4 Chức năng chính trên thanh Tabs Header */}
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-200/75 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'json'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Chỉnh sửa JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('full-form')}
            className={`inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'full-form'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Nhập Đầy Đủ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick-form')}
            className={`inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'quick-form'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Form Nhập Nhanh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'schema'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Cấu Trúc Component</span>
          </button>
        </div>

        {/* Thanh công cụ thao tác nhanh cho chế độ JSON */}
        {activeTab === 'json' && (
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[11px] text-slate-500">
              Dán trực tiếp (`Ctrl+V`) hoặc sửa mã JSON bên dưới:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                title="Dán JSON trực tiếp từ Clipboard"
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>Dán JSON</span>
              </button>
              <button
                type="button"
                onClick={() => onRawJsonChange('{\n  \n}')}
                title="Xóa trắng để dán JSON mới"
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
              >
                <Eraser className="w-3 h-3" />
                <span>Xóa trắng</span>
              </button>
              <button
                type="button"
                onClick={handleFormatJson}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50"
              >
                <Wand2 className="w-3 h-3" />
                <span>Format</span>
              </button>
              <button
                type="button"
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Đã chép!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="px-3.5 py-1.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between text-xs">
        <div className="truncate text-slate-600">
          <span className="font-semibold text-slate-800">{meta.code}</span> — {meta.description}
        </div>
        <div className="ml-2 shrink-0">
          {jsonError ? (
            <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Lỗi JSON
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              JSON Hợp lệ
            </span>
          )}
        </div>
      </div>

      {/* CHỨC NĂNG 1: Chỉnh sửa JSON / JSON Raw (Dán trực tiếp vào luôn) */}
      {activeTab === 'json' && (
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <textarea
            value={rawJson}
            onChange={(e) => onRawJsonChange(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full p-3.5 font-mono text-xs leading-relaxed bg-slate-950 text-emerald-300 focus:outline-none resize-none selection:bg-teal-800"
            placeholder="Dán (Ctrl+V) hoặc nhập trực tiếp dữ liệu JSON của bệnh án vào đây..."
          />
          {jsonError && (
            <div className="bg-rose-950/95 border-t border-rose-700 text-rose-200 px-3.5 py-2 text-xs font-mono">
              ⚠️ Cú pháp JSON chưa hợp lệ: {jsonError}
            </div>
          )}
        </div>
      )}

      {/* CHỨC NĂNG 2: Nhập Đầy Đủ (100% tất cả các trường của bệnh án) */}
      {activeTab === 'full-form' && (
        <FullFormEditor data={parsedData} schema={schema} onUpdateData={onUpdateData} />
      )}

      {/* CHỨC NĂNG 3: Form Nhập Nhanh (Các trường cốt lõi) */}
      {activeTab === 'quick-form' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Ô dán nhanh JSON ngay trong tab Nhập Nhanh */}
          <div className="p-3 rounded-lg border border-teal-200 bg-teal-50/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-900 text-[11px] uppercase">
                Dán nhanh chuỗi JSON (Không cần mở file)
              </span>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-teal-700 bg-white border border-teal-300 rounded hover:bg-teal-50"
              >
                <ClipboardPaste className="w-3 h-3" />
                Dán từ Clipboard
              </button>
            </div>
            <textarea
              rows={3}
              value={rawJson}
              onChange={(e) => onRawJsonChange(e.target.value)}
              placeholder="Dán trực tiếp JSON vào đây để tự động điền toàn bộ Form..."
              className="w-full p-2 rounded border border-teal-300 bg-white font-mono text-[11px]"
            />
          </div>

          {/* Khối Hành chính */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              1. Thông tin Hành chính &amp; Bệnh viện
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-600 mb-1">Bệnh viện</label>
                <input
                  type="text"
                  value={header.benhVien || ''}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      header: { ...prev.header, benhVien: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Khoa điều trị</label>
                <input
                  type="text"
                  value={header.khoa || ''}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      header: { ...prev.header, khoa: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-600 mb-1">Họ và tên người bệnh (In hoa)</label>
                <input
                  type="text"
                  value={hc.hoVaTen || ''}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      hanhChinh: { ...prev.hanhChinh, hoVaTen: e.target.value.toUpperCase() },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Ngày sinh (DD/MM/YYYY)</label>
                <input
                  type="text"
                  value={hc.sinhNgay || ''}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      hanhChinh: { ...prev.hanhChinh, sinhNgay: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Tuổi</label>
                <input
                  type="text"
                  value={hc.tuoi || ''}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      hanhChinh: { ...prev.hanhChinh, tuoi: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Giới tính</label>
                <select
                  value={hc.gioi || 1}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      hanhChinh: { ...prev.hanhChinh, gioi: Number(e.target.value) },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value={1}>1. Nam</option>
                  <option value={2}>2. Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Số thẻ BHYT</label>
                <input
                  type="text"
                  value={hc.soTheBhyt || ''}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      hanhChinh: { ...prev.hanhChinh, soTheBhyt: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Khối Sinh Hiệu */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              2. Chỉ số Sinh hiệu (Khung VitalsBox)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 mb-1">Mạch (lần/ph)</label>
                <input
                  type="text"
                  value={sinhHieu.mach || ''}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      benhAn: {
                        ...prev.benhAn,
                        khamBenh: {
                          ...prev.benhAn?.khamBenh,
                          sinhHieu: {
                            ...prev.benhAn?.khamBenh?.sinhHieu,
                            mach: e.target.value,
                          },
                        },
                      },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Nhiệt độ (°C)</label>
                <input
                  type="text"
                  value={sinhHieu.nhietDo || ''}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      benhAn: {
                        ...prev.benhAn,
                        khamBenh: {
                          ...prev.benhAn?.khamBenh,
                          sinhHieu: {
                            ...prev.benhAn?.khamBenh?.sinhHieu,
                            nhietDo: e.target.value,
                          },
                        },
                      },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Huyết áp (mmHg)</label>
                <input
                  type="text"
                  value={sinhHieu.huyetAp || ''}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      benhAn: {
                        ...prev.benhAn,
                        khamBenh: {
                          ...prev.benhAn?.khamBenh,
                          sinhHieu: {
                            ...prev.benhAn?.khamBenh?.sinhHieu,
                            huyetAp: e.target.value,
                          },
                        },
                      },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Nhịp thở (lần/ph)</label>
                <input
                  type="text"
                  value={sinhHieu.nhipTho || ''}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      benhAn: {
                        ...prev.benhAn,
                        khamBenh: {
                          ...prev.benhAn?.khamBenh,
                          sinhHieu: {
                            ...prev.benhAn?.khamBenh?.sinhHieu,
                            nhipTho: e.target.value,
                          },
                        },
                      },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Cân nặng (kg)</label>
                <input
                  type="text"
                  value={sinhHieu.canNang || ''}
                  onChange={(e) =>
                    onUpdateData((prev) => ({
                      ...prev,
                      benhAn: {
                        ...prev.benhAn,
                        khamBenh: {
                          ...prev.benhAn?.khamBenh,
                          sinhHieu: {
                            ...prev.benhAn?.khamBenh?.sinhHieu,
                            canNang: e.target.value,
                          },
                        },
                      },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Khối Lý do vào viện & Chẩn đoán */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              3. Lý do vào viện, Bệnh sử &amp; Chẩn đoán
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Lý do vào viện</label>
              <input
                type="text"
                value={ba.lyDoVaoVien || ''}
                onChange={(e) =>
                  onUpdateData((prev) => ({
                    ...prev,
                    benhAn: { ...prev.benhAn, lyDoVaoVien: e.target.value },
                  }))
                }
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Quá trình bệnh lý</label>
              <textarea
                rows={3}
                value={ba.hoiBenh?.quaTrinhBenhLy || ''}
                onChange={(e) =>
                  onUpdateData((prev) => ({
                    ...prev,
                    benhAn: {
                      ...prev.benhAn,
                      hoiBenh: {
                        ...prev.benhAn?.hoiBenh,
                        quaTrinhBenhLy: e.target.value,
                      },
                    },
                  }))
                }
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Chẩn đoán bệnh chính</label>
              <input
                type="text"
                value={cdKhoa.benhChinh || ''}
                onChange={(e) =>
                  onUpdateData((prev) => ({
                    ...prev,
                    benhAn: {
                      ...prev.benhAn,
                      chanDoanKhoa: {
                        ...prev.benhAn?.chanDoanKhoa,
                        benhChinh: e.target.value,
                      },
                    },
                  }))
                }
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-semibold"
              />
            </div>
          </div>
        </div>
      )}

      {/* CHỨC NĂNG 4: Cấu trúc Component & Schema (Dễ sửa & Moving code) */}
      {activeTab === 'schema' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-900">
            <div className="font-bold mb-1">📦 Cách tái sử dụng &amp; Di chuyển Code (Moving Code)</div>
            <p className="leading-relaxed text-teal-800">
              Toàn bộ các Component biểu mẫu Y tế nằm độc lập tại{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border border-teal-200 font-mono">
                src/medical-forms/
              </code>{' '}
              và cấu hình JSON tại{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border border-teal-200 font-mono">
                shared-schemas/
              </code>
              . Khi có bệnh án mới, chỉ cần tạo file cấu hình JSON khai báo các section dưới đây:
            </p>
          </div>

          <div className="font-bold text-slate-700 uppercase text-[11px]">
            Cấu hình Template Schema hiện tại ({schema.code}):
          </div>
          <pre className="p-3 bg-slate-900 text-sky-300 rounded-lg font-mono text-[11px] overflow-x-auto">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
