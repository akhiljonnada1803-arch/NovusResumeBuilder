import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportResumeToDocx } from '@/lib/docx-export';
import { Resume } from '@/types/resume';
import * as tauriBridge from '@/lib/desktop/tauri-bridge';

// Mock desktop save handler
vi.mock('@/lib/desktop/tauri-bridge', () => ({
  saveFileWithNativeFallback: vi.fn().mockResolvedValue(true),
  isTauriEnvironment: vi.fn().mockResolvedValue(false),
}));

const mockResume: Resume = {
  id: 'resume-docx-1',
  title: 'Full Stack Engineer',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  targetRole: 'Full Stack Engineer',
  personalInfo: {
    fullName: 'Jane Doe',
    jobTitle: 'Senior Full Stack Developer',
    email: 'jane.doe@example.com',
    phone: '+1 555 123 4567',
    location: 'New York, NY',
    summary: 'Senior developer with 8+ years building enterprise web apps.',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Acme Inc.',
      position: 'Staff Engineer',
      location: 'New York, NY',
      startDate: '2020-01',
      endDate: 'Present',
      current: true,
      description: 'Leading architecture of distributed micro-frontends.',
      highlights: ['Led architecture of distributed micro-frontends.', 'Reduced cloud costs by $120k annually.'],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Cornell University',
      degree: 'B.S.',
      fieldOfStudy: 'Computer Science',
      startDate: '2012-08',
      endDate: '2016-05',
      current: false,
    },
  ],
  skills: [
    { id: 's-1', name: 'TypeScript', level: 'Expert', category: 'Languages' },
    { id: 's-2', name: 'React', level: 'Expert', category: 'Frameworks' },
  ],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  interests: [],
  design: {
    template: 'executive',
    fontFamily: 'Inter',
    fontSize: 'base',
    spacing: 'normal',
    margins: 'normal',
    accentColor: '#0ea5e9',
    showIcons: true,
    showSectionDividers: true,
  },
};

describe('DOCX Export Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Polyfill FileReader for node/happy-dom if required
    if (typeof global.FileReader === 'undefined') {
      class MockFileReader {
        onloadend: (() => void) | null = null;
        result: string | ArrayBuffer | null = null;
        readAsDataURL(blob: any) {
          this.result = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQAAAAIA';
          setTimeout(() => {
            this.onloadend?.();
          }, 5);
        }
      }
      global.FileReader = MockFileReader as any;
    }
  });

  it('compiles docx structure and calls native save fallback with correct metadata', async () => {
    const progressUpdates: string[] = [];
    await exportResumeToDocx(mockResume, {
      filename: 'jane-doe-resume.docx',
      onProgress: (status) => progressUpdates.push(status),
    });

    // Give FileReader callback a tick to finish
    await new Promise((r) => setTimeout(r, 20));

    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates).toContain('Generating Word document structure...');
    expect(progressUpdates).toContain('Compiling docx binary...');
    expect(tauriBridge.saveFileWithNativeFallback).toHaveBeenCalled();
  });
});
