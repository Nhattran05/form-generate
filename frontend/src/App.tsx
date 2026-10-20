import React, { useMemo, useRef, useState } from 'react';
import {
  ALL_TEMPLATES,
  getTemplateBundleById,
  MedicalRecordJsonData,
} from '@medical-forms/index';
import { TopNavbar } from './workspace-ui/components/TopNavbar';
import { JsonEditorPanel } from './workspace-ui/components/JsonEditorPanel';
import { PdfPreviewPanel } from './workspace-ui/components/PdfPreviewPanel';
import { exportLatexViaBackend, exportPdfViaBackend } from './workspace-ui/services/api';

export const App: React.FC = () => {
  const initialBundle = useMemo(() => getTemplateBundleById('01_noi_khoa'), []);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('01_noi_khoa');
  const [rawJson, setRawJson] = useState<string>(() =>
    JSON.stringify(initialBundle.sample, null, 2)
  );
  const [parsedData, setParsedData] = useState<MedicalRecordJsonData>(initialBundle.sample);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingLatex, setIsExportingLatex] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const currentBundle = useMemo(
    () => getTemplateBundleById(selectedTemplateId),
    [selectedTemplateId]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectTemplate = (templateId: string) => {
    const bundle = getTemplateBundleById(templateId);
    setSelectedTemplateId(templateId);
    setParsedData(bundle.sample);
    setRawJson(JSON.stringify(bundle.sample, null, 2));
    setJsonError(null);
    showToast(`Đã nạp mẫu [${bundle.meta.code}] ${bundle.meta.title}`);
  };

  const handleResetSample = () => {
    const bundle = getTemplateBundleById(selectedTemplateId);
    setParsedData(bundle.sample);
    setRawJson(JSON.stringify(bundle.sample, null, 2));
    setJsonError(null);
    showToast('Đã khôi phục dữ liệu JSON mẫu');
  };

  const handleRawJsonChange = (text: string) => {
    setRawJson(text);
    try {
      const obj = JSON.parse(text);
      setParsedData(obj);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err?.message || 'Lỗi cú pháp JSON');
    }
  };

  const handleUpdateData = (
    updater: (prev: MedicalRecordJsonData) => MedicalRecordJsonData
  ) => {
    setParsedData((prev) => {
      const next = updater(prev);
      setRawJson(JSON.stringify(next, null, 2));
      setJsonError(null);
      return next;
    });
  };

  const handleUploadJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      try {
        const obj = JSON.parse(text);
        if (obj.templateId) {
          setSelectedTemplateId(obj.templateId);
        }
        setParsedData(obj);
        setRawJson(JSON.stringify(obj, null, 2));
        setJsonError(null);
        showToast(`Đã tải dữ liệu từ file ${file.name}`);
      } catch (err: any) {
        setJsonError(err?.message || 'File JSON không hợp lệ');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDownloadJson = () => {
    const blob = new Blob([rawJson], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplateId}.data.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã lưu file ${selectedTemplateId}.data.json`);
  };

  const handlePrintBrowser = () => {
    window.print();
  };

  const handleExportPdfBackend = async () => {
    setIsExportingPdf(true);
    try {
      const renderedHtml = previewContainerRef.current?.innerHTML || '';
      const pdfBlob = await exportPdfViaBackend(
        selectedTemplateId,
        parsedData,
        renderedHtml
      );
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplateId}_${
        parsedData.hanhChinh?.hoVaTen?.replace(/\s+/g, '_') || 'BenhAn'
      }.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Xuất file PDF từ FastAPI thành công!');
    } catch (err: any) {
      showToast(
        `FastAPI chưa bật hoặc lỗi (${err?.message}). Đang chuyển sang hộp thoại In PDF trực tiếp...`
      );
      setTimeout(() => window.print(), 600);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportLatex = async () => {
    setIsExportingLatex(true);
    try {
      const texContent = await exportLatexViaBackend(selectedTemplateId, parsedData);
      const blob = new Blob([texContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplateId}.tex`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Đã xuất mã nguồn LaTeX (${selectedTemplateId}.tex)`);
    } catch (err: any) {
      showToast(`Lỗi khi xuất LaTeX: ${err?.message}`);
    } finally {
      setIsExportingLatex(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100">
      {/* Top Navbar */}
      <TopNavbar
        templates={ALL_TEMPLATES}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={handleSelectTemplate}
        onResetSample={handleResetSample}
        onUploadJson={handleUploadJson}
        onDownloadJson={handleDownloadJson}
        onExportPdfBackend={handleExportPdfBackend}
        onPrintBrowser={handlePrintBrowser}
        onExportLatex={handleExportLatex}
        isExportingPdf={isExportingPdf}
        isExportingLatex={isExportingLatex}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg border border-slate-700">
          {toastMessage}
        </div>
      )}

      {/* Main Split-View Studio */}
      <main className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Cột Trái: JSON Editor & Quick Form (5/12 màn hình) */}
        <div className="no-print col-span-12 lg:col-span-5 h-full overflow-hidden">
          <JsonEditorPanel
            rawJson={rawJson}
            jsonError={jsonError}
            parsedData={parsedData}
            schema={currentBundle.schema}
            meta={currentBundle.meta}
            onRawJsonChange={handleRawJsonChange}
            onUpdateData={handleUpdateData}
          />
        </div>

        {/* Cột Phải: Live A4 Preview (7/12 màn hình, khi in chiếm 100%) */}
        <div className="col-span-12 lg:col-span-7 h-full overflow-hidden">
          <PdfPreviewPanel
            schema={currentBundle.schema}
            data={parsedData}
            previewContainerRef={previewContainerRef}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
