import { describe, it, expect } from "vitest";
import { validateExtractedResume } from "@/lib/import/validator";
import type { Resume } from "@/types/resume";

// Minimal resume fixture factory
const makeResume = (overrides: Partial<Resume> = {}): Resume =>
  ({
    id: "test-1",
    title: "Test Resume",
    targetRole: "Engineer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personalInfo: {
      fullName: "Jane Doe",
      jobTitle: "Software Engineer",
      email: "jane@example.com",
      phone: "+1-555-000-0001",
      location: "Austin, TX",
      website: "",
      linkedin: "",
      github: "",
      summary: "Experienced engineer with 5 years in full-stack development.",
    },
    experience: [
      {
        id: "e1",
        company: "Acme Corp",
        position: "Software Engineer",
        location: "Austin, TX",
        startDate: "2020-01",
        endDate: "",
        current: true,
        description: "Built scalable APIs.",
        highlights: ["Reduced latency by 40%"],
        orderIndex: 0,
      },
    ],
    education: [
      {
        id: "ed1",
        institution: "UT Austin",
        degree: "B.S.",
        fieldOfStudy: "Computer Science",
        location: "Austin, TX",
        startDate: "2016-09",
        endDate: "2020-05",
        gpa: "3.8",
        description: "",
        orderIndex: 0,
      },
    ],
    skills: [{ id: "s1", name: "TypeScript", level: "Expert", category: "Languages", orderIndex: 0 }],
    projects: [],
    certifications: [],
    achievements: [],
    design: {} as Resume["design"],
    sectionOrder: [],
    hiddenSections: [],
    atsScore: null,
    ...overrides,
  } as unknown as Resume);

const FULL_TEXT =
  "Jane Doe\njane@example.com\n+1-555-000-0001\nAustin, TX\nAcme Corp\nUT Austin\nTypeScript";

describe("validateExtractedResume", () => {
  it("returns high overall confidence for a complete resume", () => {
    const result = validateExtractedResume(makeResume(), FULL_TEXT, "test.pdf");
    // Overall confidence is a weighted average across sections — expect >= 70 for a full resume
    expect(result.confidenceScores.overall).toBeGreaterThanOrEqual(70);
  });

  it("penalises missing email in personalInfo fieldMeta", () => {
    const resume = makeResume({
      personalInfo: { ...makeResume().personalInfo, email: "" },
    });
    const result = validateExtractedResume(resume, FULL_TEXT, "test.pdf");
    const piMeta = result.fieldMeta.personalInfo;
    expect(piMeta.confidence).toBeLessThan(95);
    const hasEmailWarning = result.uncertainFields.some((f) => f.field === "email");
    expect(hasEmailWarning).toBe(true);
  });

  it("penalises missing full name", () => {
    const resume = makeResume({
      personalInfo: { ...makeResume().personalInfo, fullName: "" },
    });
    const result = validateExtractedResume(resume, FULL_TEXT, "test.pdf");
    const piMeta = result.fieldMeta.personalInfo;
    expect(piMeta.confidence).toBeLessThan(85);
    const hasNameWarning = result.uncertainFields.some((f) => f.field === "fullName");
    expect(hasNameWarning).toBe(true);
  });

  it("penalises empty experience section", () => {
    const resume = makeResume({ experience: [] });
    const result = validateExtractedResume(resume, FULL_TEXT, "test.pdf");
    expect(result.fieldMeta.experience.confidence).toBeLessThanOrEqual(50);
  });

  it("lowers overall confidence on empty text + no experience", () => {
    const resume = makeResume({ experience: [] });
    const result = validateExtractedResume(resume, "", "empty.pdf");
    expect(result.confidenceScores.overall).toBeLessThan(85);
  });

  it("personalInfo confidence is clamped to minimum 10", () => {
    const resume = makeResume({
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
    });
    const result = validateExtractedResume(resume, "", "blank.pdf");
    expect(result.fieldMeta.personalInfo.confidence).toBeGreaterThanOrEqual(10);
  });

  it("returns success: true for any valid call", () => {
    const result = validateExtractedResume(makeResume(), FULL_TEXT, "test.pdf");
    expect(result.success).toBe(true);
  });

  it("includes source file name in result", () => {
    const result = validateExtractedResume(makeResume(), FULL_TEXT, "myresume.pdf");
    expect(result.fileName).toBe("myresume.pdf");
  });
});
