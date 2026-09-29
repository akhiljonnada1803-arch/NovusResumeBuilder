"use client";

import React, { useState } from "react";
import { InterviewScorecard } from "../../types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { IntegrityReportCard } from "./IntegrityReportCard";
import {
  Trophy,
  ShieldCheck,
  Award,
  Video,
  Printer,
  Download,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Lightbulb,
  Eye,
} from "lucide-react";

interface ExecutiveScorecardDashboardProps {
  scorecard: InterviewScorecard;
  recordedVideoBlobUrl?: string;
  onRestart: () => void;
}

export function ExecutiveScorecardDashboard({
  scorecard,
  recordedVideoBlobUrl,
  onRestart,
}: ExecutiveScorecardDashboardProps) {
  const { success } = useToast();
  const {
    candidateName,
    targetRole,
    persona,
    scores,
    evaluationStatus = "completed",
    candidateResponseCount = 0,
    evidenceList = [],
    speechAnalytics,
    missedOpportunities = [],
    exampleAnswerImprovements = [],
    verdict,
    executiveSummary,
    keyStrengths,
    growthAreas,
    recruiterClosingNote,
    turns,
  } = scorecard;

  const [expandedTurns, setExpandedTurns] = useState<Record<string, boolean>>({
    [turns[0]?.id || ""]: true,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadVideo = () => {
    if (!recordedVideoBlobUrl) return;
    const a = document.createElement("a");
    a.href = recordedVideoBlobUrl;
    a.download = `${candidateName.replace(/\s+/g, "_")}_Recruiter_Interview.webm`;
    a.click();
    success("Downloaded interview video recording!");
  };

  const handleCopyMarkdown = () => {
    const md = `
# Executive Recruiter Performance Scorecard
**Candidate**: ${candidateName}  
**Target Role**: ${targetRole}  
**Interviewer**: ${persona.name} (${persona.title}, ${persona.company})  
**Evaluation Status**: ${evaluationStatus.toUpperCase()}  
**Hiring Verdict**: ${verdict} (${scores.overall}/100)  

## Executive Summary
${executiveSummary}

## Evidence Audit Log
${evidenceList
  .map(
    (e) => `
### [${e.category}: ${e.score}/100]
- **Reason**: ${e.reason}
- **Supporting Quote**: "${e.supportingTranscript}"
`
  )
  .join("\n")}

## Top Candidate Strengths
${keyStrengths.map((s) => `- ${s}`).join("\n")}

## Priority Growth Opportunities
${growthAreas.map((g) => `- ${g}`).join("\n")}

## Recruiter Closing Notes
${recruiterClosingNote}
    `.trim();

    navigator.clipboard.writeText(md);
    success("Scorecard markdown copied to clipboard!");
  };

  // 1. INSUFFICIENT INTERVIEW DATA SCREEN
  if (evaluationStatus === "insufficient-data" || candidateResponseCount < 3) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto py-6">
        <div className="p-8 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-xl space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                  Evidence-Based Evaluation Rule
                </span>
                <span className="text-xs font-mono text-muted-foreground">{new Date().toLocaleDateString()}</span>
              </div>
              <h2 className="text-2xl font-black text-foreground">Insufficient Interview Data</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {executiveSummary}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Candidate Responses</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-amber-500">{candidateResponseCount}</span>
                <span className="text-xs text-muted-foreground">/ 3 minimum required</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Total Words Spoken</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-blue-500">{speechAnalytics?.totalWords || 0}</span>
                <span className="text-xs text-muted-foreground">words recorded</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Hiring Verdict</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-400">Suspended</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-background/80 border border-border space-y-2">
            <span className="text-[10px] font-mono text-primary font-bold uppercase block">
              Evaluation Integrity Policy:
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Novus Resume AI strictly enforces evidence-backed evaluation. We do not generate placeholder scores, false praise, or hiring recommendations when an interview call is ended prematurely or without substantive technical responses.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/80 flex-wrap gap-3">
            <span className="text-xs text-muted-foreground">
              Ready for a full mock interview with {persona.name}?
            </span>
            <Button size="default" variant="radiant" onClick={onRestart} className="font-bold gap-2 shadow-md">
              <RotateCcw className="w-4 h-4" />
              <span>Start New Interview (Complete 3+ Turns)</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const eightDimensions = [
    { label: "Technical Knowledge", score: scores.technicalKnowledge, color: "text-blue-500", bar: "bg-blue-500", desc: "Architecture accuracy & depth" },
    { label: "Problem Solving", score: scores.problemSolving, color: "text-purple-500", bar: "bg-purple-500", desc: "First-principles & edge-case logic" },
    { label: "Communication", score: scores.communication, color: "text-emerald-500", bar: "bg-emerald-500", desc: "Concise phrasing & articulation" },
    { label: "Confidence", score: scores.confidence, color: "text-amber-500", bar: "bg-amber-500", desc: "Vocal firmness & conviction" },
    { label: "Clarity", score: scores.clarity, color: "text-teal-500", bar: "bg-teal-500", desc: "STAR structure & clear framing" },
    { label: "Leadership", score: scores.leadership, color: "text-indigo-500", bar: "bg-indigo-500", desc: "Ownership & collaborative empathy" },
    { label: "Behavioral Fit", score: scores.behavioralFit, color: "text-rose-500", bar: "bg-rose-500", desc: "Culture alignment & resilience" },
    { label: "Role Match", score: scores.roleMatch, color: "text-sky-500", bar: "bg-sky-500", desc: "Suitability for target level" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Evidence-Based Recruiter Scorecard & Hiring Recommendation
          </h2>
          <p className="text-xs text-muted-foreground">
            Strictly derived from candidate transcript evidence by {persona.name} ({persona.company}) for the {targetRole} position.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {recordedVideoBlobUrl && (
            <Button size="sm" variant="outline" onClick={handleDownloadVideo} className="h-8 text-xs gap-1 font-semibold text-primary">
              <Download className="w-3.5 h-3.5" />
              <span>Download Video</span>
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleCopyMarkdown} className="h-8 text-xs gap-1 font-semibold">
            <Download className="w-3.5 h-3.5" />
            <span>Copy MD</span>
          </Button>
          <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs gap-1 font-semibold">
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </Button>
          <Button size="sm" variant="radiant" onClick={onRestart} className="h-8 text-xs gap-1.5 font-bold shadow-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Interview</span>
          </Button>
        </div>
      </div>

      {/* Hero Score & Decision Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recruiter Summary */}
        <div className="lg:col-span-8 p-6 rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HIRING VERDICT: {verdict.toUpperCase()}</span>
              </span>

              <span className="text-xs font-mono text-muted-foreground">{scorecard.completedAt.split("T")[0]}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-foreground">{candidateName}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {executiveSummary}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-primary block">
              Recruiter Closing Note to Hiring Committee:
            </span>
            <p className="text-xs text-foreground/90 italic leading-relaxed">
              &ldquo;{recruiterClosingNote}&rdquo;
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div>
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">Interviewer</span>
              <span className="text-xs font-bold text-foreground">{persona.name} ({persona.company})</span>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black font-mono text-primary">{scores.overall}</span>
              <span className="text-xs text-muted-foreground font-bold"> / 100 Overall</span>
            </div>
          </div>
        </div>

        {/* Video Recording Tile */}
        <div className="lg:col-span-4 p-4 rounded-3xl border border-border bg-card shadow-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-primary" />
              Session Video Recording
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">HD Capture</span>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-border flex items-center justify-center">
            {recordedVideoBlobUrl ? (
              <video
                src={recordedVideoBlobUrl}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground text-center p-4">
                <Video className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs">Live stream recorded cleanly</span>
              </div>
            )}
          </div>

          <span className="text-[10px] text-muted-foreground text-center block">
            Verbatim video & audio recorded via browser MediaRecorder.
          </span>
        </div>
      </div>

      {/* 8-Dimensional AI Competency Progress Grid */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <span>8 Core Evaluation Dimensions (Evidence Weighted)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {eightDimensions.map((dim, i) => (
            <div key={i} className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">{dim.label}</span>
                <span className={`font-mono font-bold ${dim.color}`}>{dim.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full ${dim.bar} rounded-full transition-all duration-500`} style={{ width: `${dim.score}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">{dim.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* EVALUATION TRANSPARENCY & EVIDENCE AUDIT LOG */}
      {evidenceList && evidenceList.length > 0 && (
        <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span>Evaluation Transparency & Evidence Audit Log</span>
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">Every Score Cites Verbatim Transcript</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidenceList.map((ev, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{ev.category}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Score: {ev.score}/100
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block">Evaluation Reason:</span>
                  <p className="text-xs text-foreground/90 leading-relaxed">{ev.reason}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-background/80 border border-border/80 space-y-0.5">
                  <span className="text-[9px] font-mono font-bold uppercase text-emerald-500 block">Supporting Transcript Evidence:</span>
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                    &ldquo;{ev.supportingTranscript}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speech Analytics & Pace Signal Card */}
      {speechAnalytics && (
        <div className="p-5 rounded-3xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Speech & Pacing Analytics</span>
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">
              {speechAnalytics.totalWords} Total Spoken Words
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Speaking Pace</span>
                <span className="font-bold font-mono text-emerald-500">{speechAnalytics.speakingPaceWpm} WPM</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">
                {speechAnalytics.speakingPaceWpm >= 120 && speechAnalytics.speakingPaceWpm <= 165
                  ? "✓ Ideal conversational pace (120-160 WPM)"
                  : speechAnalytics.speakingPaceWpm > 165
                  ? "⚠ Slightly rapid pace"
                  : "⚠ Deliberative pace"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Avg Answer Length</span>
                <span className="font-bold font-mono text-blue-500">{speechAnalytics.avgWordsPerAnswer} words</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">
                {speechAnalytics.avgWordsPerAnswer >= 35 ? "✓ Good technical elaboration" : "⚠ Brief responses"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Filler Words</span>
                <span className="font-bold font-mono text-amber-500">{speechAnalytics.fillerWordsCount} detected</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {Object.entries(speechAnalytics.fillerWordsBreakdown || {}).map(([word, count]) => (
                  <span key={word} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    &ldquo;{word}&rdquo;: {count}
                  </span>
                ))}
                {speechAnalytics.fillerWordsCount === 0 && (
                  <span className="text-[10px] text-emerald-500">✓ Zero filler words detected</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Hesitation Index</span>
                <span className="font-bold font-mono text-teal-500">{speechAnalytics.hesitationScore}%</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">
                {speechAnalytics.hesitationScore < 20 ? "✓ High conviction & fluency" : "⚠ Occasional pauses"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Diagnostic: Strengths, Growth Areas & Missed Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Candidate Strengths (Grounded)</span>
          </div>
          <ul className="space-y-2">
            {keyStrengths.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Priority Growth Areas (Grounded)</span>
          </div>
          <ul className="space-y-2">
            {growthAreas.map((g, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>Missed Opportunities</span>
          </div>
          <ul className="space-y-2">
            {missedOpportunities.map((m, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable High-Impact Answer Rewrites */}
      {exampleAnswerImprovements && exampleAnswerImprovements.length > 0 && (
        <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Actionable Answer Rewrites (STAR Method)</span>
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">High-Impact Optimization</span>
          </div>

          <div className="space-y-4">
            {exampleAnswerImprovements.map((imp, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-primary font-bold uppercase">Question Asked:</span>
                  <p className="text-xs font-bold text-foreground">&ldquo;{imp.question}&rdquo;</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-background/80 border border-border space-y-1">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Candidate Answer:</span>
                    <p className="text-muted-foreground italic">&ldquo;{imp.candidateAnswerExcerpt}&rdquo;</p>
                    <p className="text-[11px] text-amber-500 pt-1 font-medium">Critique: {imp.critique}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-primary uppercase">Suggested High-Impact STAR Rewrite:</span>
                    <p className="text-foreground leading-relaxed font-medium">&ldquo;{imp.suggestedHighImpactAnswer}&rdquo;</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus Integrity Report Card */}
      {scorecard.integrityReport && (
        <IntegrityReportCard report={scorecard.integrityReport} />
      )}

      {/* Verbatim Interview Transcript Stream */}
      <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Complete Interview Transcript ({turns.length} Conversational Turns)</span>
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground">Verbatim Dialogue Log</span>
        </div>

        <div className="space-y-3">
          {turns.map((t, idx) => {
            const isExpanded = expandedTurns[t.id] ?? false;
            return (
              <div key={t.id || idx} className="p-3.5 rounded-2xl border border-border/80 bg-secondary/20 space-y-2">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedTurns({ ...expandedTurns, [t.id]: !isExpanded })}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-white">
                      Turn {idx + 1}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        t.speaker === "recruiter" ? "text-primary" : "text-emerald-500"
                      }`}
                    >
                      {t.speaker === "recruiter" ? persona.name : `${candidateName} (Candidate)`}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      [{t.stage}]
                    </span>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {isExpanded && (
                  <p className="text-xs text-foreground/90 leading-relaxed pl-2 border-l-2 border-primary/40 pt-1">
                    &ldquo;{t.text}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
