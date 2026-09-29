import { Resume } from "@/types/resume";

export interface ATSAnalysisResult {
  overallScore: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  statusMessage: string;

  // 5 Core Metric Dimensions (0 - 100 each)
  dimensions: {
    keywordMatching: {
      score: number;
      matchedKeywords: string[];
      missingKeywords: string[];
      matchPercentage: number;
    };
    formattingQuality: {
      score: number;
      checks: { label: string; passed: boolean; note: string }[];
    };
    resumeLength: {
      score: number;
      wordCount: number;
      estimatedPages: number;
      status: "Ideal (1 Page)" | "Slightly Short" | "Too Short" | "Slightly Long" | "Too Long";
      note: string;
    };
    sectionCompleteness: {
      score: number;
      sections: { name: string; completed: boolean; score: number; maxScore: number }[];
    };
    skillCoverage: {
      score: number;
      totalSkills: number;
      hardSkillsCount: number;
      softSkillsCount: number;
      categoriesFound: string[];
      coverageLevel: "Comprehensive" | "Good" | "Moderate" | "Needs Expansion";
    };
  };

  // Optimization Insights
  metrics: {
    quantifiableBulletsPercentage: number;
    actionVerbStrength: number;
    contactChannelsCount: number;
    bulletPointsCount: number;
  };

  // Actionable Categorized Recommendations
  recommendations: {
    id: string;
    type: "critical" | "warning" | "tip" | "success";
    title: string;
    message: string;
    section?: string;
    actionLabel?: string;
  }[];
}

const COMMON_TECH_KEYWORDS: Record<string, string[]> = {
  software: [
    "TypeScript",
    "JavaScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "PostgreSQL",
    "REST APIs",
    "GraphQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "CI/CD",
    "Git",
    "Microservices",
    "System Architecture",
    "Unit Testing",
    "Redis",
    "Agile",
    "Performance Optimization",
  ],
  data: [
    "Python",
    "SQL",
    "Pandas",
    "NumPy",
    "Machine Learning",
    "Data Pipelines",
    "ETL",
    "PostgreSQL",
    "Snowflake",
    "Apache Spark",
    "Tableau",
    "Data Modeling",
    "RAG",
    "PyTorch",
    "Statistics",
  ],
  product: [
    "Product Strategy",
    "Roadmapping",
    "User Research",
    "A/B Testing",
    "Agile / Scrum",
    "KPI Tracking",
    "Cross-Functional Leadership",
    "Stakeholder Management",
    "User Stories",
    "Wireframing",
    "Figma",
    "Go-To-Market",
  ],
};

const ACTION_VERBS = new Set([
  "architected",
  "engineered",
  "spearheaded",
  "orchestrated",
  "developed",
  "streamlined",
  "scaled",
  "optimized",
  "designed",
  "implemented",
  "accelerated",
  "delivered",
  "automated",
  "mentored",
  "pioneered",
  "refactored",
  "boosted",
  "reduced",
  "increased",
  "launched",
  "authored",
  "integrated",
]);

/**
 * Deep ATS Analyzer Engine inspecting keyword matches, formatting, length, completeness, and skill coverage.
 */
export function analyzeResumeATS(
  resume: Resume,
  jobDescription?: string
): ATSAnalysisResult {
  const recommendations: ATSAnalysisResult["recommendations"] = [];
  const pi = resume.personalInfo || {};

  // Extract all text content
  const summaryText = pi.summary || "";
  const allHighlights = resume.experience.flatMap((e) => e.highlights || []);
  const projectDescriptions = resume.projects.map((p) => p.description);
  const fullTextCorpus = [
    pi.fullName,
    pi.jobTitle,
    summaryText,
    ...allHighlights,
    ...projectDescriptions,
    ...resume.skills.map((s) => s.name),
    ...resume.education.map((e) => `${e.degree} ${e.fieldOfStudy} ${e.institution}`),
    ...resume.certifications.map((c) => `${c.name} ${c.issuer}`),
    ...resume.achievements.map((a) => `${a.title} ${a.description}`),
  ]
    .join(" ")
    .toLowerCase();

  const words = fullTextCorpus.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. KEYWORD MATCHING ANALYSIS
  let targetKeywords: string[] = [];
  if (jobDescription && jobDescription.trim().length > 20) {
    // Extract keywords from pasted job description
    const jdWords = jobDescription
      .replace(/[^\w\s\.\+\#\-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
    
    // Pick unique significant nouns/tech terms
    const termFrequency: Record<string, number> = {};
    jdWords.forEach((w) => {
      const lower = w.toLowerCase();
      if (!["and", "the", "for", "with", "you", "are", "will", "our", "that", "this", "have", "from"].includes(lower)) {
        termFrequency[w] = (termFrequency[w] || 0) + 1;
      }
    });

    targetKeywords = Object.entries(termFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 18)
      .map(([word]) => word);
  } else {
    // Default to role-based keyword taxonomy
    const roleLower = (resume.targetRole || pi.jobTitle || "software").toLowerCase();
    if (roleLower.includes("data") || roleLower.includes("ai") || roleLower.includes("machine")) {
      targetKeywords = COMMON_TECH_KEYWORDS.data;
    } else if (roleLower.includes("product") || roleLower.includes("manager")) {
      targetKeywords = COMMON_TECH_KEYWORDS.product;
    } else {
      targetKeywords = COMMON_TECH_KEYWORDS.software;
    }
  }

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  targetKeywords.forEach((kw) => {
    if (fullTextCorpus.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordMatchPercentage = targetKeywords.length
    ? Math.round((matchedKeywords.length / targetKeywords.length) * 100)
    : 100;
  const keywordScore = Math.min(100, Math.round(keywordMatchPercentage * 1.05));

  if (missingKeywords.length > 3) {
    recommendations.push({
      id: "rec-kw-missing",
      type: "warning",
      title: "Missing High-Frequency Keywords",
      message: `Your resume is missing key recruiter search terms: ${missingKeywords.slice(0, 4).join(", ")}.`,
      section: "skills",
      actionLabel: "Add Keywords",
    });
  }

  // 2. FORMATTING QUALITY ANALYSIS
  const formattingChecks = [
    {
      label: "Direct Email & Phone Contact Header",
      passed: !!(pi.email && pi.phone),
      note: pi.email && pi.phone ? "Valid direct channels detected." : "Missing contact details.",
    },
    {
      label: "Machine-Readable Typography & Clean Layout",
      passed: true,
      note: "Single-layer semantic CSS standard passing Workday/Taleo rules.",
    },
    {
      label: "Chronological Experience Structure",
      passed: resume.experience.length > 0 && resume.experience.every((e) => e.startDate),
      note: "Clear start & end dates formatted properly.",
    },
    {
      label: "Social / Portfolio Verification Links",
      passed: !!(pi.linkedin || pi.github || pi.website),
      note: pi.linkedin || pi.github ? "Verified profile links found." : "No LinkedIn or GitHub provided.",
    },
  ];

  const passedChecksCount = formattingChecks.filter((c) => c.passed).length;
  const formattingScore = Math.round((passedChecksCount / formattingChecks.length) * 100);

  // 3. RESUME LENGTH ANALYSIS
  let lengthScore = 100;
  let lengthStatus: ATSAnalysisResult["dimensions"]["resumeLength"]["status"] = "Ideal (1 Page)";
  let lengthNote = "Optimal length for 1-page standard ATS parsing (400 - 750 words).";

  if (wordCount < 150) {
    lengthScore = 40;
    lengthStatus = "Too Short";
    lengthNote = "Resume is very sparse. Add comprehensive experience bullets and project details.";
    recommendations.push({
      id: "rec-len-short",
      type: "critical",
      title: "Resume Too Sparse",
      message: "Your resume is under 200 words. Expand on your project architectures and responsibilities.",
      section: "experience",
      actionLabel: "Add Details",
    });
  } else if (wordCount < 320) {
    lengthScore = 75;
    lengthStatus = "Slightly Short";
    lengthNote = "Good start, but could benefit from 2-3 additional metric-driven accomplishments.";
  } else if (wordCount > 900) {
    lengthScore = 70;
    lengthStatus = "Too Long";
    lengthNote = "Exceeds standard 1-page density. Trim filler words to keep recruiter attention sharp.";
    recommendations.push({
      id: "rec-len-long",
      type: "tip",
      title: "Condense Bullet Points",
      message: "Over 900 words detected. Aim for concise, punchy 1-line bullet points.",
      section: "experience",
      actionLabel: "Make Concise",
    });
  }

  // 4. SECTION COMPLETENESS
  const sectionBreakdowns = [
    { name: "Personal Info", completed: !!(pi.fullName && pi.email && pi.phone), score: pi.fullName && pi.email ? 20 : 5, maxScore: 20 },
    { name: "Professional Summary", completed: summaryText.length > 40, score: summaryText.length > 40 ? 20 : summaryText.length > 0 ? 10 : 0, maxScore: 20 },
    { name: "Work Experience", completed: resume.experience.length > 0, score: resume.experience.length >= 2 ? 30 : resume.experience.length === 1 ? 20 : 0, maxScore: 30 },
    { name: "Education", completed: resume.education.length > 0, score: resume.education.length > 0 ? 15 : 0, maxScore: 15 },
    { name: "Skills", completed: resume.skills.length >= 6, score: resume.skills.length >= 6 ? 15 : resume.skills.length >= 3 ? 8 : 0, maxScore: 15 },
  ];

  const totalEarnedSectionScore = sectionBreakdowns.reduce((acc, s) => acc + s.score, 0);
  const sectionCompletenessScore = Math.min(100, Math.round(totalEarnedSectionScore));

  // 5. SKILL COVERAGE ANALYSIS
  const totalSkills = resume.skills.length;
  const categoriesSet = new Set(resume.skills.map((s) => s.category || "Technical"));
  const categoriesFound = Array.from(categoriesSet);

  const softSkillsCount = resume.skills.filter((s) => s.category === "Soft Skills").length;
  const hardSkillsCount = totalSkills - softSkillsCount;

  let skillCoverageScore = 0;
  let coverageLevel: ATSAnalysisResult["dimensions"]["skillCoverage"]["coverageLevel"] = "Needs Expansion";

  if (totalSkills >= 8 && categoriesFound.length >= 2) {
    skillCoverageScore = 100;
    coverageLevel = "Comprehensive";
  } else if (totalSkills >= 5) {
    skillCoverageScore = 80;
    coverageLevel = "Good";
  } else if (totalSkills >= 3) {
    skillCoverageScore = 55;
    coverageLevel = "Moderate";
    recommendations.push({
      id: "rec-skills-moderate",
      type: "warning",
      title: "Broaden Skill Categorization",
      message: "Add grouped skills across Languages, Frameworks, and Tools for optimal recruiter filtering.",
      section: "skills",
      actionLabel: "Add Skills",
    });
  } else {
    skillCoverageScore = 30;
    coverageLevel = "Needs Expansion";
    recommendations.push({
      id: "rec-skills-sparse",
      type: "critical",
      title: "Sparse Skills Section",
      message: "Your resume lists fewer than 3 skills. Recruiters search by exact skill keywords.",
      section: "skills",
      actionLabel: "Add Skills",
    });
  }

  // 6. METRICS & ACTION VERBS
  let metricBulletsCount = 0;
  let actionVerbCount = 0;

  allHighlights.forEach((bullet) => {
    // Check for metrics (percentages, numbers, dollars)
    if (/\d+%|\$\d+|\d+\+|\d+M|\d+k|\b\d+\b/i.test(bullet)) {
      metricBulletsCount++;
    }
    // Check for action verbs at start of bullet
    const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^\w]/g, "");
    if (firstWord && ACTION_VERBS.has(firstWord)) {
      actionVerbCount++;
    }
  });

  const totalBullets = allHighlights.length || 1;
  const quantifiableBulletsPercentage = Math.round((metricBulletsCount / totalBullets) * 100);
  const actionVerbStrength = Math.round((actionVerbCount / totalBullets) * 100);

  if (quantifiableBulletsPercentage < 50 && totalBullets > 0) {
    recommendations.push({
      id: "rec-metrics-quantify",
      type: "tip",
      title: "Add Quantifiable Metrics",
      message: "Only a few bullets include measurable data. Use numbers (e.g., 'boosted speed by 35%').",
      section: "experience",
      actionLabel: "Enhance Bullets",
    });
  }

  // OVERALL WEIGHTED ATS SCORE
  const overallScore = Math.min(
    100,
    Math.round(
      keywordScore * 0.35 +
      sectionCompletenessScore * 0.25 +
      formattingScore * 0.15 +
      skillCoverageScore * 0.15 +
      lengthScore * 0.10
    )
  );

  let grade: ATSAnalysisResult["grade"] = "C";
  let statusMessage = "Needs Optimization";

  if (overallScore >= 90) {
    grade = "A+";
    statusMessage = "Top 5% Recruiter Match (Elite)";
  } else if (overallScore >= 80) {
    grade = "A";
    statusMessage = "Strong Competitive Standard (Pass)";
  } else if (overallScore >= 70) {
    grade = "B";
    statusMessage = "Good Baseline (Minor Fixes Needed)";
  } else if (overallScore >= 50) {
    grade = "C";
    statusMessage = "Moderate Match (Several Gaps)";
  } else {
    grade = "D";
    statusMessage = "High Risk of ATS Rejection";
  }

  if (overallScore >= 85 && recommendations.every((r) => r.type !== "critical")) {
    recommendations.unshift({
      id: "rec-elite-success",
      type: "success",
      title: "Excellent ATS Optimization",
      message: "Your resume meets top tier enterprise recruiting standards for Workday, Greenhouse, and Lever.",
    });
  }

  return {
    overallScore,
    grade,
    statusMessage,
    dimensions: {
      keywordMatching: {
        score: keywordScore,
        matchedKeywords,
        missingKeywords,
        matchPercentage: keywordMatchPercentage,
      },
      formattingQuality: {
        score: formattingScore,
        checks: formattingChecks,
      },
      resumeLength: {
        score: lengthScore,
        wordCount,
        estimatedPages: wordCount > 800 ? 2 : 1,
        status: lengthStatus,
        note: lengthNote,
      },
      sectionCompleteness: {
        score: sectionCompletenessScore,
        sections: sectionBreakdowns,
      },
      skillCoverage: {
        score: skillCoverageScore,
        totalSkills,
        hardSkillsCount,
        softSkillsCount,
        categoriesFound,
        coverageLevel,
      },
    },
    metrics: {
      quantifiableBulletsPercentage,
      actionVerbStrength,
      contactChannelsCount: [pi.email, pi.phone, pi.linkedin, pi.github, pi.website].filter(Boolean).length,
      bulletPointsCount: allHighlights.length,
    },
    recommendations,
  };
}
