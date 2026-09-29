import {
  Resume,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  AchievementItem,
} from "./resume";

export type SyncStatus = "in-sync" | "unsynced" | "conflicts" | "syncing" | "queued";

export type SyncDirection = "resume-to-portfolio" | "portfolio-to-resume" | "bidirectional";

export interface SelectiveSyncConfig {
  skills: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
  certifications: boolean;
  achievements: boolean;
  personalInfo: boolean;
}

export interface FieldConflict {
  id: string;
  fieldPath: string; // e.g. "personalInfo.jobTitle", "projects[0].description", "skills"
  fieldLabel: string; // Human readable title
  section: "personalInfo" | "projects" | "skills" | "experience" | "education" | "certifications" | "achievements";
  currentValue: any; // Value in Target
  incomingValue: any; // Value in Source
  selectedChoice: "current" | "incoming";
}

export interface SyncHistoryEntry {
  id: string;
  timestamp: string;
  direction: SyncDirection;
  status: "success" | "conflicts-resolved" | "cancelled" | "failed";
  changedFields: string[];
  conflictsCount: number;
  sourceLabel: string;
  targetLabel: string;
  durationMs?: number;
  notes?: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  event: string;
  details?: Record<string, any>;
}

export interface SyncQueueItem {
  id: string;
  sourceId: string;
  targetId: string;
  sourceName: string;
  targetName: string;
  direction: SyncDirection;
  payload: SyncProfilePayload;
  status: "pending" | "processing" | "completed" | "failed";
  retryCount: number;
  enqueuedAt: string;
  processedAt?: string;
  error?: string;
}

export interface SyncSettings {
  autoSyncEnabled: boolean;
  autoSyncDebounceMs: number;
  defaultDirection: SyncDirection;
  selectiveSync: SelectiveSyncConfig;
  promptOnConflicts: boolean;
  lastSyncedAt?: string;
}

export interface SyncProfilePayload {
  personalInfo: PersonalInfo;
  projects: ProjectItem[];
  skills: SkillItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications?: CertificationItem[];
  achievements?: AchievementItem[];
}

export interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  conflictsResolved: number;
  lastSyncDurationMs: number;
}
