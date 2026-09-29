"use client";

import React, { useState } from "react";
import { VideoInterviewSessionReport } from "@/types/video-interview";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
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
  Eye,
  Smile,
  Activity,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Quote,
  MessageSquare,
} from "lucide-react";

interface VideoPerformanceReportProps {
  report: VideoInterviewSessionReport;
  onRestart: () => void;
}

export function VideoPerformanceReport({ report, onRestart }: VideoPerformanceReportProps) {
  const { success } = useToast();
  const {
    candidateName,
    targetRole,
    track,
    recruiter,
    overallScore,
    verdict,
    aggregateBehavioral,
    recruiterNotes,
    topStrengths = [],
    priorityImprovements = [],
    evidenceList = [],
    turns = [],
    recordedVideoBlobUrl,
  } = report;

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
    a.download = `${candidateName.replace(/\s+/g, "_")}_Interview_Recording.webm`;
    a.click();
    success("Downloaded interview video recording!");
  };

  const handleCopyMarkdown = () => {
    const md = `
# Executive Recruiter Video Performance Report
**Candidate**: ${candidateName}  
**Role**: ${targetRole}  
**Track**: ${track.toUpperCase()}  
**Recruiter**: ${recruiter.name} (${recruiter.title})  
**Hiring Verdict**: ${verdict} (${overallScore}/100)  

## Recruiter Executive Notes
${recruiterNotes}

## 5-Dimensional Behavioral Telemetry
- Eye Contact: ${aggregateBehavioral.eyeContactScore}%
- Facial Engagement: ${aggregateBehavioral.facialEngagementScore}%
- Speaking Pace: ${aggregateBehavioral.speakingPaceWpm} WPM (Optimal: 120-160 WPM)
- Confidence & Conviction: ${aggregateBehavioral.confidenceScore}%
- Body Language & Posture: ${aggregateBehavioral.bodyLanguageScore}%
- Filler Words Count: ${aggregateBehavioral.fillerWordsCount} occurrences

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

## Key Strengths (Transcript Grounded)
${topStrengths.map((s) => `- ${s}`).join("\n")}

## Priority Growth Areas
${priorityImprovements.map((imp) => `- ${imp}`).join("\n")}

## Question-by-Question Transcript
${turns
  .map(
    (t, idx) => `
### Question ${idx + 1}: ${t.questionText}
**Candidate Answer**: "${t.transcriptText}"  
**Score**: ${t.contentEvaluation?.score || "N/A"}/100  
**Reason**: ${t.contentEvaluation?.reason || t.contentEvaluation?.feedback || ""}  
**Evidence Quote**: "${t.contentEvaluation?.supportingTranscript || ""}"
`
  )
  .join("\n\n")}
    `.trim();

    navigator.clipboard.writeText(md);
    success("Video interview performance report copied!");
  };

  // 1. INSUFFICIENT DATA SCREEN
  if (verdict === "Insufficient Data" || overallScore === 0) {
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
                {recruiterNotes}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Spoken Responses</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-amber-500">
                  {turns.filter((t) => t.transcriptText && t.transcriptText.trim().length > 5).length}
                </span>
                <span className="text-xs text-muted-foreground">recorded</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Speaking Pace</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-blue-500">
                  {aggregateBehavioral.speakingPaceWpm || 0}
                </span>
                <span className="text-xs text-muted-foreground">WPM</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Hiring Decision</span>
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
              We do not generate simulated scores, praise, or hiring decisions when video sessions lack spoken content. Complete at least one question with clear video and microphone audio to generate an evidence-backed evaluation.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/80 flex-wrap gap-3">
            <Button variant="radiant" onClick={onRestart} className="h-9 px-6 text-xs font-bold gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Retry Video Interview</span>
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
            Executive Recruiter Video Performance Report
          </h2>
          <p className="text-xs text-muted-foreground">
            Interviewed by {recruiter.name} for the {targetRole} position.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Hero Banner & Video Recording Playback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recruiter Decision Summary (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DECISION: {verdict.toUpperCase()}</span>
              </span>
              <span className="text-xs font-mono text-muted-foreground">{track.toUpperCase()} TRACK</span>
            </div>

            <h3 className="text-2xl font-black text-foreground">{candidateName}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {recruiterNotes}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm border border-primary/30">
                {recruiter.name.charAt(0)}
              </div>
              <div className="text-xs">
                <span className="font-bold text-foreground block">{recruiter.name}</span>
                <span className="text-[10px] text-muted-foreground">{recruiter.title}</span>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-3xl font-black text-primary block">{overallScore}</span>
              <span className="text-[10px] text-muted-foreground uppercase">/ 100 Overall</span>
            </div>
          </div>
        </div>

        {/* Video Playback Panel (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-3xl border border-border bg-card flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Video className="w-4 h-4 text-primary" />
              <span>Interview Session Recording</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">{turns.length} Questions</span>
          </div>

          {recordedVideoBlobUrl ? (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-border shadow-inner">
              <video src={recordedVideoBlobUrl} controls className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="rounded-2xl bg-secondary/30 border border-dashed border-border aspect-video flex flex-col items-center justify-center p-6 text-center space-y-2">
              <Video className="w-8 h-8 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Video stream was processed and analyzed during call.</p>
            </div>
          )}
        </div>
      </div>

      {/* 5D Behavioral Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Eye className="w-3 h-3 text-blue-500" />
            <span>Eye Contact</span>
          </span>
          <span className="text-xl font-mono font-black text-foreground">{aggregateBehavioral.eyeContactScore}%</span>
          <p className="text-[10px] text-muted-foreground">Camera gaze stability</p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Smile className="w-3 h-3 text-emerald-500" />
            <span>Engagement</span>
          </span>
          <span className="text-xl font-mono font-black text-foreground">{aggregateBehavioral.facialEngagementScore}%</span>
          <p className="text-[10px] text-muted-foreground">Facial affect & energy</p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-purple-500" />
            <span>Speaking Pace</span>
          </span>
          <span className="text-xl font-mono font-black text-foreground">{aggregateBehavioral.speakingPaceWpm} WPM</span>
          <p className="text-[10px] text-muted-foreground">Optimal: 120-160 WPM</p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-500" />
            <span>Conviction</span>
          </span>
          <span className="text-xl font-mono font-black text-foreground">{aggregateBehavioral.confidenceScore}%</span>
          <p className="text-[10px] text-muted-foreground">Vocal assertiveness</p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-rose-500" />
            <span>Filler Words</span>
          </span>
          <span className="text-xl font-mono font-black text-rose-500">{aggregateBehavioral.fillerWordsCount}</span>
          <p className="text-[10px] text-muted-foreground">um, uh, like occurrences</p>
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
              Every score backed by candidate statements
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

      {/* Strengths & Improvements Grid */}
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
            {priorityImprovements.map((g, idx) => (
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
            const evalData = turn.contentEvaluation;

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
                      {turn.questionText}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {evalData?.score ? (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {evalData.score}%
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
                        {turn.transcriptText || "(No speech detected)"}
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
