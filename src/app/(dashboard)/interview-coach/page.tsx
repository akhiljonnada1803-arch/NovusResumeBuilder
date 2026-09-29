"use client";

import React, { useState, useEffect, useRef } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VoiceInterviewStudio } from "@/components/voice-interview/VoiceInterviewStudio";
import { VideoInterviewStudio } from "@/components/video-interview/VideoInterviewStudio";
import { RealInterviewRoom, calculateInterviewReadiness } from "@/modules/interview";
import {
  InterviewCategory,
  InterviewQuestion,
  AnswerEvaluation,
  InterviewMessage,
  InterviewReadinessReport,
} from "@/modules/interview";
import {
  Bot,
  User,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Trophy,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Award,
  ChevronDown,
  ChevronUp,
  Sliders,
  HelpCircle,
  Briefcase,
  Layers,
  Code2,
  Building2,
  GraduationCap,
  Sparkle,
  Mic,
  Volume2,
  Video,
} from "lucide-react";

export default function InterviewCoachPage() {
  const { success, error: showErrorToast } = useToast();
  const resumes = useResumeStore((state) => state.resumes);
  const activeResumeId = useResumeStore((state) => state.activeResumeId);

  const selectedResume =
    resumes.find((r) => r.id === activeResumeId) || resumes[0];

  const [selectedResumeId, setSelectedResumeId] = useState(selectedResume?.id || "");
  const currentResume = resumes.find((r) => r.id === selectedResumeId) || selectedResume;

  const [activeTab, setActiveTab] = useState<"video" | "voice" | "mock" | "bank" | "report">("video");
  const [targetRole, setTargetRole] = useState(currentResume?.personalInfo?.jobTitle || "Senior Software Engineer");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<InterviewCategory | "all">("all");

  // Questions & Session State
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Chat message stream
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [candidateInput, setCandidateInput] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState<AnswerEvaluation[]>([]);

  // Expandable model answers
  const [expandedModelAnswers, setExpandedModelAnswers] = useState<Record<string, boolean>>({});

  // Final Readiness Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isEvaluating]);

  // Initial load of questions
  const loadQuestions = async () => {
    if (!currentResume) return;
    setIsLoadingQuestions(true);

    try {
      const res = await fetch("/api/interview/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: currentResume,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load questions.");

      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setEvaluations([]);

      // Start initial conversation message
      if (data.questions.length > 0) {
        const firstQ = data.questions[0];
        setMessages([
          {
            id: `msg-welcome`,
            role: "interviewer",
            content: `Hello ${currentResume.personalInfo?.fullName || "there"}! I'm your AI Technical Bar Raiser. We will conduct a simulated mock interview for the ${targetRole} position. Let's begin with question 1 of ${data.questions.length}:\n\n${firstQ.question}`,
            questionId: firstQ.id,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to initialize interview.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedResumeId]);

  const currentQ = questions[currentQuestionIndex];

  // Submit Answer & Evaluate
  const handleSendAnswer = async () => {
    if (!candidateInput.trim() || isEvaluating || !currentQ) return;

    const userText = candidateInput.trim();
    setCandidateInput("");

    // 1. Append candidate message
    const candidateMsg: InterviewMessage = {
      id: `cand-${Date.now()}`,
      role: "candidate",
      content: userText,
      questionId: currentQ.id,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, candidateMsg]);
    setIsEvaluating(true);

    try {
      // 2. Call evaluation API
      const res = await fetch("/api/interview/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQ,
          answer: userText,
          resume: currentResume,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate answer.");

      const evalData: AnswerEvaluation = data.evaluation;
      setEvaluations((prev) => [...prev, evalData]);

      // 3. Attach evaluation feedback to candidate message
      setMessages((prev) =>
        prev.map((m) => (m.id === candidateMsg.id ? { ...m, evaluation: evalData } : m))
      );

      // 4. Progress to next question or conclude
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
        const nextQ = questions[nextIndex];
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `interviewer-${Date.now()}`,
              role: "interviewer",
              content: `Question ${nextIndex + 1} of ${questions.length} (${nextQ.category.toUpperCase()}):\n\n${nextQ.question}`,
              questionId: nextQ.id,
              timestamp: new Date().toISOString(),
            },
          ]);
        }, 600);
      } else {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `interviewer-finish-${Date.now()}`,
              role: "interviewer",
              content: `🎉 That concludes our mock interview session! You have completed all ${questions.length} questions. You can now inspect your final Interview Readiness Report.`,
              timestamp: new Date().toISOString(),
            },
          ]);
          setIsReportModalOpen(true);
        }, 800);
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to process evaluation.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const readinessReport = calculateInterviewReadiness(evaluations);

  const filteredQuestions =
    selectedCategoryFilter === "all"
      ? questions
      : questions.filter((q) => q.category === selectedCategoryFilter);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Banner & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary border border-border text-foreground">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              AI Technical Interview Coach
            </h1>
            <p className="text-xs text-muted-foreground">
              Dynamic mock interview simulator and real-time 4-dimensional answer evaluation.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary/60 p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "video"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Recruiter</span>
            </button>
            <button
              onClick={() => setActiveTab("voice")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "voice"
                  ? "bg-card text-foreground shadow-2xs border border-border/80 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Mode</span>
            </button>
            <button
              onClick={() => setActiveTab("mock")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "mock"
                  ? "bg-card text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Chat Simulator
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "bank"
                  ? "bg-card text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Question Bank
            </button>
            <button
              onClick={() => {
                setActiveTab("report");
                setIsReportModalOpen(true);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "report"
                  ? "bg-card text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Readiness ({readinessReport.overallReadiness}%)
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 font-medium"
            onClick={loadQuestions}
            disabled={isLoadingQuestions}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuestions ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Reset Session</span>
          </Button>
        </div>
      </div>

      {/* Mode 1: Authentic AI Recruiter Video Interview Studio */}
      {activeTab === "video" && (
        <RealInterviewRoom
          resume={currentResume}
          targetRole={targetRole}
        />
      )}

      {/* Mode 2: AI Voice Interviewer Studio */}
      {activeTab === "voice" && (
        <VoiceInterviewStudio
          resume={currentResume}
          targetRole={targetRole}
        />
      )}

      {/* Mode 3: Chat Simulator & Question Bank Studio */}
      {activeTab !== "voice" && activeTab !== "video" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
        {/* Left Column: Context & Real-Time Performance (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Target Role & Source Resume */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Interview Context
            </h2>

            <div className="space-y-1">
              <Label className="text-[11px]">Active Resume</Label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full h-8 px-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-hidden"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px]">Target Role</Label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Real-time 4D Score Card */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Readiness Breakdown
              </h2>
              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {readinessReport.overallReadiness}%
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Technical Accuracy</span>
                  <span className="font-mono font-semibold text-foreground">
                    {readinessReport.averageScores.technicalAccuracy}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${readinessReport.averageScores.technicalAccuracy}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Communication Clarity</span>
                  <span className="font-mono font-semibold text-foreground">
                    {readinessReport.averageScores.communication}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${readinessReport.averageScores.communication}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Confidence & Tone</span>
                  <span className="font-mono font-semibold text-foreground">
                    {readinessReport.averageScores.confidence}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${readinessReport.averageScores.confidence}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Completeness & STAR Structure</span>
                  <span className="font-mono font-semibold text-foreground">
                    {readinessReport.averageScores.completeness}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${readinessReport.averageScores.completeness}%` }}
                  />
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold h-7.5"
              onClick={() => setIsReportModalOpen(true)}
            >
              View Full Report Card
            </Button>
          </div>
        </div>

        {/* Right Column: ChatGPT-Style Conversational View (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {activeTab === "mock" ? (
            <div className="rounded-2xl border border-border bg-card shadow-xs flex flex-col h-[700px] overflow-hidden">
              {/* Chat Header Status */}
              <div className="p-3 border-b border-border bg-secondary/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-foreground">Mock Technical Round</span>
                  <span className="text-muted-foreground">• {targetRole}</span>
                </div>

                <span className="text-[11px] font-mono font-semibold text-muted-foreground px-2 py-0.5 rounded bg-secondary">
                  Question {Math.min(currentQuestionIndex + 1, questions.length)} of {questions.length}
                </span>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
                {messages.map((msg) => {
                  const isAI = msg.role === "interviewer";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 text-xs leading-relaxed ${
                        isAI ? "items-start" : "items-start flex-row-reverse"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs font-bold ${
                          isAI
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      {/* Bubble */}
                      <div className={`space-y-3 max-w-[82%] sm:max-w-[78%]`}>
                        <div
                          className={`p-4 rounded-2xl ${
                            isAI
                              ? "bg-secondary/70 border border-border text-foreground rounded-tl-sm whitespace-pre-line"
                              : "bg-primary text-primary-foreground rounded-tr-sm"
                          }`}
                        >
                          {msg.content}
                        </div>

                        {/* Evaluation Card (if candidate message has evaluation) */}
                        {msg.evaluation && (
                          <div className={`p-4 rounded-xl border text-foreground space-y-3 shadow-2xs animate-in fade-in duration-300 ${
                            msg.evaluation.evaluationStatus === "insufficient-data"
                              ? "border-amber-500/30 bg-amber-500/5"
                              : msg.evaluation.evaluationStatus === "ai-unavailable"
                              ? "border-slate-500/30 bg-slate-500/5"
                              : "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
                          }`}>
                            <div className="flex items-center justify-between border-b border-border/60 pb-2">
                              <span className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                Evidence-Based Bar Raiser Evaluation
                              </span>
                              {msg.evaluation.evaluationStatus === "insufficient-data" ? (
                                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                  Insufficient Data
                                </span>
                              ) : msg.evaluation.evaluationStatus === "ai-unavailable" ? (
                                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-slate-500/20 text-slate-400">
                                  Evaluation Unavailable
                                </span>
                              ) : (
                                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                  Score: {msg.evaluation.overallScore}/100
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {msg.evaluation.feedback}
                            </p>

                            {/* Supporting Transcript Evidence */}
                            {msg.evaluation.supportingTranscript && (
                              <div className="p-2.5 rounded-lg bg-background/90 border border-border space-y-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                                  Evidence Cited:
                                </span>
                                <p className="font-mono text-[11px] text-foreground/90 italic">
                                  &ldquo;{msg.evaluation.supportingTranscript}&rdquo;
                                </p>
                              </div>
                            )}

                            {/* Strengths & Improvements */}
                            {(msg.evaluation.strengths.length > 0 || msg.evaluation.improvements.length > 0) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                {msg.evaluation.strengths.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 block">
                                      ✓ Key Strengths:
                                    </span>
                                    <ul className="space-y-0.5 text-muted-foreground list-disc pl-3">
                                      {msg.evaluation.strengths.map((s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {msg.evaluation.improvements.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="font-semibold text-amber-600 dark:text-amber-400 block">
                                      ⚡ Growth Opportunities:
                                    </span>
                                    <ul className="space-y-0.5 text-muted-foreground list-disc pl-3">
                                      {msg.evaluation.improvements.map((imp: string, i: number) => (
                                        <li key={i}>{imp}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Model Answer Accordion */}
                            <div className="pt-1 border-t border-border/60">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedModelAnswers((prev) => ({
                                    ...prev,
                                    [msg.id]: !prev[msg.id],
                                  }))
                                }
                                className="flex items-center justify-between w-full text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-1"
                              >
                                <span>Inspect Exemplar Model Answer</span>
                                {expandedModelAnswers[msg.id] ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>

                              {expandedModelAnswers[msg.id] && (
                                <div className="mt-2 p-3 rounded-lg bg-card border border-border text-xs text-foreground/90 leading-relaxed font-sans animate-in fade-in duration-200">
                                  {msg.evaluation.modelAnswer}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isEvaluating && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-xl bg-secondary/40 border border-border w-fit animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Bar Raiser is evaluating your answer across 4 dimensions...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-border bg-card">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAnswer();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={candidateInput}
                    onChange={(e) => setCandidateInput(e.target.value)}
                    placeholder="Type your interview response here (or use STAR format)..."
                    className="h-10 text-xs bg-secondary/30 focus-visible:ring-1"
                    disabled={isEvaluating}
                  />

                  <Button
                    type="submit"
                    variant="radiant"
                    size="sm"
                    className="h-10 px-4 font-semibold text-xs gap-1.5 shadow-2xs shrink-0"
                    disabled={!candidateInput.trim() || isEvaluating}
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            /* Tab: Question Bank Explorer */
            <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Interview Question Bank</h2>
                  <p className="text-xs text-muted-foreground">
                    Browse all generated questions tailored specifically to your resume.
                  </p>
                </div>

                {/* Category filter pills */}
                <div className="flex flex-wrap gap-1">
                  {(["all", "hr", "technical", "project", "behavioral"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold capitalize transition-colors ${
                        selectedCategoryFilter === cat
                          ? "bg-secondary text-foreground border border-border shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl border border-border bg-secondary/20 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-secondary text-foreground border border-border">
                        {q.category} • {q.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">Question #{idx + 1}</span>
                    </div>

                    <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                      {q.question}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Interviewer Intent: </span>
                      {q.intent}
                    </p>

                    {q.suggestedPoints && q.suggestedPoints.length > 0 && (
                      <div className="pt-2 border-t border-border/60">
                        <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Key Talking Points:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {q.suggestedPoints.map((pt, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-card border border-border text-foreground font-mono">
                              {pt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Final Readiness Score Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen} maxWidth="lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-foreground">
            <Trophy className="w-5 h-5 text-amber-500" />
            <DialogTitle>Interview Readiness Report Card</DialogTitle>
          </div>
          <DialogDescription>
            Comprehensive evaluation calculated from your mock interview responses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Overall Benchmark
              </span>
              <h3 className="text-2xl font-black text-foreground">
                {readinessReport.readinessLevel}
              </h3>
              <p className="text-xs text-muted-foreground">
                Based on {evaluations.length} evaluated interview questions.
              </p>
            </div>

            <div className="w-24 h-24 rounded-full border-4 border-emerald-500/80 bg-emerald-500/10 flex flex-col items-center justify-center shrink-0 shadow-lg">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {readinessReport.overallReadiness}
              </span>
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Score</span>
            </div>
          </div>

          {/* 4D Progress Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl border border-border bg-secondary/30">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Technical</span>
              <span className="text-base font-bold font-mono text-foreground">{readinessReport.averageScores.technicalAccuracy}%</span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-secondary/30">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Communication</span>
              <span className="text-base font-bold font-mono text-foreground">{readinessReport.averageScores.communication}%</span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-secondary/30">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Confidence</span>
              <span className="text-base font-bold font-mono text-foreground">{readinessReport.averageScores.confidence}%</span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-secondary/30">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Completeness</span>
              <span className="text-base font-bold font-mono text-foreground">{readinessReport.averageScores.completeness}%</span>
            </div>
          </div>

          {/* Strengths & Action Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 block">
                ⭐ Top Candidate Strengths:
              </span>
              <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                {readinessReport.topStrengths.length > 0 ? (
                  readinessReport.topStrengths.map((st, i) => <li key={i}>{st}</li>)
                ) : (
                  <li>Answer questions in mock mode to populate strengths.</li>
                )}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
              <span className="font-bold text-amber-700 dark:text-amber-300 block">
                🎯 Priority Growth Plan:
              </span>
              <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                {readinessReport.priorityImprovements.length > 0 ? (
                  readinessReport.priorityImprovements.map((imp, i) => <li key={i}>{imp}</li>)
                ) : (
                  <li>Practice framing answers using Situation-Task-Action-Result.</li>
                )}
              </ul>
            </div>
          </div>

          <Button
            type="button"
            variant="radiant"
            size="sm"
            className="w-full text-xs font-semibold h-8.5"
            onClick={() => setIsReportModalOpen(false)}
          >
            Continue Practice
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
