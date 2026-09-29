"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Check } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Left Form Panel */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative z-10 bg-card border-r border-border">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs shadow-2xs">
              N
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">
              Novus<span className="text-muted-foreground font-normal">Resume</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="my-auto py-8 max-w-sm w-full mx-auto">{children}</div>

        <div className="text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Novus Resume AI. Enterprise-grade security.
        </div>
      </div>

      {/* Right Brand Showcase Panel */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-secondary/40 text-foreground p-12 flex-col justify-between relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>ATS Recruiter Compliance Benchmark</span>
        </div>

        <div className="max-w-md space-y-5 z-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
            The intelligent resume builder for modern engineering & design.
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Craft high-converting, ATS-compliant resumes with real-time AI bullet enhancement, live A4 vector previews, and multi-template exports.
          </p>

          <div className="space-y-2.5 pt-2 text-xs">
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Real-time ATS keyword matching and parsing scores</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>AI bullet point enhancer with quantifiable business impact</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Pixel-perfect A4 vector PDF exports</span>
            </div>
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="p-4 rounded-xl bg-card border border-border max-w-md z-10 shadow-2xs">
          <p className="text-xs text-foreground italic leading-relaxed">
            &ldquo;Novus AI boosted my resume score from 58% to 96%. I received 4 interview callbacks within a single week from top tech teams.&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded-md bg-secondary text-foreground font-semibold text-[10px] flex items-center justify-center border border-border/80">
              SM
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Sarah Miller</p>
              <p className="text-[10px] text-muted-foreground">Product Engineer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
