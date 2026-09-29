export type CoverLetterArchetype =
  | "internship"
  | "software-engineer"
  | "product-manager"
  | "research"
  | "startup"
  | "corporate";

export type CoverLetterTone =
  | "professional"
  | "enthusiastic"
  | "minimalist"
  | "storytelling"
  | "data-driven";

export interface CoverLetterVersion {
  id: string;
  savedAt: string;
  tone: CoverLetterTone;
  archetype: CoverLetterArchetype;
  content: string;
  wordCount: number;
}

export interface CoverLetter {
  id: string;
  title: string;
  targetRole: string;
  companyName: string;
  hiringManager?: string;
  jobDescription?: string;
  resumeId?: string;
  archetype: CoverLetterArchetype;
  tone: CoverLetterTone;

  // Contact letterhead information
  senderName: string;
  senderTitle?: string;
  senderEmail: string;
  senderPhone?: string;
  senderLocation?: string;

  // Recipient block
  recipientName?: string;
  recipientTitle?: string;
  recipientCompany?: string;
  recipientLocation?: string;
  date: string;

  // Letter text content
  content: string;

  // Version tracking
  versions: CoverLetterVersion[];
  createdAt: string;
  updatedAt: string;
}
