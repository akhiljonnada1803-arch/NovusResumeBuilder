"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Download,
  Eye,
  Layers,
  Wand2,
  FileCheck,
  Star,
  ChevronDown,
  Building,
  Check,
  Lock,
  Flame,
} from "lucide-react";
import { TEMPLATE_OPTIONS } from "@/lib/constants";

export default function MarketingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedTemplateTab, setSelectedTemplateTab] = useState("modern");
  const [faqOpen, setFaqOpen] = useState<{ [idx: number]: boolean }>({ 0: true, 1: true });

  const toggleFaq = (idx: number) => {
    setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-24 md:space-y-32 pb-24 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Background glow radiant */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-[100px] pointer-events-none -z-10 rounded-full" />

        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Novus AI 2.0 Engine Live • 98.4% ATS Pass Rate</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
            Build Job-Winning Resumes with{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Precision AI
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop getting filtered out by Applicant Tracking Systems. Craft recruiter-ready, metric-backed resumes in minutes with live previews and AI bullet optimization.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link href="/dashboard">
              <Button size="lg" variant="radiant" className="w-full sm:w-auto h-13 px-8 text-base shadow-xl gap-2">
                <Sparkles className="w-4 h-4" />
                Build My Resume Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <a href="#ats-scanner">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-13 px-6 text-base gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Explore ATS Scanner
              </Button>
            </a>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant PDF download
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% ATS Compliant
            </span>
          </div>
        </div>

        {/* Hero Interactive Preview Mockup */}
        <div className="mt-14 max-w-5xl mx-auto relative rounded-3xl p-2.5 sm:p-4 bg-gradient-to-b from-border/80 via-border/40 to-transparent border border-border shadow-2xl">
          <div className="rounded-2xl bg-card border border-border/80 p-4 sm:p-6 shadow-inner text-left grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left AI Editor snippet */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" /> AI Bullet Optimizer
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  +38% ATS Match
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/60 border border-border text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Original Draft:
                </span>
                <p className="text-muted-foreground line-through italic">
                  &ldquo;Worked on frontend components for web app.&rdquo;
                </p>
                <span className="text-[10px] font-bold uppercase text-indigo-500 block pt-1">
                  ✨ AI Enhanced with Metrics:
                </span>
                <p className="text-foreground font-semibold leading-relaxed">
                  &ldquo;Architected 14+ reusable React 19 design system components, reducing page load latency by 35% across 2M+ active monthly users.&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-card border border-border flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-muted-foreground">ATS Score</span>
                    <span className="font-black text-foreground">94 / 100</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-muted-foreground">Action Verbs</span>
                    <span className="font-black text-foreground">100% Strength</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Live Resume Snapshot */}
            <div className="lg:col-span-7 bg-white text-slate-900 rounded-xl p-5 sm:p-6 shadow-md border border-slate-200 space-y-3 font-sans">
              <div className="flex justify-between items-baseline border-b-2 border-indigo-600 pb-2">
                <div>
                  <h3 className="text-lg font-black text-slate-950">Alex Rivera</h3>
                  <p className="text-xs font-bold text-indigo-600">Senior Full-Stack & AI Engineer</p>
                </div>
                <span className="text-[10px] text-slate-500">San Francisco, CA • alex.dev</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-snug">
                High-velocity Software Engineer with 6+ years experience architecting distributed Next.js microservices and real-time LLM pipelines scaling to 2M+ users.
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span>Synthetix AI Systems — Staff Software Engineer</span>
                  <span className="text-slate-500">2022 – Present</span>
                </div>
                <ul className="list-disc ml-3 text-[10px] text-slate-700 space-y-0.5">
                  <li>Architected real-time RAG ingestion pipeline indexing 50M+ docs with sub-80ms semantic retrieval.</li>
                  <li>Spearheaded migration of legacy monolith to Next.js App Router, boosting lighthouse score by 35%.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Logos */}
        <div className="pt-16 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Trusted by candidates hired at top tech companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all">
            <span className="font-black text-sm tracking-tight text-foreground">GOOGLE</span>
            <span className="font-black text-sm tracking-tight text-foreground">STRIPE</span>
            <span className="font-black text-sm tracking-tight text-foreground">META</span>
            <span className="font-black text-sm tracking-tight text-foreground">OPENAI</span>
            <span className="font-black text-sm tracking-tight text-foreground">AMAZON</span>
            <span className="font-black text-sm tracking-tight text-foreground">VERCEL</span>
          </div>
        </div>
      </section>

      {/* 2. ATS SCANNER SHOWCASE */}
      <section id="ats-scanner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-background border border-primary/30 p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" /> Real-time ATS Intelligence
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                Never Let an Algorithm Reject You Again
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Over 75% of job applications are filtered out before a human recruiter even sees them. Novus AI performs real-time keyword analysis, quantifies your achievements, and formats your resume into an ATS-friendly layout.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Recruiter-Grade Keyword Parsing</h4>
                    <p className="text-xs text-muted-foreground">Scans technical competencies and ensures key terms match role postings.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Bullet Impact & Metrics Quantifier</h4>
                    <p className="text-xs text-muted-foreground">Automatically prompts for percentages, latency drops, and revenue numbers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Clean Machine-Readable Typography</h4>
                    <p className="text-xs text-muted-foreground">No unparseable tables or corrupted multi-column boxes.</p>
                  </div>
                </div>
              </div>

              <Link href="/dashboard">
                <Button variant="radiant" className="gap-2 mt-2">
                  Try ATS Scanner Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Right Gauge Preview */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-sm text-foreground">Live Compatibility Score</h3>
                </div>
                <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  96 / 100 (Pass)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Workday ATS Compatibility</span>
                  <span className="text-emerald-500 font-bold">100% Match</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Greenhouse Recruiter Parser</span>
                  <span className="text-emerald-500 font-bold">98% Match</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Lever Talent Cloud</span>
                  <span className="text-emerald-500 font-bold">95% Match</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero structural parsing errors. Ready for enterprise submissions.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY FEATURES GRID */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="radiant">Engineered for Results</Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Everything You Need to Land the Offer
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            A comprehensive suite of tools built to take you from a blank page to a finished interview-magnet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 hover:shadow-lg transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">AI Bullet Enhancer</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transform weak duty lists into punchy, metric-driven impact statements with 1-click suggestions.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 hover:shadow-lg transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Real-Time ATS Checker</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Continuous score inspection providing clear, actionable steps to boost your recruiter discoverability.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 hover:shadow-lg transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Instant Live Preview</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Side-by-side split screen updates instantaneously as you type every letter, skill, and credential.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 hover:shadow-lg transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Dynamic Section Arrays</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Effortlessly reorder, add, and customize Experience, Education, Projects, Certifications, and Awards.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 hover:shadow-lg transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Pixel-Perfect PDF Export</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Download clean, high-resolution A4 vector PDFs that render flawlessly on any screen or printer.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 hover:shadow-lg transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Auto-Save & Local Privacy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your resume state is safely persisted with Zustand and localStorage so you never lose a single edit.
            </p>
          </div>
        </div>
      </section>

      {/* 4. TEMPLATE GALLERY PREVIEW */}
      <section id="templates" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="radiant">Curated Layouts</Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Proven Templates Approved by Tech Recruiters
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Switch between templates with a single click while preserving all your content.
          </p>
        </div>

        {/* Template Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {TEMPLATE_OPTIONS.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => setSelectedTemplateTab(tmpl.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTemplateTab === tmpl.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tmpl.name}
            </button>
          ))}
        </div>

        {/* Showcase Banner */}
        <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-6 max-w-4xl mx-auto shadow-xl">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              {TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplateTab)?.name}
            </h3>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              {TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplateTab)?.description}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center">
            <Link href="/dashboard">
              <Button variant="radiant" className="gap-2">
                Use This Template Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="radiant">Transparent Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Simple, High-Value Plans
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Start for free, or unlock unlimited AI writing suggestions and advanced templates.
          </p>

          {/* Monthly / Annual switch */}
          <div className="inline-flex items-center gap-2 bg-secondary p-1 rounded-2xl border border-border mt-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === "monthly" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === "annual" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Annual Billing
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                Save 30%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Starter Free</h3>
              <p className="text-xs text-muted-foreground">For individuals building their first standard resume.</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-foreground">$0</span>
                <span className="text-xs text-muted-foreground">/ forever</span>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 1 Active Resume</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 2 Classic Templates</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Live Resume Preview</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Standard PDF Downloads</li>
              </ul>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Get Started Free</Button>
            </Link>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="relative p-6 sm:p-8 rounded-3xl border-2 border-primary bg-card shadow-2xl flex flex-col justify-between space-y-6">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-[11px] font-bold shadow-md flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Most Popular
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold text-foreground">Novus Pro</h3>
              <p className="text-xs text-muted-foreground">For ambitious job seekers wanting maximum interview callback rates.</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-foreground">
                  {billingCycle === "annual" ? "$12" : "$19"}
                </span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-foreground font-medium pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Unlimited AI Resumes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Unlimited AI Bullet Enhancer</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Full ATS Scanner & Keyword Match</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> All 5 Pro Templates & Custom Colors</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> High-Resolution Vector PDF Export</li>
              </ul>
            </div>
            <Link href="/dashboard">
              <Button variant="radiant" className="w-full shadow-lg">Start 7-Day Free Trial</Button>
            </Link>
          </div>

          {/* Enterprise / Lifetime Tier */}
          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Lifetime Access</h3>
              <p className="text-xs text-muted-foreground">One-time payment for lifetime updates and unlimited generations.</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-foreground">$99</span>
                <span className="text-xs text-muted-foreground">/ one-time</span>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Everything in Pro Plan</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Lifetime Updates Included</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Priority Support & Future Features</li>
              </ul>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Get Lifetime Access</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section id="faqs" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="radiant">Got Questions?</Badge>
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does Novus AI ensure my resume passes Applicant Tracking Systems (ATS)?",
              a: "Novus generates strict single-layer semantic layouts with optimal font encodings and keyword density. Our built-in ATS score analyzer checks for direct contact headers, role keywords, and quantifiable bullet points before you export.",
            },
            {
              q: "Can I download and export my resume as a PDF?",
              a: "Yes! You can instantly export pixel-perfect, printer-friendly A4 vector PDFs or use standard system print dialogs with zero formatting errors.",
            },
            {
              q: "Is my personal data private and secure?",
              a: "Absolutely. Your resume data is saved locally on your device in your browser's persistent storage, giving you full control and privacy over your professional information.",
            },
            {
              q: "Can I create multiple versions for different job applications?",
              a: "Yes! You can duplicate any resume with a single click and tailor the job title, skills, and summary for specific roles at different companies.",
            },
          ].map((faq, idx) => {
            const isOpen = !!faqOpen[idx];
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-foreground cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FINAL CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-8 sm:p-12 lg:p-16 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed">
            Join thousands of software engineers, product managers, and designers who upgraded their careers with Novus Resume AI.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="h-13 px-8 text-base font-bold bg-white text-slate-900 hover:bg-white/90 shadow-lg">
              Launch Resume Builder Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
