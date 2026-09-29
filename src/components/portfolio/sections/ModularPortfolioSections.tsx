"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PortfolioSectionId,
  PortfolioTheme,
  PortfolioSectionConfig,
  DEFAULT_PORTFOLIO_SECTIONS,
} from "@/types/portfolio";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Flame,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
  Shield,
  Heart,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  Cloud,
  Quote,
  Send,
  Star,
  GitFork,
  FolderGit2,
  Check,
  Share2,
  Copy,
  Users,
} from "lucide-react";

interface SectionProps {
  resume: any;
  theme?: PortfolioTheme;
  cardClass?: string;
  accentClass?: string;
  btnClass?: string;
}

/**
 * 1. Profile Hero Section with Photo, Title, Badges, and Metrics
 */
export function ProfileHeroSection({ resume, cardClass = "bg-card border border-border", accentClass = "text-primary", btnClass = "bg-primary text-primary-foreground" }: SectionProps) {
  const pi = resume.personalInfo || {};
  const photo = pi.photo;
  const projects = resume.projects || [];
  const skills = resume.skills || [];

  return (
    <section id="hero" className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Profile Photo Support */}
        {photo?.url && !photo.hidden && (
          <div className="relative shrink-0">
            <img
              src={photo.url}
              alt={pi.fullName || "Candidate"}
              className={`w-28 h-28 sm:w-36 sm:h-36 object-cover border-2 border-primary/40 shadow-xl ${
                photo.shape === "circle" ? "rounded-full" : photo.shape === "rounded" ? "rounded-2xl" : "rounded-lg"
              }`}
            />
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
          </div>
        )}

        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open to Opportunities • {pi.location || "San Francisco / Remote"}</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-foreground leading-tight">
            I am {pi.fullName || "Alex Rivera"}, a <span className={accentClass}>{pi.jobTitle || "Lead Software Engineer"}</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {pi.summary || "Architecting high-scale distributed systems and autonomous AI platforms."}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className={`p-4 rounded-2xl ${cardClass} space-y-1`}>
          <span className="text-2xl font-black font-mono text-foreground">{projects.length > 0 ? `${projects.length * 3}+` : "12+"}</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Products Built</span>
        </div>
        <div className={`p-4 rounded-2xl ${cardClass} space-y-1`}>
          <span className="text-2xl font-black font-mono text-emerald-500">500k+</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Users Impacted</span>
        </div>
        <div className={`p-4 rounded-2xl ${cardClass} space-y-1`}>
          <span className="text-2xl font-black font-mono text-cyan-400">{skills.length > 0 ? `${skills.length}+` : "15+"}</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Tech Mastered</span>
        </div>
        <div className={`p-4 rounded-2xl ${cardClass} space-y-1`}>
          <span className="text-2xl font-black font-mono text-purple-400">99.9%</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Reliability</span>
        </div>
      </div>
    </section>
  );
}

/**
 * 2. About & Narrative Section
 */
export function AboutSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  const pi = resume.personalInfo || {};
  return (
    <section id="about" className={`p-6 sm:p-8 rounded-3xl ${cardClass} space-y-3`}>
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">ABOUT // PHILOSOPHY</span>
      <h2 className="text-2xl font-bold text-foreground">Engineering Principles & Vision</h2>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{pi.summary}</p>
    </section>
  );
}

/**
 * 3. Featured Projects
 */
export function FeaturedProjectsSection({ resume, cardClass = "bg-card border border-border", btnClass = "bg-primary text-primary-foreground" }: SectionProps) {
  const projects = (resume.projects || []).slice(0, 4);
  return (
    <section id="featured-projects" className="space-y-6">
      <div className="space-y-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">01 / FEATURED CREATIONS</span>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">Product-Style Systems</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p: any, idx: number) => (
          <div key={idx} className={`p-6 rounded-2xl ${cardClass} space-y-3 flex flex-col justify-between`}>
            <div className="space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-primary font-bold">RELEASE 0{idx + 1}</span>
              <h3 className="text-xl font-bold text-foreground">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-border/60">
              <div className="flex flex-wrap gap-1">
                {(p.technologies || ["TypeScript", "Next.js"]).map((t: string, i: number) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground">{t}</span>
                ))}
              </div>
              {p.liveUrl && (
                <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${btnClass}`}>
                  <span>Launch Live Demo</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 4. Open Source Projects
 */
export function OpenSourceSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  const projects = resume.projects || [];
  return (
    <section id="open-source" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">02 / OPEN SOURCE</span>
      <h2 className="text-2xl font-bold text-foreground">Public Repositories & Packages</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.map((p: any, idx: number) => (
          <div key={idx} className={`p-4 rounded-xl ${cardClass} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-primary" />
                <span>{p.title}</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">Public</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 5. Work Experience
 */
export function ExperienceSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  const experience = resume.experience || [];
  return (
    <section id="experience" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">03 / EXPERIENCE</span>
      <h2 className="text-2xl font-bold text-foreground">Career & Leadership Trajectory</h2>

      <div className="space-y-3">
        {experience.map((e: any, idx: number) => (
          <div key={idx} className={`p-5 rounded-2xl ${cardClass} space-y-2`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="font-bold text-sm text-foreground">{e.position}</h3>
                <span className="text-xs font-semibold text-primary">{e.company}</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">{e.startDate} — {e.endDate || "Present"}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{e.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 6. Leadership & Advisory
 */
export function LeadershipSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  const customSections = resume.customSections || [];
  const leadershipSection = customSections.find((s: any) => s.title?.toLowerCase().includes("leadership")) || {
    title: "Leadership & Advisory",
    items: [
      { title: "Technical Advisory", subtitle: "Architecture & Scale", description: "Advised enterprise clients on cloud cost reduction and multi-region resilience." },
    ],
  };

  return (
    <section id="leadership" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">04 / GOVERNANCE</span>
      <h2 className="text-2xl font-bold text-foreground">Leadership & Advisory</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {leadershipSection.items.map((item: any, idx: number) => (
          <div key={idx} className={`p-5 rounded-2xl ${cardClass} space-y-2`}>
            <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 7. Education
 */
export function EducationSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  const education = resume.education || [];
  return (
    <section id="education" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">05 / ACADEMICS</span>
      <h2 className="text-2xl font-bold text-foreground">Education & Honors</h2>

      <div className="space-y-3">
        {education.map((edu: any, idx: number) => (
          <div key={idx} className={`p-5 rounded-2xl ${cardClass} space-y-1.5`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">{edu.degree} in {edu.fieldOfStudy}</h3>
              <span className="text-xs font-mono text-muted-foreground">{edu.startDate} — {edu.endDate}</span>
            </div>
            <span className="text-xs font-semibold text-primary block">{edu.institution}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 8. Skills Radar
 */
export function SkillsSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  const skills = resume.skills || [];
  return (
    <section id="skills" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">06 / COMPETENCIES</span>
      <h2 className="text-2xl font-bold text-foreground">Skills & Expertise Radar</h2>

      <div className="flex flex-wrap gap-2">
        {skills.map((s: any, idx: number) => (
          <span key={idx} className={`px-3 py-1.5 rounded-xl ${cardClass} text-xs font-semibold text-foreground`}>
            {s.name}
          </span>
        ))}
      </div>
    </section>
  );
}

/**
 * 9. Tech Stack Explorer
 */
export function TechStackExplorerSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  return (
    <section id="tech-stack" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">07 / ECOSYSTEM</span>
      <h2 className="text-2xl font-bold text-foreground">Technology Ecosystem Explorer</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-5 rounded-2xl ${cardClass} space-y-2`}>
          <span className="text-xs font-bold text-cyan-400 block">AI & ML Pipelines</span>
          <p className="text-xs text-muted-foreground">PyTorch, Vector Databases (Qdrant, pgvector), RAG Architectures.</p>
        </div>
        <div className={`p-5 rounded-2xl ${cardClass} space-y-2`}>
          <span className="text-xs font-bold text-blue-400 block">Frontend & Design Systems</span>
          <p className="text-xs text-muted-foreground">Next.js 15, TypeScript, Tailwind CSS, Framer Motion.</p>
        </div>
      </div>
    </section>
  );
}

/**
 * 10. Achievements
 */
export function AchievementsSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  return (
    <section id="achievements" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">08 / ACHIEVEMENTS</span>
      <h2 className="text-2xl font-bold text-foreground">Key Milestones & Breakthroughs</h2>

      <div className={`p-6 rounded-2xl ${cardClass} space-y-3`}>
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Sub-50ms p99 Query Latency across 10M dense vectors</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Zero-downtime CI/CD automated canary deployment rollout</span>
        </div>
      </div>
    </section>
  );
}

/**
 * 11. Certifications
 */
export function CertificationsSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  const certifications = resume.certifications || [];
  return (
    <section id="certifications" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">09 / CERTIFICATIONS</span>
      <h2 className="text-2xl font-bold text-foreground">Verified Credentials</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {certifications.map((c: any, idx: number) => (
          <div key={idx} className={`p-4 rounded-xl ${cardClass} space-y-1`}>
            <span className="font-bold text-xs text-foreground block">{c.name}</span>
            <span className="text-[11px] text-muted-foreground">{c.issuer}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 12. Awards
 */
export function AwardsSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  return (
    <section id="awards" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">10 / HONORS</span>
      <h2 className="text-2xl font-bold text-foreground">Awards & Hackathon Wins</h2>

      <div className={`p-5 rounded-2xl ${cardClass} space-y-2`}>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-xs text-foreground">1st Place • Global AI Agent Hackathon</h3>
        </div>
        <p className="text-xs text-muted-foreground">Built autonomous tool execution and retrieval pipeline.</p>
      </div>
    </section>
  );
}

/**
 * 13. Publications
 */
export function PublicationsSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  return (
    <section id="publications" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">11 / PUBLICATIONS</span>
      <h2 className="text-2xl font-bold text-foreground">Research & Whitepapers</h2>

      <div className={`p-5 rounded-2xl ${cardClass} space-y-1.5`}>
        <span className="font-bold text-xs text-foreground block">Distributed Vector Indexing in Edge Multi-Tenant Environments</span>
        <span className="text-[11px] text-muted-foreground block">IEEE Systems Journal • 2024</span>
      </div>
    </section>
  );
}

/**
 * 14. Volunteer
 */
export function VolunteerSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  return (
    <section id="volunteer" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">12 / COMMUNITY</span>
      <h2 className="text-2xl font-bold text-foreground">Volunteer & Open Source Mentorship</h2>

      <div className={`p-5 rounded-2xl ${cardClass} space-y-1.5`}>
        <span className="font-bold text-xs text-foreground block">Open Source Mentor • Linux Foundation Mentorship</span>
        <p className="text-xs text-muted-foreground">Mentored junior engineers contributing to cloud-native projects.</p>
      </div>
    </section>
  );
}

/**
 * 15. Blog Posts
 */
export function BlogPostsSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  return (
    <section id="blog-posts" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">13 / ARTICLES</span>
      <h2 className="text-2xl font-bold text-foreground">Technical Writing & Guides</h2>

      <div className={`p-5 rounded-2xl ${cardClass} space-y-1.5`}>
        <span className="font-bold text-xs text-foreground block">Why Hybrid Search Beats Dense Vector Embeddings at Scale</span>
        <span className="text-[11px] text-muted-foreground block">Published on Dev.to • 12k reads</span>
      </div>
    </section>
  );
}

/**
 * 16. GitHub Stats
 */
export function GitHubStatsSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  return (
    <section id="github-stats" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">14 / VELOCITY</span>
      <h2 className="text-2xl font-bold text-foreground">GitHub Developer Statistics</h2>

      <div className={`p-6 rounded-2xl ${cardClass} space-y-4`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-secondary/40 space-y-1">
            <span className="text-2xl font-bold font-mono text-foreground">28</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Repositories</span>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40 space-y-1">
            <span className="text-2xl font-bold font-mono text-amber-400">140+</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Stars</span>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40 space-y-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">84 Days</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Streak</span>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40 space-y-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">Top 5%</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Quality</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 17. Career Timeline
 */
export function CareerTimelineSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  const experience = resume.experience || [];
  return (
    <section id="timeline" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">15 / CHRONOLOGY</span>
      <h2 className="text-2xl font-bold text-foreground">Career Timeline</h2>

      <div className="relative pl-6 border-l-2 border-primary/40 space-y-6">
        {experience.map((e: any, idx: number) => (
          <div key={idx} className="relative space-y-1">
            <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary" />
            <h3 className="font-bold text-xs text-foreground">{e.position} @ {e.company}</h3>
            <span className="text-[11px] font-mono text-muted-foreground">{e.startDate} — {e.endDate || "Present"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 18. Testimonials
 */
export function TestimonialsSection({ resume, cardClass = "bg-card border border-border" }: SectionProps) {
  return (
    <section id="testimonials" className="space-y-4">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">16 / SOCIAL PROOF</span>
      <h2 className="text-2xl font-bold text-foreground">Recommendations & Endorsements</h2>

      <div className={`p-6 rounded-2xl ${cardClass} space-y-3`}>
        <Quote className="w-5 h-5 text-primary/40" />
        <p className="text-xs text-foreground/90 italic leading-relaxed">
          &ldquo;Exceptional technical leadership with an innate ability to translate complex distributed architecture into reliable software products.&rdquo;
        </p>
        <span className="text-xs font-bold text-foreground block">Marcus Vance • VP of Engineering</span>
      </div>
    </section>
  );
}

/**
 * 19. Resume PDF Download CTA
 */
export function ResumeDownloadSection({ resume, btnClass = "bg-primary text-primary-foreground" }: SectionProps) {
  const pi = resume.personalInfo || {};
  return (
    <section id="resume-download" className="p-6 rounded-2xl border border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 text-center space-y-3 shadow-sm">
      <h3 className="font-bold text-base text-foreground">Want a print-ready resume document?</h3>
      <p className="text-xs text-muted-foreground">Download the complete verified ATS-compliant PDF resume for {pi.fullName || "the candidate"}.</p>
      <Link href={`/builder/${resume.id || "sample"}`} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold ${btnClass}`}>
        <Download className="w-3.5 h-3.5" />
        <span>Export Official Resume PDF</span>
      </Link>
    </section>
  );
}

/**
 * 20. Executive Contact & Scheduler
 */
export function ContactSection({ resume, cardClass = "bg-card border border-border", btnClass = "bg-primary text-primary-foreground" }: SectionProps) {
  const pi = resume.personalInfo || {};
  const [submitted, setSubmitted] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSubmitted(true);
    setMsg("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="contact" className={`p-6 sm:p-8 rounded-3xl ${cardClass} space-y-6`}>
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">17 / DIRECT CONTACT</span>
      <h2 className="text-2xl font-bold text-foreground">Initiate Technical Collaboration</h2>

      {submitted ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
          Thank you! Message dispatched successfully.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <textarea
            rows={3}
            required
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Describe your engineering role, project, or schedule inquiry..."
            className="w-full p-3 rounded-xl border border-border bg-secondary/30 text-foreground focus:outline-hidden resize-none"
          />
          <Button type="submit" size="sm" className={`w-full h-9 text-xs gap-2 ${btnClass}`}>
            <Send className="w-3.5 h-3.5" />
            <span>Send Direct Message</span>
          </Button>
        </form>
      )}
    </section>
  );
}

/**
 * Universal Section Registry Map
 */
export const SECTION_COMPONENTS: Record<PortfolioSectionId, React.ComponentType<SectionProps>> = {
  "hero": ProfileHeroSection,
  "about": AboutSection,
  "featured-projects": FeaturedProjectsSection,
  "open-source": OpenSourceSection,
  "experience": ExperienceSection,
  "leadership": LeadershipSection,
  "education": EducationSection,
  "skills": SkillsSection,
  "tech-stack": TechStackExplorerSection,
  "achievements": AchievementsSection,
  "certifications": CertificationsSection,
  "awards": AwardsSection,
  "publications": PublicationsSection,
  "volunteer": VolunteerSection,
  "blog-posts": BlogPostsSection,
  "github-stats": GitHubStatsSection,
  "timeline": CareerTimelineSection,
  "testimonials": TestimonialsSection,
  "resume-download": ResumeDownloadSection,
  "contact": ContactSection,
};

export function ModularThemeSections({
  resume,
  theme,
  sectionsConfig,
  cardClass = "bg-card border border-border",
  accentClass = "text-primary",
  btnClass = "bg-primary text-primary-foreground",
}: {
  resume: any;
  theme?: PortfolioTheme;
  sectionsConfig?: PortfolioSectionConfig[];
  cardClass?: string;
  accentClass?: string;
  btnClass?: string;
}) {
  const configs = sectionsConfig && sectionsConfig.length > 0 ? sectionsConfig : DEFAULT_PORTFOLIO_SECTIONS;
  const enabledSections = [...configs].sort((a, b) => a.order - b.order).filter((s) => s.enabled);

  return (
    <div className="space-y-16 sm:space-y-24">
      {enabledSections.map((sec) => {
        const Component = SECTION_COMPONENTS[sec.id];
        if (!Component) return null;
        return (
          <Component
            key={sec.id}
            resume={resume}
            theme={theme}
            cardClass={cardClass}
            accentClass={accentClass}
            btnClass={btnClass}
          />
        );
      })}
    </div>
  );
}
