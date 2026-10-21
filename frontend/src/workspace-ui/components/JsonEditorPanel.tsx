import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  Code2,
  Copy,
  Eraser,
  FileEdit,
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

type EditorTab = 'full-form' | 'json';

export const JsonEditorPanel: React.FC<JsonEditorPanelProps> = ({
  rawJson,
  jsonError,
  parsedData,
  schema,
  meta,
  onRawJsonChange,
  onUpdateData,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('full-form');
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

  return (
    <div className="no-print flex flex-col h-full bg-white border-r border-slate-200">
      {/* 2 Chức năng chính trên thanh Tabs Header: Nhập Đầy Đủ & Chỉnh sửa JSON */}
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 space-y-2">
        <div className="grid grid-cols-2 gap-1.5 bg-slate-200/75 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('full-form')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'full-form'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5 shrink-0" />
            <span>Nhập Đầy Đủ (Form)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'json'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 shrink-0" />
            <span>Chỉnh Sửa Bằng JSON</span>
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

      {/* CHỨC NĂNG 1: Nhập Đầy Đủ (100% tất cả các trường của bệnh án) */}
      {activeTab === 'full-form' && (
        <FullFormEditor data={parsedData} schema={schema} onUpdateData={onUpdateData} />
      )}

      {/* CHỨC NĂNG 2: Chỉnh sửa bằng JSON (Dán trực tiếp vào luôn) */}
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
    </div>
  );
};
