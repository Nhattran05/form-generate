export interface OrganFieldSchema {
  key: string;
  label: string;
  lines?: number;
}

export interface PainRecordImageItem {
  order: number;
  page: number;
  src: string;
  height?: string;
  caption?: string;
}

export interface TemplateConfig {
  headerVariant: 'standard' | 'outpatient' | 'yhct' | 'pain_record';
  adminVariant: 'adult' | 'pediatric' | 'outpatient' | 'yhct';
  managementVariant: 'inpatient' | 'none';
  diagnosisVariant: 'internal' | 'surgical' | 'yhct_dual' | 'none';
  dischargeVariant: 'standard' | 'surgical' | 'none';
  hasRelatedCharacteristicsTable?: boolean;
  hasGrowthHistory?: boolean;
  hasSurgicalBlock?: boolean;
  hasTraditionalMedicine?: boolean;
  totalPages?: number;
  documentCode?: string;
  imageOrder?: PainRecordImageItem[];
  vitalsFields: string[];
  organFields: OrganFieldSchema[];
  summaryVariant: 'internal' | 'surgical' | 'outpatient' | 'yhct';
}

export interface MedicalTemplateSchema {
  id: string;
  code: string;
  officialCode: string;
  title: string;
  layoutGroup: string;
  config: TemplateConfig;
}

export interface RegistryTemplateMeta {
  id: string;
  code: string;
  officialCode: string;
  title: string;
  category: string;
  layoutGroup: string;
  featured: boolean;
  schemaFile: string;
  sampleFile: string;
  description: string;
}

export interface MedicalRecordJsonData {
  templateId?: string;
  header?: Record<string, any>;
  hanhChinh?: Record<string, any>;
  quanLyNguoiBenh?: Record<string, any>;
  chanDoan?: Record<string, any>;
  tinhTrangRaVien?: Record<string, any>;
  benhAn?: Record<string, any>;
  tongKet?: Record<string, any>;
  [key: string]: any;
}
