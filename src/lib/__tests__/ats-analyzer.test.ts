import { describe, it, expect } from 'vitest';
import { analyzeResumeATS } from '@/lib/ats-analyzer';
import { Resume } from '@/types/resume';

const mockResume: Resume = {
  id: 'test-resume-1',
  title: 'Test Software Engineer Resume',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  targetRole: 'Senior Full Stack Engineer',
  personalInfo: {
    fullName: 'Alex Morgan',
    jobTitle: 'Full Stack Software Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    summary: 'Experienced Full Stack Engineer with 6+ years specializing in TypeScript, React, Next.js, Node.js, and PostgreSQL.',
    website: 'https://alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'TechCorp Labs',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022-01',
      endDate: 'Present',
      current: true,
      description: 'Senior Software Engineer leading frontend and backend teams.',
      highlights: [
        'Architected high-throughput REST APIs handling 4.5M daily requests with Node.js and Redis.',
        'Spearheaded migration of legacy frontend to Next.js and TypeScript, reducing page load latency by 42%.',
        'Engineered automated CI/CD deployment pipelines improving release cycle velocity by 3x.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2016-08',
      endDate: '2020-05',
      current: false,
      gpa: '3.8',
    },
  ],
  skills: [
    { id: 's-1', name: 'TypeScript', level: 'Expert', category: 'Languages' },
    { id: 's-2', name: 'React', level: 'Expert', category: 'Frameworks' },
    { id: 's-3', name: 'Next.js', level: 'Advanced', category: 'Frameworks' },
    { id: 's-4', name: 'Node.js', level: 'Advanced', category: 'Technical' },
    { id: 's-5', name: 'PostgreSQL', level: 'Advanced', category: 'Technical' },
    { id: 's-6', name: 'GraphQL', level: 'Intermediate', category: 'Technical' },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Real-time Analytics Dashboard',
      description: 'Built distributed telemetry streaming dashboard using React, WebSockets and Go.',
      technologies: ['React', 'TypeScript', 'WebSockets'],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2023-04',
    },
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'Top Contributor Award',
      description: 'Recognized as engineer of the quarter for outstanding system availability.',
      date: '2024-01',
    },
  ],
  languages: [],
  interests: [],
  design: {
    template: 'modern',
    accentColor: '#0ea5e9',
    fontFamily: 'Inter',
    fontSize: 'base',
    spacing: 'normal',
    margins: 'normal',
    showIcons: true,
    showSectionDividers: true,
  },
};

describe('ATS Analyzer Engine', () => {
  it('computes realistic overall score and grade', () => {
    const analysis = analyzeResumeATS(mockResume);

    expect(analysis.overallScore).toBeGreaterThanOrEqual(50);
    expect(analysis.overallScore).toBeLessThanOrEqual(100);
    expect(['A+', 'A', 'B', 'C', 'D']).toContain(analysis.grade);
  });

  it('evaluates keyword matching against custom job descriptions', () => {
    const jd = 'Seeking a Senior Software Engineer with expertise in TypeScript, React, Next.js, and GraphQL to scale enterprise SaaS.';
    const analysis = analyzeResumeATS(mockResume, jd);

    expect(analysis.dimensions.keywordMatching.matchedKeywords.length).toBeGreaterThan(0);
    expect(analysis.dimensions.keywordMatching.matchPercentage).toBeGreaterThan(0);
  });

  it('calculates metrics for quantifiable bullet points and action verbs', () => {
    const analysis = analyzeResumeATS(mockResume);

    expect(analysis.metrics.bulletPointsCount).toBeGreaterThan(0);
    expect(analysis.metrics.quantifiableBulletsPercentage).toBeGreaterThan(0);
    expect(analysis.metrics.actionVerbStrength).toBeGreaterThan(0);
  });

  it('provides actionable recommendations for missing items', () => {
    const sparseResume: Resume = {
      ...mockResume,
      personalInfo: {
        ...mockResume.personalInfo,
        email: '',
        phone: '',
      },
      skills: [],
    };

    const analysis = analyzeResumeATS(sparseResume);
    expect(analysis.overallScore).toBeLessThan(mockResume.personalInfo.email ? 95 : 100);
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  });
});
