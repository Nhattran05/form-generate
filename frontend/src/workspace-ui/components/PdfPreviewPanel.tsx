import React, { useState } from 'react';
import { Edit3, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { MedicalFormRenderer } from '@medical-forms/renderer/MedicalFormRenderer';
import {
  MedicalRecordJsonData,
  MedicalTemplateSchema,
} from '@medical-forms/types/form.types';

interface PdfPreviewPanelProps {
  schema: MedicalTemplateSchema;
  data: MedicalRecordJsonData;
  previewContainerRef: React.RefObject<HTMLDivElement>;
}

export const PdfPreviewPanel: React.FC<PdfPreviewPanelProps> = ({
  schema,
  data,
  previewContainerRef,
}) => {
  const [zoom, setZoom] = useState<number>(0.85);
  const [directEditPaper, setDirectEditPaper] = useState<boolean>(false);

  const pageCount = schema.config.headerVariant === 'outpatient' ? 2 : 3;

  return (
    <div className="flex flex-col h-full bg-slate-200/80 overflow-hidden">
      {/* Preview Toolbar */}
      <div className="no-print flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Eye className="w-4 h-4 text-teal-600" />
          <span>Bản xem trước A4 ({pageCount} trang)</span>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setDirectEditPaper((v) => !v)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium transition ${
              directEditPaper
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Cho phép bấm trực tiếp vào bất kỳ chữ nào trên tờ giấy A4 để gõ sửa thêm trước khi in"
          >
            <Edit3 className="w-3 h-3" />
            <span>
              {directEditPaper ? 'Đang bật Sửa trực tiếp trên giấy A4' : 'Bật Sửa trực tiếp trên giấy'}
            </span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.55, Number((z - 0.1).toFixed(2))))}
            className="p-1 rounded hover:bg-slate-100 text-slate-600"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-semibold text-slate-700">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.25, Number((z + 0.1).toFixed(2))))}
            className="p-1 rounded hover:bg-slate-100 text-slate-600"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="ml-1 px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium"
          >
            100%
          </button>
        </div>
      </div>

      {/* Scrollable A4 Canvas */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 150ms ease',
          }}
        >
          <div
            ref={previewContainerRef}
            contentEditable={directEditPaper}
            suppressContentEditableWarning
            className={
              directEditPaper
                ? 'outline-2 outline-dashed outline-amber-400 rounded-sm cursor-text'
                : ''
            }
          >
            <MedicalFormRenderer schema={schema} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};
