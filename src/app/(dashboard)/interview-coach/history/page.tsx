"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  listInterviewSessions,
  getInterviewSession,
  type InterviewSessionRow,
  type InterviewScorecardRow,
} from "@/lib/api/interview-sessions";
import {
  History,
  ChevronDown,
  ChevronUp,
  Bot,
  Trophy,
  Clock,
  ArrowLeft,
  Loader2,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpandedSession {
  scorecards: InterviewScorecardRow[];
  loading: boolean;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null)
    return (
      <span className="text-xs text-muted-foreground font-mono">—</span>
    );
  const color =
    score >= 80
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : score >= 60
        ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
        : "text-red-400 bg-red-400/10 border-red-400/20";
  return (
    <span
      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}
    >
      {score}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InterviewHistoryPage() {
  const [sessions, setSessions] = useState<InterviewSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, ExpandedSession>>({});

  useEffect(() => {
    listInterviewSessions().then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  const toggleExpand = async (session: InterviewSessionRow) => {
    if (expandedId === session.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(session.id);
    if (expanded[session.id]) return; // already loaded

    setExpanded((prev) => ({
      ...prev,
      [session.id]: { scorecards: [], loading: true },
    }));
    const { scorecards } = await getInterviewSession(session.id);
    setExpanded((prev) => ({
      ...prev,
      [session.id]: { scorecards, loading: false },
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <History className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Interview History
            </h1>
            <p className="text-xs text-muted-foreground">
              Your past sessions and scorecards
            </p>
          </div>
        </div>
        <Link href="/interview-coach">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Coach
          </Button>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading sessions…</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <Bot className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">
            No sessions yet
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Complete your first interview with the AI coach and your session
            will appear here with a full scorecard.
          </p>
          <Link href="/interview-coach">
            <Button size="sm" className="mt-2 gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              Start Practice Session
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isOpen = expandedId === session.id;
            const expandData = expanded[session.id];

            return (
              <div
                key={session.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {/* Session Summary Row */}
                <button
                  onClick={() => toggleExpand(session)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground capitalize">
                        {session.interview_type.replace(/-/g, " ")} Interview
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {session.target_role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(session.created_at)}
                      </span>
                      {session.completed_at ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400">
                          <AlertCircle className="w-3 h-3" />
                          Incomplete
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Score
                      </p>
                      <ScoreBadge score={session.overall_score} />
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Scorecard */}
                {isOpen && (
                  <div className="border-t border-border px-5 py-4 space-y-4 bg-secondary/20">
                    {expandData?.loading ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading scorecard…
                      </div>
                    ) : !expandData || expandData.scorecards.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No detailed scorecard available for this session.
                      </p>
                    ) : (
                      expandData.scorecards.map((card) => (
                        <div
                          key={card.id}
                          className="rounded-lg border border-border bg-card p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 flex-1">
                              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <p className="text-xs font-medium text-foreground">
                                Q{card.turn_number}: {card.question}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <div className="text-center">
                                <p className="text-[9px] text-muted-foreground mb-1">
                                  STAR
                                </p>
                                <ScoreBadge score={card.star_score} />
                              </div>
                              <div className="text-center">
                                <p className="text-[9px] text-muted-foreground mb-1 flex items-center gap-0.5">
                                  <BarChart3 className="w-2.5 h-2.5" />
                                  Clarity
                                </p>
                                <ScoreBadge score={card.clarity_score} />
                              </div>
                            </div>
                          </div>

                          {card.answer_transcript && (
                            <div className="pl-5">
                              <p className="text-[11px] text-muted-foreground italic leading-relaxed line-clamp-3">
                                &ldquo;{card.answer_transcript}&rdquo;
                              </p>
                            </div>
                          )}

                          {card.feedback && (
                            <div className="pl-5 pt-1 border-t border-border/60">
                              <p className="text-[11px] text-foreground/80 leading-relaxed">
                                💡 {card.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
