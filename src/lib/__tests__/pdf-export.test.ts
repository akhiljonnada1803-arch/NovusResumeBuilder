import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as tauriBridge from '@/lib/desktop/tauri-bridge';

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    width: 794,
    height: 1123,
  }),
}));

vi.mock('jspdf', () => {
  return {
    default: function MockJsPDF() {
      return {
        addImage: vi.fn(),
        addPage: vi.fn(),
        output: vi.fn().mockReturnValue('data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCg=='),
      };
    },
  };
});

vi.mock('@/lib/desktop/tauri-bridge', () => ({
  saveFileWithNativeFallback: vi.fn().mockResolvedValue(true),
  isTauriEnvironment: vi.fn().mockResolvedValue(false),
}));

describe('PDF Export Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders canvas and exports PDF with progress callbacks', async () => {
    const { exportResumeToPDF } = await import('@/lib/pdf-export');
    
    // Create mock DOM structure
    const parentContainer = document.createElement('div');
    parentContainer.style.transform = 'scale(0.8)';
    const resumeElement = document.createElement('div');
    resumeElement.innerHTML = '<h1>Alex Morgan - Resume</h1>';
    parentContainer.appendChild(resumeElement);
    document.body.appendChild(parentContainer);

    const progress: string[] = [];
    await exportResumeToPDF(resumeElement, {
      filename: 'alex-morgan-resume.pdf',
      onProgress: (p) => progress.push(p),
    });

    expect(progress).toContain('Preparing document...');
    expect(progress).toContain('Rendering high-res canvas...');
    expect(progress).toContain('Saving PDF...');
    expect(tauriBridge.saveFileWithNativeFallback).toHaveBeenCalled();

    // Clean up
    parentContainer.remove();
  });

  it('printResumeViaIframe generates iframe and triggers print in browser', async () => {
    const { printResumeViaIframe } = await import('@/lib/pdf-export');

    const resumeElement = document.createElement('div');
    resumeElement.innerHTML = '<h1>Printable Resume</h1>';
    document.body.appendChild(resumeElement);

    // Call print iframe
    printResumeViaIframe(resumeElement);

    const createdIframe = document.getElementById('novus-print-iframe');
    expect(createdIframe).not.toBeNull();

    // Clean up
    resumeElement.remove();
    createdIframe?.remove();
  });
});
