import { Resume } from "./resume";

export interface SectionConfidenceScores {
  overall: number; // 0 - 100
  personalInfo: number;
  experience: number;
  education: number;
  skills: number;
  projects: number;
  certifications: number;
  achievements: number;
}

export interface FieldConfidence {
  field: string;
  section: string;
  confidence: number; // 0 - 100
  sourceSnippet?: string;
  lineNumber?: number;
  status: "verified" | "inferred" | "missing" | "flagged";
}

export interface UncertainField {
  section: "personalInfo" | "experience" | "education" | "skills" | "projects" | "certifications" | "achievements";
  field: string;
  index?: number;
  reason: string;
  suggestedAction?: string;
  sourceSnippet?: string;
}

export interface ExtractedFieldMeta {
  detectedCount: number;
  confidence: number;
  warnings?: string[];
  uncertainFields?: UncertainField[];
}

export interface SourceTraceItem {
  id: string;
  fieldKey: string;
  label: string;
  section: "personalInfo" | "experience" | "education" | "skills" | "projects" | "certifications" | "achievements";
  documentValue: string; // The exact text / line from the source document
  parsedValue: string;   // The value extracted into structured format
  lineNumber?: number;
  confidence: number;
  status: "verified" | "inferred" | "missing" | "flagged";
}

export interface ImportDiagnostics {
  parserMethod: "deterministic_v2" | "ai_enhanced";
  processingTimeMs: number;
  characterCount: number;
  lineCount: number;
  detectedSections: string[];
  missingSections: string[];
  totalFieldsExtracted: number;
  traceableFieldsCount: number;
  traceabilityPercentage: number;
  warningsCount: number;
  rawTextPreview: string;
}

export interface OriginalDocument {
  fileName: string;
  fileType: string;
  rawText: string;
  lines: string[];
  uploadedAt: string;
  fileSizeBytes?: number;
}

export interface ResumeExtractionResult {
  success: boolean;
  fileName?: string;
  fileType?: string;
  rawTextLength: number;
  resume: Resume;
  confidenceScores: SectionConfidenceScores;
  fieldMeta: {
    personalInfo: ExtractedFieldMeta;
    experience: ExtractedFieldMeta;
    education: ExtractedFieldMeta;
    skills: ExtractedFieldMeta;
    projects: ExtractedFieldMeta;
    certifications: ExtractedFieldMeta;
    achievements: ExtractedFieldMeta;
  };
  uncertainFields: UncertainField[];
  sourceTrace: SourceTraceItem[];
  diagnostics: ImportDiagnostics;
  originalDocument: OriginalDocument;
  pipelineStage: "extracted" | "validated" | "reviewed" | "enhanced" | "saved";
  suggestedTargetRole?: string;
  detectedSeniority?: "Intern / Junior" | "Mid-Level" | "Senior" | "Lead / Staff" | "Executive / Director";
}
