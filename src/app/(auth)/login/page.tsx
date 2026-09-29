"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInDemoUser, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signInWithEmail(email, password);

    if (error) {
      setErrorMessage(error);
      setIsSubmitting(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    await signInDemoUser();
    window.location.href = "/dashboard";
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Enter your email credentials to access your workspace.
        </p>
      </div>

      {/* Demo Fast-Track Access Banner */}
      <div className="p-3 rounded-lg bg-secondary/50 border border-border/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
          <Zap className="w-3.5 h-3.5 text-foreground shrink-0" />
          <span>Testing preview?</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-6.5 text-[11px] font-medium shrink-0"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
        >
          Instant Demo Access
        </Button>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <Label required>Email Address</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-3.5 h-3.5" />}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label required>Password</Label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-3.5 h-3.5" />}
            autoComplete="current-password"
            required
          />
        </div>

        <Button
          type="submit"
          variant="radiant"
          className="w-full h-9 text-xs font-semibold shadow-2xs"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              Signing In...
            </>
          ) : (
            <>
              Sign In to Workspace
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-1">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-foreground font-medium hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}
