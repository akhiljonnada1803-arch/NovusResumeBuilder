import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(80, "Name is too long"),
  jobTitle: z.string().min(1, "Job title is required").max(100, "Job title is too long"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  github: z.string().optional().or(z.literal("")),
  summary: z.string().max(1500, "Summary cannot exceed 1500 characters").default(""),
});

export const educationItemSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "School or University name is required"),
  degree: z.string().min(1, "Degree is required (e.g. B.S., M.S.)"),
  fieldOfStudy: z.string().min(1, "Field of study is required (e.g. Computer Science)"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  gpa: z.string().optional(),
  description: z.string().optional(),
});

export const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Job title / Position is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  description: z.string().default(""),
  highlights: z.array(z.string()).default([]),
});

export const projectItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Project title is required"),
  subtitle: z.string().optional(),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  technologies: z.array(z.string()).default([]),
});

export const skillItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Skill name cannot be empty"),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
  category: z.enum(["Technical", "Languages", "Frameworks", "Tools", "Soft Skills", "Other"]).default("Technical"),
});

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuing organization is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const achievementItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Achievement title is required"),
  date: z.string().optional(),
  issuer: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

export const resumeDesignSchema = z.object({
  template: z.enum(["modern", "minimalist", "executive", "tech", "creative"]),
  accentColor: z.string(),
  fontFamily: z.enum(["Inter", "Roboto", "Merriweather", "Outfit", "Playfair Display"]),
  fontSize: z.enum(["sm", "base", "lg"]),
  spacing: z.enum(["compact", "normal", "spacious"]),
  showIcons: z.boolean(),
  showSectionDividers: z.boolean(),
});

export const fullResumeSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Resume name is required"),
  slug: z.string().optional(),
  targetRole: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  personalInfo: personalInfoSchema,
  education: z.array(educationItemSchema),
  experience: z.array(experienceItemSchema),
  projects: z.array(projectItemSchema),
  skills: z.array(skillItemSchema),
  certifications: z.array(certificationItemSchema),
  achievements: z.array(achievementItemSchema),
  design: resumeDesignSchema,
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type EducationFormData = z.infer<typeof educationItemSchema>;
export type ExperienceFormData = z.infer<typeof experienceItemSchema>;
export type ProjectFormData = z.infer<typeof projectItemSchema>;
export type SkillFormData = z.infer<typeof skillItemSchema>;
export type CertificationFormData = z.infer<typeof certificationItemSchema>;
export type AchievementFormData = z.infer<typeof achievementItemSchema>;
export type FullResumeFormData = z.infer<typeof fullResumeSchema>;
