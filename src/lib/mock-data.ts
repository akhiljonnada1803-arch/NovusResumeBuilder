import { Resume, ATSScoreBreakdown } from "@/types/resume";
import { DEFAULT_DESIGN } from "./constants";

export const SAMPLE_RESUMES: Resume[] = [
  {
    id: "sample-resume-1",
    title: "Senior Full-Stack AI Engineer",
    targetRole: "Senior Software Engineer",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    personalInfo: {
      fullName: "Alex Rivera",
      jobTitle: "Senior Full-Stack & AI Engineer",
      email: "alex.rivera.dev@example.com",
      phone: "+1 (555) 389-4021",
      location: "San Francisco, CA",
      website: "https://alexrivera.dev",
      linkedin: "https://linkedin.com/in/alexrivera-ai",
      github: "https://github.com/alexrivera-dev",
      summary:
        "High-velocity Software Engineer with 6+ years of experience architecting distributed cloud applications, LLM pipelines, and modern web platforms. Proven track record of scaling Next.js and Microservices architectures to 2M+ active users while reducing latency by 42%.",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      showPhoto: true,
      photoShape: "circle",
      photoSize: "md",
    },
    experience: [
      {
        id: "exp-1",
        company: "Synthetix AI Systems",
        position: "Staff Software Engineer / Tech Lead",
        location: "San Francisco, CA",
        startDate: "2022-03",
        endDate: "",
        current: true,
        description:
          "Lead the core platform architecture team building generative AI workflows, agentic tool execution pipelines, and high-concurrency vector database search clusters.",
        highlights: [
          "Architected real-time RAG ingestion pipeline indexing 50M+ documents with sub-80ms semantic retrieval.",
          "Spearheaded migration of legacy monolith to Next.js App Router and Go microservices, boosting lighthouse performance by 35%.",
          "Mentored 8 senior engineers and established RFC design review standards across engineering organizations.",
        ],
      },
      {
        id: "exp-2",
        company: "Veloce Cloud Solutions",
        position: "Senior Frontend Engineer",
        location: "Austin, TX",
        startDate: "2019-06",
        endDate: "2022-02",
        current: false,
        description:
          "Engineered interactive developer portals and real-time observability dashboards for enterprise Kubernetes clusters.",
        highlights: [
          "Designed reusable design system component library adopted across 14 internal micro-frontend repositories.",
          "Cut bundle size by 48% and optimized client-side state caching using Zustand and React Query.",
          "Integrated automated end-to-end Cypress test suites with 94% coverage preventing major production regressions.",
        ],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science & Artificial Intelligence",
        location: "Berkeley, CA",
        startDate: "2015-08",
        endDate: "2019-05",
        current: false,
        gpa: "3.88 / 4.0",
        description: "Honors in Computer Systems, President of ACM Web Dev Club.",
      },
    ],
    projects: [
      {
        id: "proj-1",
        title: "OmniSearch AI - Multi-Modal Search Engine",
        subtitle: "Creator & Lead Maintainer",
        liveUrl: "https://omnisearch-ai.io",
        githubUrl: "https://github.com/alexrivera-dev/omnisearch",
        startDate: "2023-01",
        endDate: "2023-11",
        description:
          "Open-source multi-modal search engine combining CLIP vector embeddings, OCR text parsing, and hybrid BM25 ranking.",
        technologies: ["TypeScript", "Next.js", "Python", "FastAPI", "Pinecone", "Tailwind CSS"],
      },
      {
        id: "proj-2",
        title: "KubePulse - K8s Visual Monitor",
        subtitle: "Open Source Tool",
        liveUrl: "https://kubepulse.dev",
        githubUrl: "https://github.com/alexrivera-dev/kubepulse",
        startDate: "2021-04",
        endDate: "2022-01",
        description:
          "Real-time lightweight web dashboard visualizing pod topology, memory thresholds, and distributed tracing metrics.",
        technologies: ["React", "Go", "WebSockets", "Prometheus", "Docker"],
      },
    ],
    skills: [
      { id: "s-1", name: "TypeScript & JavaScript", level: "Expert", category: "Languages" },
      { id: "s-2", name: "Python", level: "Advanced", category: "Languages" },
      { id: "s-3", name: "Next.js 15 & React 19", level: "Expert", category: "Frameworks" },
      { id: "s-4", name: "Node.js & Express", level: "Advanced", category: "Frameworks" },
      { id: "s-5", name: "Tailwind CSS & Shadcn/UI", level: "Expert", category: "Frameworks" },
      { id: "s-6", name: "PostgreSQL & Prisma", level: "Advanced", category: "Technical" },
      { id: "s-7", name: "Redis & Pinecone Vector DB", level: "Advanced", category: "Technical" },
      { id: "s-8", name: "Docker, Kubernetes, AWS", level: "Intermediate", category: "Tools" },
      { id: "s-9", name: "System Architecture", level: "Expert", category: "Technical" },
      { id: "s-10", name: "LLMs, LangChain, RAG", level: "Advanced", category: "Technical" },
    ],
    certifications: [
      {
        id: "cert-1",
        name: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services",
        issueDate: "2023-04",
        credentialId: "AWS-SAA-8492041",
        credentialUrl: "https://aws.amazon.com/verification",
      },
      {
        id: "cert-2",
        name: "Deep Learning Specialization",
        issuer: "DeepLearning.AI / Coursera",
        issueDate: "2022-08",
      },
    ],
    achievements: [
      {
        id: "ach-1",
        title: "1st Place Winner - Global AI Hackathon 2023",
        issuer: "OpenAI & Microsoft Developers",
        date: "2023-10",
        description: "Built an automated medical triage assistant agent with 99.2% symptom extraction accuracy.",
      },
      {
        id: "ach-2",
        title: "Top 1% Open Source Contributor",
        issuer: "GitHub Stars Program",
        date: "2024-01",
        description: "Authored libraries with over 15,000 GitHub stars and 500k monthly npm downloads.",
      },
    ],
    design: DEFAULT_DESIGN,
  },
];

export function calculateATSScore(resume: Resume): ATSScoreBreakdown {
  const suggestions: ATSScoreBreakdown["suggestions"] = [];
  let contactScore = 0;
  let summaryScore = 0;
  let experienceScore = 0;
  let educationScore = 0;
  let skillsScore = 0;
  let projectsScore = 0;

  // 1. Contact Info check (15 pts max)
  const pi = resume.personalInfo;
  if (pi.fullName.trim()) contactScore += 3;
  if (pi.jobTitle.trim()) contactScore += 3;
  if (pi.email.includes("@")) contactScore += 3;
  if (pi.phone.trim()) contactScore += 2;
  if (pi.location.trim()) contactScore += 2;
  if (pi.linkedin?.trim() || pi.github?.trim()) contactScore += 2;

  if (!pi.phone.trim() || !pi.email.trim()) {
    suggestions.push({
      type: "critical",
      message: "Add direct contact details (valid email & phone number) so recruiters can reach you.",
      section: "personalInfo",
    });
  }
  if (!pi.linkedin?.trim() && !pi.github?.trim()) {
    suggestions.push({
      type: "tip",
      message: "Adding a LinkedIn or GitHub URL boosts recruiter confidence by over 40%.",
      section: "personalInfo",
    });
  }

  // 2. Summary check (15 pts max)
  const summaryWords = (pi.summary || "").trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords >= 30 && summaryWords <= 120) {
    summaryScore = 15;
  } else if (summaryWords > 0) {
    summaryScore = 8;
    if (summaryWords < 30) {
      suggestions.push({
        type: "warning",
        message: "Professional summary is brief. Aim for 40-80 words highlighting your core value proposition.",
        section: "summary",
      });
    }
  } else {
    suggestions.push({
      type: "critical",
      message: "Missing professional summary. An impactful 3-sentence summary hooks recruiters instantly.",
      section: "summary",
    });
  }

  // 3. Experience check (30 pts max)
  if (resume.experience.length > 0) {
    experienceScore += 10;
    const totalBullets = resume.experience.reduce((acc, exp) => acc + (exp.highlights?.length || 0), 0);
    if (totalBullets >= 4) {
      experienceScore += 15;
    } else {
      experienceScore += 5;
      suggestions.push({
        type: "warning",
        message: "Add at least 2-3 metric-driven bullet points for each work experience entry.",
        section: "experience",
      });
    }

    // Check for metrics (numbers or %)
    const allHighlights = resume.experience.flatMap((e) => e.highlights || []).join(" ");
    const hasMetrics = /\d+%|\$\d+|\d+\+|\d+M|\d+k/i.test(allHighlights);
    if (hasMetrics) {
      experienceScore += 5;
    } else {
      suggestions.push({
        type: "tip",
        message: "Quantify achievements using numbers, percentages, or revenue impact (e.g., 'reduced load time by 35%').",
        section: "experience",
      });
    }
  } else {
    suggestions.push({
      type: "critical",
      message: "Add at least one professional work experience or internship entry.",
      section: "experience",
    });
  }

  // 4. Education check (15 pts max)
  if (resume.education.length > 0) {
    educationScore = 15;
  } else {
    suggestions.push({
      type: "warning",
      message: "Add your educational background or degrees.",
      section: "education",
    });
  }

  // 5. Skills check (15 pts max)
  if (resume.skills.length >= 6) {
    skillsScore = 15;
  } else if (resume.skills.length >= 3) {
    skillsScore = 9;
    suggestions.push({
      type: "tip",
      message: "List at least 6-8 relevant technical and soft skills to pass ATS keyword match filters.",
      section: "skills",
    });
  } else {
    suggestions.push({
      type: "critical",
      message: "Your skills list is sparse. Add categorized core skills and technologies.",
      section: "skills",
    });
  }

  // 6. Projects & Certifications (10 pts max)
  if (resume.projects.length > 0 || resume.certifications.length > 0 || resume.achievements.length > 0) {
    projectsScore = 10;
  } else {
    suggestions.push({
      type: "tip",
      message: "Add portfolio projects or industry certifications to showcase hands-on credibility.",
      section: "projects",
    });
  }

  const overallScore = Math.min(100, contactScore + summaryScore + experienceScore + educationScore + skillsScore + projectsScore);

  if (overallScore >= 85) {
    suggestions.unshift({
      type: "success",
      message: "Outstanding ATS readiness! Your resume adheres to top recruitment parsing standards.",
    });
  }

  return {
    overallScore,
    contactScore,
    summaryScore,
    experienceScore,
    educationScore,
    skillsScore,
    projectsScore,
    suggestions,
  };
}
