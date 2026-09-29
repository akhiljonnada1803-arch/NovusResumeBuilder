"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessConfirmation, setIsSuccessConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName || !email || !password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    const { error, confirmationRequired } = await signUpWithEmail(email, password, fullName);

    if (error) {
      setErrorMessage(error);
      setIsSubmitting(false);
    } else if (confirmationRequired) {
      setIsSuccessConfirmation(true);
      setIsSubmitting(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  if (isSuccessConfirmation) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card text-center space-y-3 shadow-2xs">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/40">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Verify your email</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>. Click the link to activate your account.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Return to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Create an Account
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Start crafting ATS-optimized resumes with AI in seconds.
        </p>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <Label required>Full Name</Label>
          <Input
            type="text"
            placeholder="e.g. Alex Rivera"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-3.5 h-3.5" />}
            autoComplete="name"
            required
          />
        </div>

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
          <Label required>Password</Label>
          <Input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-3.5 h-3.5" />}
            autoComplete="new-password"
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
              Creating Account...
            </>
          ) : (
            <>
              Create Free Account
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-1">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
