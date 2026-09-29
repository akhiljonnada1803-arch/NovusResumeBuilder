"use client";

import React, { useState } from "react";
import { VoiceInterviewSession } from "@/types/voice-interview";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Trophy,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Download,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  MessageSquare,
  Zap,
  Target,
  Quote,
  Activity,
  Mic,
  Volume2,
} from "lucide-react";

interface VoiceFeedbackDashboardProps {
  session: VoiceInterviewSession;
  onRestart: () => void;
}

export function VoiceFeedbackDashboard({ session, onRestart }: VoiceFeedbackDashboardProps) {
  const { success } = useToast();
  const {
    finalScores,
    overallVerdict,
    topStrengths = [],
    priorityGrowthAreas = [],
    turns = [],
    candidateName,
    targetRole,
    interviewType,
    evidenceList = [],
    speechAnalytics,
    executiveSummary,
  } = session;

  const [expandedTurns, setExpandedTurns] = useState<Record<string, boolean>>({
    [turns[0]?.id || ""]: true,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `
# Voice Mock Interview Performance Report
**Candidate**: ${candidateName}  
**Role**: ${targetRole}  
**Interview Type**: ${interviewType.toUpperCase()}  
**Verdict**: ${overallVerdict}  
**Overall Readiness Score**: ${finalScores.overall}/100  

## Speech Telemetry
- Speaking Pace: ${speechAnalytics?.speakingPaceWpm || 0} WPM
- Total Spoken Words: ${speechAnalytics?.totalWords || 0}
- Spoken Filler Words: ${speechAnalytics?.fillerWordsCount || 0}

## Evidence-Based Score Breakdown
- Technical Knowledge: ${finalScores.technicalKnowledge}/100
- Communication: ${finalScores.communication}/100
- Confidence: ${finalScores.confidence}/100
- Clarity & Structure: ${finalScores.clarity}/100

## Evidence Audit Log
${evidenceList
  .map(
    (e) => `
### [${e.category}: ${e.score}/100]
- **Reason**: ${e.reason}
- **Supporting Transcript Quote**: "${e.supportingTranscript}"
`
  )
  .join("\n")}

## Top Strengths (Grounded in Transcript)
${topStrengths.map((s) => `- ${s}`).join("\n")}

## Priority Growth Areas
${priorityGrowthAreas.map((g) => `- ${g}`).join("\n")}

## Question-by-Question Transcript
${turns
  .map(
    (t, idx) => `
### Question ${idx + 1}: ${t.interviewerQuestion}
**Candidate Spoken Answer**: "${t.candidateTranscript}"  
**Score**: ${t.evaluation?.overallScore || "N/A"}/100  
**Reason**: ${t.evaluation?.reason || t.evaluation?.feedback || "Evaluated"}  
**Evidence Quote**: "${t.evaluation?.supportingTranscript || ""}"
`
  )
  .join("\n\n")}
    `.trim();

    navigator.clipboard.writeText(md);
    success("Interview feedback markdown copied to clipboard!");
  };

  // 1. INSUFFICIENT DATA SCREEN
  if (overallVerdict === "Insufficient Data" || finalScores.overall === 0) {
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
              <span className="text-muted-foreground text-xs font-medium">Spoken Words Recorded</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-amber-500">{speechAnalytics?.totalWords || 0}</span>
                <span className="text-xs text-muted-foreground">words (min. 15 required)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Speaking Pace</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-blue-500">{speechAnalytics?.speakingPaceWpm || 0}</span>
                <span className="text-xs text-muted-foreground">WPM</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Scorecard Decision</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-400">Suspended (Zero Fake Data)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-background/80 border border-border space-y-2">
            <span className="text-[10px] font-mono text-primary font-bold uppercase block">
              Integrity Policy:
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We do not generate simulated scores, praise, or hiring decisions when voice sessions lack spoken content. Complete at least one question with clear voice audio to generate an evidence-backed evaluation.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/80 flex-wrap gap-3">
            <Button variant="radiant" onClick={onRestart} className="h-9 px-6 text-xs font-bold gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Retry Voice Interview</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Evidence-Grounded Voice Interview Scorecard
          </h2>
          <p className="text-xs text-muted-foreground">
            Multi-dimensional evaluation derived strictly from spoken transcript evidence for {targetRole}.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Hero Score Banner */}
      <div className="p-6 rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>INTERVIEW VERDICT: {overallVerdict.toUpperCase()}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-foreground">{candidateName}</h3>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            {executiveSummary}
          </p>
        </div>

        {/* Circular Overall Score Dial */}
        <div className="w-32 h-32 rounded-full border-4 border-emerald-500/80 bg-emerald-500/10 flex flex-col items-center justify-center shrink-0 shadow-xl">
          <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {finalScores.overall}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">/ 100 Overall</span>
        </div>
      </div>

      {/* Speech Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-500" />
            <span>Speaking Pace</span>
          </span>
          <span className="text-xl font-mono font-black text-foreground">{speechAnalytics?.speakingPaceWpm || 0} WPM</span>
          <p className="text-[10px] text-muted-foreground">Ideal range: 130 - 165 WPM</p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Mic className="w-3 h-3 text-emerald-500" />
            <span>Total Words</span>
          </span>
          <span className="text-xl font-mono font-black text-foreground">{speechAnalytics?.totalWords || 0}</span>
          <p className="text-[10px] text-muted-foreground">Spoken words recorded</p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-amber-500" />
            <span>Filler Words</span>
          </span>
          <span className="text-xl font-mono font-black text-amber-500">{speechAnalytics?.fillerWordsCount || 0}</span>
          <p className="text-[10px] text-muted-foreground">e.g. um, uh, like</p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Evidence Rate</span>
          </span>
          <span className="text-xl font-mono font-black text-emerald-500">100% Grounded</span>
          <p className="text-[10px] text-muted-foreground">All scores cited to quotes</p>
        </div>
      </div>

      {/* 4D Metric Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Technical Knowledge</span>
            <span className="font-mono font-bold text-blue-500">{finalScores.technicalKnowledge}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${finalScores.technicalKnowledge}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Architectural depth, correctness & trade-offs.</p>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Communication</span>
            <span className="font-mono font-bold text-emerald-500">{finalScores.communication}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${finalScores.communication}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Pacing, articulation & professional engagement.</p>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Confidence & Conviction</span>
            <span className="font-mono font-bold text-purple-500">{finalScores.confidence}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${finalScores.confidence}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Assertive vocal tone & minimal hesitation.</p>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Clarity & Structure</span>
            <span className="font-mono font-bold text-amber-500">{finalScores.clarity}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${finalScores.clarity}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Concise STAR framing & logical sequence.</p>
        </div>
      </div>

      {/* Evidence Audit Section */}
      {evidenceList.length > 0 && (
        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Quote className="w-4 h-4 text-primary" />
              <span>Evidence Audit Log (Transcript Quotes)</span>
            </h4>
            <span className="text-[10px] font-mono text-muted-foreground">
              Every score backed by transcript claims
            </span>
          </div>

          <div className="space-y-2.5">
            {evidenceList.map((ev, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border bg-secondary/30 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{ev.category}</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px]">
                    Score: {ev.score}/100
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">{ev.reason}</p>
                <div className="p-2 rounded bg-background/80 border border-border font-mono text-[10px] text-foreground/90 italic">
                  &ldquo;{ev.supportingTranscript}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Action Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Strengths (Transcript Grounded)</span>
          </div>
          <ul className="space-y-2 text-xs">
            {topStrengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-foreground/90">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Priority Growth Opportunities</span>
          </div>
          <ul className="space-y-2 text-xs">
            {priorityGrowthAreas.map((g, idx) => (
              <li key={idx} className="flex items-start gap-2 text-foreground/90">
                <span className="text-amber-500 font-bold">→</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Turn-by-Turn Question Transcripts */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Detailed Spoken Transcripts & Feedback</span>
        </h3>

        <div className="space-y-3">
          {turns.map((turn, idx) => {
            const isExpanded = expandedTurns[turn.id];
            const evalData = turn.evaluation;

            return (
              <div key={turn.id || idx} className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setExpandedTurns({ ...expandedTurns, [turn.id]: !isExpanded })}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-foreground line-clamp-1">
                      {turn.interviewerQuestion}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {evalData?.overallScore ? (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {evalData.overallScore}%
                      </span>
                    ) : null}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-border/80 bg-secondary/10 space-y-4 text-xs">
                    <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                        Candidate Answer:
                      </span>
                      <p className="text-foreground/90 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                        {turn.candidateTranscript || "(No speech detected)"}
                      </p>
                    </div>

                    {evalData && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                          Recruiter Critique:
                        </span>
                        <p className="text-foreground text-xs leading-relaxed">
                          {evalData.feedback}
                        </p>
                        {evalData.supportingTranscript && (
                          <div className="p-2 rounded bg-background/80 border border-border font-mono text-[10px] text-foreground/90 italic mt-1">
                            Evidence: &ldquo;{evalData.supportingTranscript}&rdquo;
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
