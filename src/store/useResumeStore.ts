import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Resume,
  PersonalInfo,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  SkillItem,
  CertificationItem,
  AchievementItem,
  ResumeDesignSettings,
  SectionType,
  ResumeTemplateId,
  ATSScoreBreakdown,
} from "@/types/resume";
import { SAMPLE_RESUMES, calculateATSScore } from "@/lib/mock-data";
import { DEFAULT_DESIGN } from "@/lib/constants";
import { generateId } from "@/lib/utils";

interface ResumeStoreState {
  resumes: Resume[];
  activeResumeId: string;
  activeSection: SectionType;
  zoomLevel: number;
  isAIEnhanceModalOpen: boolean;
  aiEnhanceTarget: {
    type: "experience" | "summary" | "project";
    id?: string;
    bulletIndex?: number;
    text: string;
  } | null;
  isATSModalOpen: boolean;

  // Selectors / Helpers
  getActiveResume: () => Resume;
  getATSScore: () => ATSScoreBreakdown;

  // UI Actions
  setActiveResumeId: (id: string) => void;
  setActiveSection: (section: SectionType) => void;
  setZoomLevel: (zoom: number) => void;
  openAIEnhancer: (target: ResumeStoreState["aiEnhanceTarget"]) => void;
  closeAIEnhancer: () => void;
  openATSModal: () => void;
  closeATSModal: () => void;

  // General Resume Management
  createNewResume: (title?: string, template?: ResumeTemplateId) => string;
  duplicateResume: (id: string) => string;
  deleteResume: (id: string) => void;
  updateResumeTitle: (title: string, targetRole?: string) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  resetToSampleData: () => void;
  importResume: (resume: Resume) => void;

  // Personal Info Actions
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;

  // Education Actions
  addEducation: (item?: Partial<EducationItem>) => void;
  updateEducation: (id: string, data: Partial<EducationItem>) => void;
  deleteEducation: (id: string) => void;
  reorderEducation: (fromIndex: number, toIndex: number) => void;

  // Experience Actions
  addExperience: (item?: Partial<ExperienceItem>) => void;
  updateExperience: (id: string, data: Partial<ExperienceItem>) => void;
  deleteExperience: (id: string) => void;
  reorderExperience: (fromIndex: number, toIndex: number) => void;
  addExperienceHighlight: (experienceId: string, highlight: string) => void;
  updateExperienceHighlight: (experienceId: string, index: number, highlight: string) => void;
  deleteExperienceHighlight: (experienceId: string, index: number) => void;

  // Projects Actions
  addProject: (item?: Partial<ProjectItem>) => void;
  updateProject: (id: string, data: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;

  // Skills Actions
  addSkill: (item?: Partial<SkillItem>) => void;
  updateSkill: (id: string, data: Partial<SkillItem>) => void;
  deleteSkill: (id: string) => void;
  quickAddSkills: (skillNames: string[], category?: SkillItem["category"]) => void;

  // Certifications Actions
  addCertification: (item?: Partial<CertificationItem>) => void;
  updateCertification: (id: string, data: Partial<CertificationItem>) => void;
  deleteCertification: (id: string) => void;

  // Achievements Actions
  addAchievement: (item?: Partial<AchievementItem>) => void;
  updateAchievement: (id: string, data: Partial<AchievementItem>) => void;
  deleteAchievement: (id: string) => void;

  // Design Actions
  updateDesign: (design: Partial<ResumeDesignSettings>) => void;
}

const emptyResumeFactory = (title = "Untitled Resume", template: ResumeTemplateId = "modern"): Resume => ({
  id: generateId(),
  title,
  targetRole: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
  design: {
    ...DEFAULT_DESIGN,
    template,
  },
});

export const useResumeStore = create<ResumeStoreState>()(
  persist(
    (set, get) => ({
      resumes: SAMPLE_RESUMES,
      activeResumeId: SAMPLE_RESUMES[0]?.id || "sample-resume-1",
      activeSection: "personalInfo",
      zoomLevel: 100,
      isAIEnhanceModalOpen: false,
      aiEnhanceTarget: null,
      isATSModalOpen: false,

      getActiveResume: () => {
        const { resumes, activeResumeId } = get();
        return resumes.find((r) => r.id === activeResumeId) || resumes[0] || emptyResumeFactory();
      },

      getATSScore: () => {
        const active = get().getActiveResume();
        return calculateATSScore(active);
      },

      setActiveResumeId: (id) => set({ activeResumeId: id }),
      setActiveSection: (section) => set({ activeSection: section }),
      setZoomLevel: (zoom) => set({ zoomLevel: Math.max(50, Math.min(150, Math.round(zoom <= 2 ? zoom * 100 : zoom))) }),

      openAIEnhancer: (target) => set({ isAIEnhanceModalOpen: true, aiEnhanceTarget: target }),
      closeAIEnhancer: () => set({ isAIEnhanceModalOpen: false, aiEnhanceTarget: null }),

      openATSModal: () => set({ isATSModalOpen: true }),
      closeATSModal: () => set({ isATSModalOpen: false }),

      createNewResume: (title = "My Resume", template = "modern") => {
        const newResume = emptyResumeFactory(title, template);
        set((state) => ({
          resumes: [newResume, ...state.resumes],
          activeResumeId: newResume.id,
          activeSection: "personalInfo",
        }));
        return newResume.id;
      },

      duplicateResume: (id) => {
        const target = get().resumes.find((r) => r.id === id);
        if (!target) return id;
        const duplicated: Resume = {
          ...JSON.parse(JSON.stringify(target)),
          id: generateId(),
          title: `${target.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          resumes: [duplicated, ...state.resumes],
          activeResumeId: duplicated.id,
        }));
        return duplicated.id;
      },

      deleteResume: (id) => {
        set((state) => {
          const filtered = state.resumes.filter((r) => r.id !== id);
          const nextActiveId = filtered[0]?.id || "";
          return {
            resumes: filtered.length > 0 ? filtered : [emptyResumeFactory("My First Resume")],
            activeResumeId: nextActiveId || (filtered[0]?.id ?? ""),
          };
        });
      },

      updateResumeTitle: (title, targetRole) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  title: title || r.title,
                  targetRole: targetRole !== undefined ? targetRole : r.targetRole,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      updateResume: (id, updates) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === id
              ? {
                  ...r,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      resetToSampleData: () => {
        set({
          resumes: SAMPLE_RESUMES,
          activeResumeId: SAMPLE_RESUMES[0].id,
          activeSection: "personalInfo",
        });
      },

      importResume: (resume) => {
        set((state) => ({
          resumes: [resume, ...state.resumes],
          activeResumeId: resume.id,
        }));
      },

      updatePersonalInfo: (data) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  personalInfo: { ...r.personalInfo, ...data },
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      addEducation: (item) => {
        const newItem: EducationItem = {
          id: generateId(),
          institution: item?.institution || "",
          degree: item?.degree || "",
          fieldOfStudy: item?.fieldOfStudy || "",
          location: item?.location || "",
          startDate: item?.startDate || "",
          endDate: item?.endDate || "",
          current: item?.current || false,
          gpa: item?.gpa || "",
          description: item?.description || "",
        };
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  education: [...r.education, newItem],
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      updateEducation: (id, data) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  education: r.education.map((edu) => (edu.id === id ? { ...edu, ...data } : edu)),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      deleteEducation: (id) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  education: r.education.filter((edu) => edu.id !== id),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      reorderEducation: (fromIndex, toIndex) => {
        set((state) => ({
          resumes: state.resumes.map((r) => {
            if (r.id !== state.activeResumeId) return r;
            const updated = [...r.education];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            return { ...r, education: updated, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      addExperience: (item) => {
        const newItem: ExperienceItem = {
          id: generateId(),
          company: item?.company || "",
          position: item?.position || "",
          location: item?.location || "",
          startDate: item?.startDate || "",
          endDate: item?.endDate || "",
          current: item?.current || false,
          description: item?.description || "",
          highlights: item?.highlights || [
            "Spearheaded key initiatives driving 25% increase in team delivery velocity.",
          ],
        };
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  experience: [...r.experience, newItem],
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      updateExperience: (id, data) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  experience: r.experience.map((exp) => (exp.id === id ? { ...exp, ...data } : exp)),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      deleteExperience: (id) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  experience: r.experience.filter((exp) => exp.id !== id),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      reorderExperience: (fromIndex, toIndex) => {
        set((state) => ({
          resumes: state.resumes.map((r) => {
            if (r.id !== state.activeResumeId) return r;
            const updated = [...r.experience];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            return { ...r, experience: updated, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      addExperienceHighlight: (experienceId, highlight) => {
        set((state) => ({
          resumes: state.resumes.map((r) => {
            if (r.id !== state.activeResumeId) return r;
            return {
              ...r,
              experience: r.experience.map((exp) =>
                exp.id === experienceId ? { ...exp, highlights: [...exp.highlights, highlight] } : exp
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      updateExperienceHighlight: (experienceId, index, highlight) => {
        set((state) => ({
          resumes: state.resumes.map((r) => {
            if (r.id !== state.activeResumeId) return r;
            return {
              ...r,
              experience: r.experience.map((exp) => {
                if (exp.id !== experienceId) return exp;
                const next = [...exp.highlights];
                next[index] = highlight;
                return { ...exp, highlights: next };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      deleteExperienceHighlight: (experienceId, index) => {
        set((state) => ({
          resumes: state.resumes.map((r) => {
            if (r.id !== state.activeResumeId) return r;
            return {
              ...r,
              experience: r.experience.map((exp) => {
                if (exp.id !== experienceId) return exp;
                const next = exp.highlights.filter((_, i) => i !== index);
                return { ...exp, highlights: next };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      addProject: (item) => {
        const newItem: ProjectItem = {
          id: generateId(),
          title: item?.title || "",
          subtitle: item?.subtitle || "",
          liveUrl: item?.liveUrl || "",
          githubUrl: item?.githubUrl || "",
          startDate: item?.startDate || "",
          endDate: item?.endDate || "",
          description: item?.description || "",
          technologies: item?.technologies || ["TypeScript", "Next.js", "Tailwind CSS"],
        };
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  projects: [...r.projects, newItem],
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      updateProject: (id, data) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  projects: r.projects.map((proj) => (proj.id === id ? { ...proj, ...data } : proj)),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  projects: r.projects.filter((proj) => proj.id !== id),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      reorderProjects: (fromIndex, toIndex) => {
        set((state) => ({
          resumes: state.resumes.map((r) => {
            if (r.id !== state.activeResumeId) return r;
            const updated = [...r.projects];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            return { ...r, projects: updated, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      addSkill: (item) => {
        const newItem: SkillItem = {
          id: generateId(),
          name: item?.name || "",
          level: item?.level || "Advanced",
          category: item?.category || "Technical",
        };
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  skills: [...r.skills, newItem],
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      updateSkill: (id, data) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  skills: r.skills.map((s) => (s.id === id ? { ...s, ...data } : s)),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      deleteSkill: (id) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  skills: r.skills.filter((s) => s.id !== id),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      quickAddSkills: (skillNames, category = "Technical") => {
        const newSkills: SkillItem[] = skillNames
          .filter((name) => name.trim().length > 0)
          .map((name) => ({
            id: generateId(),
            name: name.trim(),
            level: "Advanced",
            category,
          }));

        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  skills: [...r.skills, ...newSkills],
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      addCertification: (item) => {
        const newItem: CertificationItem = {
          id: generateId(),
          name: item?.name || "",
          issuer: item?.issuer || "",
          issueDate: item?.issueDate || "",
          expiryDate: item?.expiryDate || "",
          credentialId: item?.credentialId || "",
          credentialUrl: item?.credentialUrl || "",
        };
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  certifications: [...r.certifications, newItem],
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      updateCertification: (id, data) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  certifications: r.certifications.map((c) => (c.id === id ? { ...c, ...data } : c)),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      deleteCertification: (id) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  certifications: r.certifications.filter((c) => c.id !== id),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      addAchievement: (item) => {
        const newItem: AchievementItem = {
          id: generateId(),
          title: item?.title || "",
          date: item?.date || "",
          issuer: item?.issuer || "",
          description: item?.description || "",
        };
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  achievements: [...r.achievements, newItem],
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      updateAchievement: (id, data) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  achievements: r.achievements.map((a) => (a.id === id ? { ...a, ...data } : a)),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      deleteAchievement: (id) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  achievements: r.achievements.filter((a) => a.id !== id),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      updateDesign: (design) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  design: { ...r.design, ...design },
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },
    }),
    {
      name: "novus-resume-storage-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        resumes: state.resumes,
        activeResumeId: state.activeResumeId,
      }),
    }
  )
);
