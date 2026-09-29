import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CoverLetter, CoverLetterArchetype, CoverLetterTone } from "@/types/cover-letter";

const SAMPLE_COVER_LETTER: CoverLetter = {
  id: "cl-sample-1",
  title: "Senior Full-Stack Engineer – Anthropic",
  targetRole: "Senior Full-Stack & AI Engineer",
  companyName: "Anthropic",
  hiringManager: "Engineering Hiring Team",
  jobDescription: "Building scalable distributed systems and generative AI tooling.",
  archetype: "software-engineer",
  tone: "professional",
  senderName: "Alex Rivera",
  senderTitle: "Senior Full-Stack & AI Systems Engineer",
  senderEmail: "alex.rivera.dev@example.com",
  senderPhone: "+1 (555) 389-4021",
  senderLocation: "San Francisco, CA",
  recipientName: "Engineering Hiring Team",
  recipientTitle: "Talent Acquisition",
  recipientCompany: "Anthropic",
  recipientLocation: "San Francisco, CA",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  content: `Dear Engineering Hiring Team,

I am writing to express my strong interest in the Senior Full-Stack & AI Systems Engineer role at Anthropic. Having architected and scaled generative AI pipelines and distributed cloud architectures to over 2 million active users at Synthetix AI Systems, I have closely followed Anthropic's leadership in reliable, frontier AI development and would be thrilled to bring my technical expertise to your engineering organization.

Throughout my 6+ years of engineering experience, I have specialized in bridging high-performance distributed backends with responsive, modern web platforms. At Synthetix AI, I led the core platform architecture team in developing real-time RAG ingestion pipelines capable of indexing 50M+ documents with sub-80ms semantic retrieval. Additionally, I spearheaded the migration of our core platform to Next.js App Router and Go microservices, accelerating lighthouse performance by 35% and dramatically reducing infrastructure latency.

My hands-on experience designing high-concurrency vector database search clusters and modular TypeScript/React applications directly aligns with Anthropic's mission to build scalable, intuitive interfaces for frontier models. I pride myself on establishing rigorous engineering standards, automated testing workflows, and mentoring cross-functional engineers to deliver mission-critical platforms with velocity and reliability.

I would welcome the opportunity to discuss how my distributed systems background and passion for generative AI tools can contribute to Anthropic's ongoing initiatives. Thank you for your time and consideration.

Sincerely,

Alex Rivera`,
  versions: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface CoverLetterStoreState {
  coverLetters: CoverLetter[];
  activeCoverLetterId: string;

  // Selectors
  getActiveCoverLetter: () => CoverLetter;

  // Actions
  setActiveCoverLetterId: (id: string) => void;
  createNewCoverLetter: (data?: Partial<CoverLetter>) => string;
  updateCoverLetter: (id: string, data: Partial<CoverLetter>) => void;
  deleteCoverLetter: (id: string) => void;
  saveVersionSnapshot: (id: string) => void;
  restoreVersion: (coverLetterId: string, versionId: string) => void;
}

export const useCoverLetterStore = create<CoverLetterStoreState>()(
  persist(
    (set, get) => ({
      coverLetters: [SAMPLE_COVER_LETTER],
      activeCoverLetterId: SAMPLE_COVER_LETTER.id,

      getActiveCoverLetter: () => {
        const { coverLetters, activeCoverLetterId } = get();
        return coverLetters.find((cl) => cl.id === activeCoverLetterId) || coverLetters[0] || SAMPLE_COVER_LETTER;
      },

      setActiveCoverLetterId: (id: string) => set({ activeCoverLetterId: id }),

      createNewCoverLetter: (data) => {
        const newId = `cl-${Date.now()}`;
        const newCoverLetter: CoverLetter = {
          id: newId,
          title: data?.title || "New Cover Letter",
          targetRole: data?.targetRole || "Software Engineer",
          companyName: data?.companyName || "Target Company",
          hiringManager: data?.hiringManager || "Hiring Team",
          jobDescription: data?.jobDescription || "",
          resumeId: data?.resumeId,
          archetype: data?.archetype || "software-engineer",
          tone: data?.tone || "professional",
          senderName: data?.senderName || "Your Name",
          senderTitle: data?.senderTitle || "Professional Title",
          senderEmail: data?.senderEmail || "your.email@example.com",
          senderPhone: data?.senderPhone || "",
          senderLocation: data?.senderLocation || "San Francisco, CA",
          recipientName: data?.recipientName || "Hiring Manager",
          recipientTitle: data?.recipientTitle || "Hiring Team",
          recipientCompany: data?.companyName || "Company Name",
          recipientLocation: data?.recipientLocation || "Location",
          date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          content: data?.content || `Dear Hiring Team,\n\nI am writing to express my enthusiastic interest in the ${data?.targetRole || "Software Engineer"} position at ${data?.companyName || "your company"}.\n\nSincerely,\n${data?.senderName || "Your Name"}`,
          versions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          coverLetters: [newCoverLetter, ...state.coverLetters],
          activeCoverLetterId: newId,
        }));

        return newId;
      },

      updateCoverLetter: (id, data) =>
        set((state) => ({
          coverLetters: state.coverLetters.map((cl) =>
            cl.id === id ? { ...cl, ...data, updatedAt: new Date().toISOString() } : cl
          ),
        })),

      deleteCoverLetter: (id) =>
        set((state) => {
          const remaining = state.coverLetters.filter((cl) => cl.id !== id);
          return {
            coverLetters: remaining,
            activeCoverLetterId: remaining.length > 0 ? remaining[0].id : "",
          };
        }),

      saveVersionSnapshot: (id) =>
        set((state) => ({
          coverLetters: state.coverLetters.map((cl) => {
            if (cl.id !== id) return cl;
            const newVersion = {
              id: `v-${Date.now()}`,
              savedAt: new Date().toISOString(),
              tone: cl.tone,
              archetype: cl.archetype,
              content: cl.content,
              wordCount: cl.content.split(/\s+/).filter(Boolean).length,
            };
            return {
              ...cl,
              versions: [newVersion, ...cl.versions.slice(0, 9)], // Keep up to 10 snapshots
            };
          }),
        })),

      restoreVersion: (coverLetterId, versionId) =>
        set((state) => ({
          coverLetters: state.coverLetters.map((cl) => {
            if (cl.id !== coverLetterId) return cl;
            const targetVersion = cl.versions.find((v) => v.id === versionId);
            if (!targetVersion) return cl;
            return {
              ...cl,
              content: targetVersion.content,
              tone: targetVersion.tone,
              archetype: targetVersion.archetype,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),
    }),
    {
      name: "novus_cover_letters_store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
