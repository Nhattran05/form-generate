import { MedicalRecordJsonData } from '@medical-forms/types/form.types';

const API_BASE = '/api/v1';

export async function exportPdfViaBackend(
  templateId: string,
  data: MedicalRecordJsonData,
  renderedHtml?: string
): Promise<Blob> {
  const response = await fetch(`${API_BASE}/render/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: templateId,
      data,
      rendered_html: renderedHtml || null,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `HTTP ${response.status}`);
  }

  return await response.blob();
}

export async function exportLatexViaBackend(
  templateId: string,
  data: MedicalRecordJsonData
): Promise<string> {
  const response = await fetch(`${API_BASE}/render/latex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: templateId,
      data,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `HTTP ${response.status}`);
  }

  return await response.text();
}
