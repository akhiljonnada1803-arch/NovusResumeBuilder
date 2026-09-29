import { Resume, ResumeTemplateId } from "@/types/resume";

export interface ResumeHistoryItem {
  id: string;
  resume_id: string;
  version_number: number;
  change_summary: string;
  created_at: string;
}

export const ResumeApiService = {
  /**
   * Fetch all resumes for current user
   */
  async fetchResumes(): Promise<{ resumes: any[]; error?: string }> {
    try {
      const res = await fetch("/api/resumes");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { resumes: [], error: data.error || "Failed to fetch resumes" };
      }
      const data = await res.json();
      return { resumes: data.resumes || [] };
    } catch (err: any) {
      return { resumes: [], error: err.message };
    }
  },

  /**
   * Fetch single resume with full relational children
   */
  async fetchResumeById(id: string): Promise<{ resume: any | null; error?: string }> {
    try {
      const res = await fetch(`/api/resumes/${id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { resume: null, error: data.error || "Failed to load resume" };
      }
      const data = await res.json();
      return { resume: data.resume };
    } catch (err: any) {
      return { resume: null, error: err.message };
    }
  },

  /**
   * Create a new resume
   */
  async createResume(
    title: string,
    template: ResumeTemplateId = "modern",
    targetRole?: string
  ): Promise<{ resume: any | null; error?: string }> {
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, template, targetRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { resume: null, error: data.error || "Failed to create resume" };
      }
      const data = await res.json();
      return { resume: data.resume };
    } catch (err: any) {
      return { resume: null, error: err.message };
    }
  },

  /**
   * Auto-save or update resume and child sections
   */
  async saveResume(
    id: string,
    resumeData: Partial<Resume>,
    changeSummary: string = "Auto-save update"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...resumeData, changeSummary }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || "Failed to save resume" };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Delete resume
   */
  async deleteResume(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || "Failed to delete resume" };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Duplicate resume
   */
  async duplicateResume(id: string): Promise<{ duplicateResume: any | null; error?: string }> {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { duplicateResume: null, error: data.error || "Failed to duplicate resume" };
      }
      const data = await res.json();
      return { duplicateResume: data.duplicateResume };
    } catch (err: any) {
      return { duplicateResume: null, error: err.message };
    }
  },

  /**
   * Fetch version history snapshots
   */
  async fetchHistory(id: string): Promise<{ history: ResumeHistoryItem[]; error?: string }> {
    try {
      const res = await fetch(`/api/resumes/${id}/history`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { history: [], error: data.error || "Failed to fetch history" };
      }
      const data = await res.json();
      return { history: data.history || [] };
    } catch (err: any) {
      return { history: [], error: err.message };
    }
  },

  /**
   * Rollback to specific version snapshot
   */
  async rollbackHistory(
    id: string,
    historyId: string
  ): Promise<{ success: boolean; restoredSnapshot?: any; error?: string }> {
    try {
      const res = await fetch(`/api/resumes/${id}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historyId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || "Failed to restore version" };
      }
      const data = await res.json();
      return { success: true, restoredSnapshot: data.restoredSnapshot };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
