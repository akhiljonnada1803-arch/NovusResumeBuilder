export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
  // Professional Profile Photo System
  photoUrl?: string;
  showPhoto?: boolean;
  photoShape?: "circle" | "rounded" | "square";
  photoSize?: "sm" | "md" | "lg" | "xl" | number;
  photoPosition?: "top-right" | "top-left" | "center-header" | "sidebar" | "floating-hero";
  photoBorder?: { width: number; color?: string; style?: "solid" | "dashed" | "double" };
  photoShadow?: "none" | "subtle" | "elevated" | "glow";
  photoCrop?: { x: number; y: number; zoom: number; rotation?: number };
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle?: string;
  liveUrl?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  technologies: string[];
}

export type SkillProficiency = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface SkillItem {
  id: string;
  name: string;
  level?: SkillProficiency;
  category?: "Technical" | "Languages" | "Frameworks" | "Tools" | "Soft Skills" | "Other";
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  date?: string;
  issuer?: string;
  description: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: "Native" | "Fluent" | "Proficient" | "Conversational" | "Basic";
}

export interface InterestItem {
  id: string;
  name: string;
}

export type TemplateCategory =
  | "ats"
  | "professional"
  | "engineering"
  | "creative"
  | "student"
  | "premium";

export type ResumeTemplateId =
  // Category 1: ATS Professional (5)
  | "ats-classic"
  | "ats-executive"
  | "ats-modern"
  | "ats-minimal"
  | "ats-technical"
  // Category 2: Modern Professional (5)
  | "corporate-blue"
  | "modern-executive"
  | "contemporary-pro"
  | "elegant-business"
  | "premium-consultant"
  // Category 3: Software Engineer (4)
  | "developer-pro"
  | "fullstack-engineer"
  | "tech-minimal"
  | "engineering-portfolio"
  // Category 4: Creative Designer (4)
  | "creative-portfolio"
  | "designer-grid"
  | "visual-artist"
  | "creative-modern"
  // Category 5: Student & Fresher (3)
  | "graduate-starter"
  | "campus-professional"
  | "fresher-ats"
  // Category 6: Premium Showcase (4)
  | "luxury-black"
  | "premium-gold"
  | "minimal-luxury"
  | "elite-executive"
  // Legacy aliases for backward compatibility
  | "modern"
  | "minimalist"
  | "executive"
  | "tech"
  | "creative";

export type ResumeFontFamily = "Inter" | "Roboto" | "Merriweather" | "Outfit" | "Playfair Display";

export interface ResumeDesignSettings {
  template: ResumeTemplateId;
  accentColor: string;
  fontFamily: ResumeFontFamily;
  fontSize: "sm" | "base" | "lg";
  spacing: "compact" | "normal" | "spacious";
  showIcons: boolean;
  showSectionDividers: boolean;
  // Photo styling preferences
  photoShape?: "circle" | "rounded" | "square";
  photoSize?: "sm" | "md" | "lg" | "xl";
  photoPosition?: "top-right" | "top-left" | "center-header" | "sidebar" | "floating-hero";
  photoBorderWidth?: number;
  photoShadow?: "none" | "subtle" | "elevated" | "glow";
}

export interface TemplateMetadata {
  id: ResumeTemplateId;
  name: string;
  category: TemplateCategory;
  categoryName: string;
  description: string;
  tags: string[];
  atsScore: number; // Estimated ATS pass index
  popular?: boolean;
  featured?: boolean;
  bestFor: string;
  accentColors: string[];
  layoutType: "single-column" | "two-column" | "hybrid-header" | "grid-timeline";
}

export interface ATSScoreBreakdown {
  overallScore: number;
  contactScore: number;
  summaryScore: number;
  experienceScore: number;
  educationScore: number;
  skillsScore: number;
  projectsScore: number;
  suggestions: {
    type: "critical" | "warning" | "success" | "tip";
    message: string;
    section?: string;
  }[];
}

export interface Resume {
  id: string;
  title: string;
  slug?: string;
  targetRole?: string;
  createdAt: string;
  updatedAt: string;
  personalInfo: PersonalInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languages?: LanguageItem[];
  interests?: InterestItem[];
  design: ResumeDesignSettings;
}

export type SectionType =
  | "personalInfo"
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "certifications"
  | "achievements";
