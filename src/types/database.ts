export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          job_title: string | null;
          avatar_url: string | null;
          plan: "Free" | "Pro" | "Enterprise";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          job_title?: string | null;
          avatar_url?: string | null;
          plan?: "Free" | "Pro" | "Enterprise";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          job_title?: string | null;
          avatar_url?: string | null;
          plan?: "Free" | "Pro" | "Enterprise";
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string | null;
          target_role: string | null;
          ats_score: number;
          personal_info: Json;
          design: Json;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          slug?: string | null;
          target_role?: string | null;
          ats_score?: number;
          personal_info?: Json;
          design?: Json;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          slug?: string | null;
          target_role?: string | null;
          ats_score?: number;
          personal_info?: Json;
          design?: Json;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      education: {
        Row: {
          id: string;
          resume_id: string;
          institution: string;
          degree: string;
          field_of_study: string;
          location: string | null;
          start_date: string;
          end_date: string | null;
          is_current: boolean;
          gpa: string | null;
          description: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          institution: string;
          degree: string;
          field_of_study: string;
          location?: string | null;
          start_date: string;
          end_date?: string | null;
          is_current?: boolean;
          gpa?: string | null;
          description?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          institution?: string;
          degree?: string;
          field_of_study?: string;
          location?: string | null;
          start_date?: string;
          end_date?: string | null;
          is_current?: boolean;
          gpa?: string | null;
          description?: string | null;
          order_index?: number;
          updated_at?: string;
        };
      };
      experience: {
        Row: {
          id: string;
          resume_id: string;
          company: string;
          position: string;
          location: string | null;
          start_date: string;
          end_date: string | null;
          is_current: boolean;
          description: string;
          highlights: string[];
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          company: string;
          position: string;
          location?: string | null;
          start_date: string;
          end_date?: string | null;
          is_current?: boolean;
          description?: string;
          highlights?: string[];
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          company?: string;
          position?: string;
          location?: string | null;
          start_date?: string;
          end_date?: string | null;
          is_current?: boolean;
          description?: string;
          highlights?: string[];
          order_index?: number;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          resume_id: string;
          title: string;
          subtitle: string | null;
          live_url: string | null;
          github_url: string | null;
          start_date: string | null;
          end_date: string | null;
          description: string;
          technologies: string[];
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          title: string;
          subtitle?: string | null;
          live_url?: string | null;
          github_url?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          description: string;
          technologies?: string[];
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          title?: string;
          subtitle?: string | null;
          live_url?: string | null;
          github_url?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          description?: string;
          technologies?: string[];
          order_index?: number;
          updated_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          resume_id: string;
          name: string;
          level: "Beginner" | "Intermediate" | "Advanced" | "Expert" | null;
          category: "Technical" | "Languages" | "Frameworks" | "Tools" | "Soft Skills" | "Other";
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          name: string;
          level?: "Beginner" | "Intermediate" | "Advanced" | "Expert" | null;
          category?: "Technical" | "Languages" | "Frameworks" | "Tools" | "Soft Skills" | "Other";
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          name?: string;
          level?: "Beginner" | "Intermediate" | "Advanced" | "Expert" | null;
          category?: "Technical" | "Languages" | "Frameworks" | "Tools" | "Soft Skills" | "Other";
          order_index?: number;
          updated_at?: string;
        };
      };
      certifications: {
        Row: {
          id: string;
          resume_id: string;
          name: string;
          issuer: string;
          issue_date: string;
          expiry_date: string | null;
          credential_id: string | null;
          credential_url: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          name: string;
          issuer: string;
          issue_date: string;
          expiry_date?: string | null;
          credential_id?: string | null;
          credential_url?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          name?: string;
          issuer?: string;
          issue_date?: string;
          expiry_date?: string | null;
          credential_id?: string | null;
          credential_url?: string | null;
          order_index?: number;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          resume_id: string;
          title: string;
          issuer: string | null;
          date: string | null;
          description: string;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          title: string;
          issuer?: string | null;
          date?: string | null;
          description: string;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          title?: string;
          issuer?: string | null;
          date?: string | null;
          description?: string;
          order_index?: number;
          updated_at?: string;
        };
      };
      resume_history: {
        Row: {
          id: string;
          resume_id: string;
          version_number: number;
          change_summary: string | null;
          snapshot_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          version_number?: number;
          change_summary?: string | null;
          snapshot_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          version_number?: number;
          change_summary?: string | null;
          snapshot_data?: Json;
        };
      };
    };
  };
}
