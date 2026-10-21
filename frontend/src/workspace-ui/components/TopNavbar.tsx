import React, { useRef } from 'react';
import {
  FileCode2,
  FileDown,
  FileJson,
  Printer,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';
import { RegistryTemplateMeta } from '@medical-forms/types/form.types';

interface TopNavbarProps {
  templates: RegistryTemplateMeta[];
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onResetSample: () => void;
  onUploadJson: (file: File) => void;
  onDownloadJson: () => void;
  onExportPdfBackend: () => void;
  onPrintBrowser: () => void;
  onExportLatex: () => void;
  isExportingPdf: boolean;
  isExportingLatex: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onResetSample,
  onUploadJson,
  onDownloadJson,
  onExportPdfBackend,
  onPrintBrowser,
  onExportLatex,
  isExportingPdf,
  isExportingLatex,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const featuredTemplates = templates.filter((t) => t.featured);
  const otherTemplates = templates.filter((t) => !t.featured);

  return (
    <header className="no-print bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm z-20">
      {/* Brand & Template Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">

          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm tracking-tight">
                Medical Form
              </span>
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block mx-1" />

        {/* Dropdown chọn 29 mẫu bệnh án */}
        <div className="flex items-center gap-2">
          <label htmlFor="template-select" className="text-xs font-semibold text-slate-600">
            Mẫu bệnh án:
          </label>
          <select
            id="template-select"
            value={selectedTemplateId}
            onChange={(e) => onSelectTemplate(e.target.value)}
            className="text-sm font-medium bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-w-[270px]"
          >
            <optgroup label="★ 5 Nhóm Mẫu Đại Diện Chuẩn (Đầy đủ dữ liệu mẫu)">
              {featuredTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.code}] {t.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="Danh mục mở rộng (24 mẫu còn lại trong Phụ lục XXVIII)">
              {otherTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.code}] {t.title}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUploadJson(file);
              e.target.value = '';
            }
          }}
        />

        <button
          type="button"
          onClick={onResetSample}
          title="Khôi phục dữ liệu JSON mẫu của bệnh án này"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Nạp Mẫu</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Nhập .JSON</span>
        </button>

        <button
          type="button"
          onClick={onDownloadJson}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
        >
          <FileJson className="w-3.5 h-3.5" />
          <span>Lưu .JSON</span>
        </button>

        <button
          type="button"
          onClick={onExportLatex}
          disabled={isExportingLatex}
          title="Tải file mã nguồn LaTeX (.tex)"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition disabled:opacity-50"
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>{isExportingLatex ? 'Đang tạo .TEX...' : 'Tải .TEX'}</span>
        </button>

        <button
          type="button"
          onClick={onPrintBrowser}
          title="In trực tiếp bản xem trước"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>In Trang</span>
        </button>

        <button
          type="button"
          onClick={onExportPdfBackend}
          disabled={isExportingPdf}
          title="Server chuyển JSON sang .tex rồi biên dịch ra PDF bằng XeLaTeX/pdfLaTeX"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition disabled:opacity-60"
        >
          {isExportingPdf ? (
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileDown className="w-3.5 h-3.5" />
          )}
          <span>{isExportingPdf ? 'Đang dịch .TEX → PDF...' : 'Xuất PDF'}</span>
        </button>
      </div>
    </header>
  );
};
