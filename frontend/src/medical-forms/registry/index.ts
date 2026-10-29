import registryData from '@shared-schemas/registry.json';
import tpl01 from '@shared-schemas/templates/01_noi_khoa.json';
import tpl02 from '@shared-schemas/templates/02_nhi_khoa.json';
import tpl10 from '@shared-schemas/templates/10_ngoai_khoa.json';
import tpl15 from '@shared-schemas/templates/15_ngoai_tru.json';
import tpl18 from '@shared-schemas/templates/18_yhct_noi_tru.json';
import tpl30 from '@shared-schemas/templates/30_benh_an_dau.json';

import sample01 from '@shared-schemas/samples/01_noi_khoa.sample.json';
import sample02 from '@shared-schemas/samples/02_nhi_khoa.sample.json';
import sample10 from '@shared-schemas/samples/10_ngoai_khoa.sample.json';
import sample15 from '@shared-schemas/samples/15_ngoai_tru.sample.json';
import sample18 from '@shared-schemas/samples/18_yhct_noi_tru.sample.json';
import sample30 from '@shared-schemas/samples/30_benh_an_dau.sample.json';

import {
  MedicalRecordJsonData,
  MedicalTemplateSchema,
  RegistryTemplateMeta,
} from '../types/form.types';

const SCHEMA_MAP: Record<string, MedicalTemplateSchema> = {
  'templates/01_noi_khoa.json': tpl01 as unknown as MedicalTemplateSchema,
  'templates/02_nhi_khoa.json': tpl02 as unknown as MedicalTemplateSchema,
  'templates/10_ngoai_khoa.json': tpl10 as unknown as MedicalTemplateSchema,
  'templates/15_ngoai_tru.json': tpl15 as unknown as MedicalTemplateSchema,
  'templates/18_yhct_noi_tru.json': tpl18 as unknown as MedicalTemplateSchema,
  'templates/30_benh_an_dau.json': tpl30 as unknown as MedicalTemplateSchema,
};

const SAMPLE_MAP: Record<string, MedicalRecordJsonData> = {
  'samples/01_noi_khoa.sample.json': sample01 as unknown as MedicalRecordJsonData,
  'samples/02_nhi_khoa.sample.json': sample02 as unknown as MedicalRecordJsonData,
  'samples/10_ngoai_khoa.sample.json': sample10 as unknown as MedicalRecordJsonData,
  'samples/15_ngoai_tru.sample.json': sample15 as unknown as MedicalRecordJsonData,
  'samples/18_yhct_noi_tru.sample.json': sample18 as unknown as MedicalRecordJsonData,
  'samples/30_benh_an_dau.sample.json': sample30 as unknown as MedicalRecordJsonData,
};

export const ALL_TEMPLATES: RegistryTemplateMeta[] = registryData.templates;

export function getTemplateBundleById(templateId: string): {
  meta: RegistryTemplateMeta;
  schema: MedicalTemplateSchema;
  sample: MedicalRecordJsonData;
} {
  const meta =
    ALL_TEMPLATES.find((t) => t.id === templateId || t.code === templateId) || ALL_TEMPLATES[0];

  const baseSchema = SCHEMA_MAP[meta.schemaFile] || SCHEMA_MAP['templates/01_noi_khoa.json'];
  const baseSample = SAMPLE_MAP[meta.sampleFile] || SAMPLE_MAP['samples/01_noi_khoa.sample.json'];

  const schema: MedicalTemplateSchema = {
    ...JSON.parse(JSON.stringify(baseSchema)),
    id: meta.id,
    code: meta.code,
    officialCode: meta.officialCode,
    title: meta.title,
  };

  const sample: MedicalRecordJsonData = JSON.parse(JSON.stringify(baseSample));
  sample.templateId = meta.id;
  if (sample.header) {
    sample.header.tenBenhAn = meta.title;
    sample.header.maSo = meta.officialCode;
  }

  return { meta, schema, sample };
}
