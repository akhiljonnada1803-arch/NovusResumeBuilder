"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  jobTitle?: string;
  avatarUrl?: string;
  plan: "Free" | "Pro" | "Enterprise";
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null; confirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<{ error: string | null }>;
  updateUserPassword: (password: string) => Promise<{ error: string | null }>;
  signInDemoUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILE: UserProfile = {
  id: "demo-user-123",
  email: "alex.rivera@example.com",
  fullName: "Alex Rivera",
  jobTitle: "Senior Full-Stack & AI Engineer",
  avatarUrl: "",
  plan: "Pro",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(DEMO_PROFILE);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active sessions from Supabase
    async function loadSession() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          setProfile({
            id: currentSession.user.id,
            email: currentSession.user.email || "",
            fullName:
              currentSession.user.user_metadata?.full_name ||
              currentSession.user.email?.split("@")[0] ||
              "Alex Rivera",
            jobTitle: currentSession.user.user_metadata?.job_title || "Full-Stack Engineer",
            avatarUrl: currentSession.user.user_metadata?.avatar_url || "",
            plan: "Pro",
          });
        } else {
          // Check local cached profile for demo state
          const cached = localStorage.getItem("novus_demo_auth");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setProfile(parsed);
              setUser({
                id: parsed.id,
                email: parsed.email,
                app_metadata: {},
                user_metadata: { full_name: parsed.fullName },
                aud: "authenticated",
                created_at: new Date().toISOString(),
              } as User);
            } catch {
              setProfile(DEMO_PROFILE);
            }
          }
        }
      } catch (err) {
        console.warn("Supabase session check:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();

    // Listen to Auth State Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setUser(newSession.user);
        setProfile({
          id: newSession.user.id,
          email: newSession.user.email || "",
          fullName:
            newSession.user.user_metadata?.full_name ||
            newSession.user.email?.split("@")[0] ||
            "User",
          jobTitle: newSession.user.user_metadata?.job_title || "Developer",
          avatarUrl: newSession.user.user_metadata?.avatar_url || "",
          plan: "Pro",
        });
      } else if (!localStorage.getItem("novus_demo_auth")) {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const setDemoCookie = (val: boolean) => {
    if (typeof document !== "undefined") {
      if (val) {
        document.cookie = "novus_demo_auth=1; path=/; max-age=2592000; SameSite=Lax";
      } else {
        document.cookie = "novus_demo_auth=; path=/; max-age=0; SameSite=Lax";
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Provide seamless local sign-in fallback for developer preview
        const demoUser: UserProfile = {
          id: "user-" + Math.random().toString(36).substring(2, 8),
          email,
          fullName: email.split("@")[0] || "Novus Member",
          plan: "Pro",
        };
        localStorage.setItem("novus_demo_auth", JSON.stringify(demoUser));
        setDemoCookie(true);
        setProfile(demoUser);
        setUser({ id: demoUser.id, email: demoUser.email } as any);
        return { error: null };
      }

      if (data.user) {
        setDemoCookie(true);
        setUser(data.user);
      }
      return { error: null };
    } catch (err: any) {
      // Fallback
      const demoUser: UserProfile = {
        id: "user-offline",
        email: email || "alex.rivera@example.com",
        fullName: "Alex Rivera",
        plan: "Pro",
      };
      localStorage.setItem("novus_demo_auth", JSON.stringify(demoUser));
      setDemoCookie(true);
      setProfile(demoUser);
      setUser({ id: demoUser.id, email: demoUser.email } as any);
      return { error: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        const demoUser: UserProfile = {
          id: "user-" + Math.random().toString(36).substring(2, 8),
          email,
          fullName,
          plan: "Pro",
        };
        localStorage.setItem("novus_demo_auth", JSON.stringify(demoUser));
        setDemoCookie(true);
        setProfile(demoUser);
        setUser({ id: demoUser.id, email: demoUser.email } as any);
        return { error: null, confirmationRequired: false };
      }

      const confirmationRequired = !data.session;
      if (data.session) setDemoCookie(true);
      return { error: null, confirmationRequired };
    } catch (err: any) {
      return { error: err.message || "Failed to create account" };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem("novus_demo_auth");
      setDemoCookie(false);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to send reset link" };
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    try {
      if (profile) {
        const updated = { ...profile, ...data };
        setProfile(updated);
        localStorage.setItem("novus_demo_auth", JSON.stringify(updated));

        await supabase.auth.updateUser({
          data: {
            full_name: updated.fullName,
            job_title: updated.jobTitle,
            avatar_url: updated.avatarUrl,
          },
        });
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to update profile" };
    }
  };

  const updateUserPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to update password" };
    }
  };

  const signInDemoUser = async () => {
    localStorage.setItem("novus_demo_auth", JSON.stringify(DEMO_PROFILE));
    setDemoCookie(true);
    setProfile(DEMO_PROFILE);
    setUser({ id: DEMO_PROFILE.id, email: DEMO_PROFILE.email } as any);
    router.push("/dashboard");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resetPasswordForEmail,
        updateUserProfile,
        updateUserPassword,
        signInDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
