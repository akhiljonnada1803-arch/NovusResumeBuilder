"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VoiceInterviewStudio } from "@/components/voice-interview/VoiceInterviewStudio";
import { RealInterviewRoom } from "@/modules/interview";
import {
  InterviewCategory,
  InterviewQuestion,
  InterviewStage,
  INTERVIEW_STAGES,
  ConversationTurn,
  RecruiterPersonaId,
  RECRUITER_PERSONAS,
  RecruiterInternalState,
} from "@/modules/interview";
import {
  Bot,
  User,
  Sparkles,
  Send,
  Loader2,
  RefreshCw,
  Trophy,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  Sliders,
  Layers,
  Code2,
  Mic,
  Video,
  History,
  CheckCircle2,
  Zap,
  BookOpen,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkle,
} from "lucide-react";

type InterviewMode = "hub" | "video" | "voice" | "mock" | "bank";

export default function InterviewCoachPage() {
  const { success, error: showErrorToast } = useToast();
  const resumes = useResumeStore((state) => state.resumes);
  const activeResumeId = useResumeStore((state) => state.activeResumeId);

  const selectedResume =
    resumes.find((r) => r.id === activeResumeId) || resumes[0];

  const [selectedResumeId, setSelectedResumeId] = useState(selectedResume?.id || "");
  const currentResume = resumes.find((r) => r.id === selectedResumeId) || selectedResume;

  const [activeTab, setActiveTab] = useState<InterviewMode>("hub");
  const [targetRole, setTargetRole] = useState(currentResume?.personalInfo?.jobTitle || "Senior Software Engineer");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<InterviewCategory | "all">("all");
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);

  // Question Bank State
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Conversational Chat AI State
  const [chatPersonaId, setChatPersonaId] = useState<RecruiterPersonaId>("tech-lead");
  const [chatStage, setChatStage] = useState<InterviewStage>("intro");
  const [chatTurns, setChatTurns] = useState<ConversationTurn[]>([]);
  const [chatRecruiterNotes, setChatRecruiterNotes] = useState<{ note: string; stage: string }[]>([]);
  const [isChatEvaluating, setIsChatEvaluating] = useState(false);
  const [chatCandidateInput, setChatCandidateInput] = useState("");
  const [chatLatestInternalState, setChatLatestInternalState] = useState<RecruiterInternalState | null>(null);

  // Final Readiness Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatTurns, isChatEvaluating]);

  // Load tailored questions for Question Bank
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

      setQuestions(data.questions || []);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to initialize interview questions.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedResumeId]);

  // Start Conversational Chat Session (Calls /api/interview/chat-turn with empty candidate answer for opener)
  const startChatSession = async (persona: RecruiterPersonaId = chatPersonaId) => {
    if (!currentResume) return;
    setIsChatEvaluating(true);
    setChatStage("intro");
    setChatTurns([]);
    setChatRecruiterNotes([]);
    setChatLatestInternalState(null);

    try {
      const res = await fetch("/api/interview/chat-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: persona,
          stage: "intro",
          history: [],
          candidateAnswer: "",
          recruiterNotes: [],
          resume: currentResume,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize recruiter.");

      const greetingTurn: ConversationTurn = {
        id: `turn-init-${Date.now()}`,
        speaker: "recruiter",
        stage: "intro",
        text: data.recruiterResponse || RECRUITER_PERSONAS[persona].sampleGreeting,
        timestamp: new Date().toISOString(),
        recruiterReaction: data.activeEmotion || `${RECRUITER_PERSONAS[persona].name} started the session`,
        recruiterEmotionEmoji: data.emotionEmoji || "👋",
        recruiterInternalState: data.internalState,
        evaluationSnippet: data.instantFeedback ? { score: data.instantScore || 85, feedback: data.instantFeedback } : undefined,
      };

      setChatTurns([greetingTurn]);
      if (data.internalState) setChatLatestInternalState(data.internalState);
      if (data.suggestedNextStage) setChatStage(data.suggestedNextStage);
      if (data.recruiterLiveNote) {
        setChatRecruiterNotes([{ note: data.recruiterLiveNote, stage: "intro" }]);
      }
    } catch (err: any) {
      showErrorToast(err.message || "Could not reach recruiter AI; starting in offline practice mode.");
      const fallbackPersona = RECRUITER_PERSONAS[persona];
      setChatTurns([
        {
          id: `turn-fallback-${Date.now()}`,
          speaker: "recruiter",
          stage: "intro",
          text: fallbackPersona.sampleGreeting,
          timestamp: new Date().toISOString(),
          recruiterReaction: `${fallbackPersona.name} is welcoming you to the session`,
          recruiterEmotionEmoji: "👋",
        },
      ]);
    } finally {
      setIsChatEvaluating(false);
    }
  };

  // Submit Candidate Chat Turn & Receive Dynamic Adaptive Recruiter Follow-up
  const handleSendChatTurn = async () => {
    if (!chatCandidateInput.trim() || isChatEvaluating || !currentResume) return;

    const userText = chatCandidateInput.trim();
    setChatCandidateInput("");

    // 1. Append candidate turn
    const candidateTurn: ConversationTurn = {
      id: `cand-${Date.now()}`,
      speaker: "candidate",
      stage: chatStage,
      text: userText,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...chatTurns, candidateTurn];
    setChatTurns(updatedHistory);
    setIsChatEvaluating(true);

    try {
      // 2. Call conversational turn engine
      const res = await fetch("/api/interview/chat-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: chatPersonaId,
          stage: chatStage,
          history: updatedHistory,
          candidateAnswer: userText,
          recruiterNotes: chatRecruiterNotes,
          resume: currentResume,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process interview response.");

      // 3. Append recruiter turn
      const recruiterTurn: ConversationTurn = {
        id: `rec-${Date.now()}`,
        speaker: "recruiter",
        stage: data.suggestedNextStage || chatStage,
        text: data.recruiterResponse,
        timestamp: new Date().toISOString(),
        recruiterReaction: data.activeEmotion,
        recruiterEmotionEmoji: data.emotionEmoji,
        recruiterInternalState: data.internalState,
        evaluationSnippet: data.instantFeedback
          ? {
              score: data.instantScore || 80,
              feedback: data.instantFeedback,
            }
          : undefined,
      };

      setChatTurns((prev) => [...prev, recruiterTurn]);
      if (data.internalState) setChatLatestInternalState(data.internalState);
      if (data.suggestedNextStage) setChatStage(data.suggestedNextStage);
      if (data.recruiterLiveNote) {
        setChatRecruiterNotes((prev) => [...prev, { note: data.recruiterLiveNote, stage: chatStage }]);
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to process turn.");
    } finally {
      setIsChatEvaluating(false);
    }
  };

  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(id);
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  // Dynamic 4D Readiness Calculation from conversational turns
  const calculateDynamicReadiness = () => {
    const scoredTurns = chatTurns.filter((t) => t.speaker === "recruiter" && t.evaluationSnippet?.score);
    const candidateTurns = chatTurns.filter((t) => t.speaker === "candidate");

    if (candidateTurns.length === 0) {
      return {
        overallReadiness: 0,
        readinessLevel: "Session Starting",
        totalTurns: 0,
        averageScores: {
          technicalAccuracy: 0,
          communication: 0,
          confidence: 0,
          completeness: 0,
        },
        strengths: [],
        improvements: ["Respond to the interviewer's opening inquiry to calibrate 4D scores."],
      };
    }

    const avgScore = scoredTurns.length > 0
      ? Math.round(scoredTurns.reduce((acc, t) => acc + (t.evaluationSnippet?.score || 80), 0) / scoredTurns.length)
      : 78;

    const confidenceMetric = chatLatestInternalState?.confidenceLevel || 80;
    const interestMetric = chatLatestInternalState?.interestLevel || 85;

    const technical = Math.min(98, Math.max(50, Math.round(avgScore * 0.9 + 5)));
    const communication = Math.min(98, Math.max(50, Math.round(confidenceMetric * 0.6 + avgScore * 0.4)));
    const confidence = Math.min(98, Math.max(50, Math.round(confidenceMetric * 0.7 + interestMetric * 0.3)));
    const completeness = Math.min(98, Math.max(50, Math.round(avgScore * 0.85 + Math.min(candidateTurns.length * 3, 15))));

    const overall = Math.round(technical * 0.35 + communication * 0.25 + confidence * 0.2 + completeness * 0.2);

    let readinessLevel = "Solid Candidate";
    if (overall >= 88) readinessLevel = "FAANG / Tier-1 Ready";
    else if (overall >= 75) readinessLevel = "Solid Candidate";
    else if (overall >= 60) readinessLevel = "Needs Moderate Preparation";
    else readinessLevel = "High Risk";

    const strengths = scoredTurns.map((t) => t.evaluationSnippet!.feedback).slice(0, 3);
    const improvements = [
      "Quantify scale and throughput metrics (QPS, p99 latency) when discussing systems.",
      "Articulate trade-offs between chosen architectural patterns and simpler alternatives.",
    ];

    return {
      overallReadiness: overall,
      readinessLevel,
      totalTurns: candidateTurns.length,
      averageScores: {
        technicalAccuracy: technical,
        communication,
        confidence,
        completeness,
      },
      strengths: strengths.length > 0 ? strengths : ["Clear communication style", "Solid fundamental reasoning"],
      improvements,
    };
  };

  const readinessReport = calculateDynamicReadiness();
  const currentPersona = RECRUITER_PERSONAS[chatPersonaId] || RECRUITER_PERSONAS["tech-lead"];
  const currentStageInfo = INTERVIEW_STAGES.find((s) => s.id === chatStage) || INTERVIEW_STAGES[0];

  const filteredQuestions =
    selectedCategoryFilter === "all"
      ? questions
      : questions.filter((q) => q.category === selectedCategoryFilter);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      {/* 1. Header Hero Card with Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-secondary/30 p-5 sm:p-6 shadow-sm backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left info */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                Novus AI Bar Raiser Suite v1.1
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                BYOK Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              AI Interview Coach & Studio
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Select your preferred interview mode below. Practice in an authentic live video room, high-speed conversational voice mode, interactive text chat with 4D scoring, or study the tailored question bank.
            </p>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            <Link href="/interview-coach/history">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3.5 text-xs font-semibold gap-1.5 rounded-xl border-border bg-card/80 hover:bg-secondary/60 hover:text-foreground transition-all shadow-xs"
              >
                <History className="w-3.5 h-3.5 text-primary" />
                <span>Session History</span>
              </Button>
            </Link>

            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3.5 text-xs font-semibold gap-1.5 rounded-xl border-border bg-card/80 hover:bg-secondary/60 transition-all shadow-xs"
              onClick={loadQuestions}
              disabled={isLoadingQuestions}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuestions ? "animate-spin text-primary" : "text-muted-foreground"}`} />
              <span>{isLoadingQuestions ? "Regenerating..." : "Regenerate Qs"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Bar (When inside a specific mode, showing Back button & Mode Switcher) */}
      {activeTab !== "hub" && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-card border border-border/80 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("hub")}
              className="h-9 px-3 text-xs font-bold gap-1.5 rounded-xl hover:bg-secondary text-foreground cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
              <span>All Modes</span>
            </Button>

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Mode Switcher Buttons */}
            <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-xl border border-border/60">
              <button
                onClick={() => setActiveTab("video")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "video"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Video className="w-3.5 h-3.5 text-indigo-500" />
                <span>Video</span>
              </button>

              <button
                onClick={() => setActiveTab("voice")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "voice"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-emerald-500" />
                <span>Voice</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("mock");
                  if (chatTurns.length === 0) startChatSession();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "mock"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                <span>Chat</span>
              </button>

              <button
                onClick={() => setActiveTab("bank")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "bank"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Bank</span>
              </button>
            </div>
          </div>

          {/* Readiness Report Trigger */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl bg-secondary/50 border border-border hover:border-emerald-500/40 transition-all cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-muted-foreground">Readiness:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {readinessReport.overallReadiness}%
            </span>
          </button>
        </div>
      )}

      {/* 3. The 4 Mode Boxes (Landing / Hub View) */}
      {activeTab === "hub" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Context Setup Bar */}
          <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground shrink-0">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Session Setup:</span>
              </div>

              {/* Resume Selector */}
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="h-9 px-3 rounded-xl border border-border bg-secondary/40 text-xs text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-primary transition-all w-full sm:w-64"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.personalInfo?.fullName || "Resume"})
                  </option>
                ))}
              </select>

              {/* Target Role */}
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Target Role (e.g. Senior Frontend Engineer)"
                className="h-9 text-xs rounded-xl bg-secondary/40 w-full sm:w-64"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-muted-foreground font-mono">
                {questions.length} Questions Prepared
              </span>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Readiness: {readinessReport.overallReadiness}%</span>
              </button>
            </div>
          </div>

          {/* Grid of the 4 Main Interactive Mode Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Box 1: Video Recruiter */}
            <div
              onClick={() => setActiveTab("video")}
              className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:border-indigo-500/50 hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Live Video Room
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-foreground group-hover:text-indigo-500 transition-colors flex items-center gap-2">
                    Video Recruiter Studio
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Full face-to-face simulation with an interactive AI Recruiter avatar, eye contact tracking, camera permissions, and live conversational turns.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Real-time speech recognition & avatar responses</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Behavioral integrity & eye contact analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Pre-call lobby with camera/mic hardware checks</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Enter Video Studio</span>
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Box 2: Voice Interviewer */}
            <div
              onClick={() => setActiveTab("voice")}
              className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:border-emerald-500/50 hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Mic className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Speech-to-Speech
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-foreground group-hover:text-emerald-500 transition-colors flex items-center gap-2">
                    AI Voice Interviewer
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Ultra-low latency phone screen & audio simulation. Speak naturally into your microphone with automated Voice Activity Detection (VAD).
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Hands-free voice detection & natural audio synthesis</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Live wave visualizer with conversational turns</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Instant speech clarity and tone metrics</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Start Voice Session</span>
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Box 3: Chat Simulator */}
            <div
              onClick={() => {
                setActiveTab("mock");
                if (chatTurns.length === 0) startChatSession();
              }}
              className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:border-blue-500/50 hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Conversational AI Turn Engine
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-foreground group-hover:text-blue-500 transition-colors flex items-center gap-2">
                    Chat & Bar Raiser Simulator
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Realistic, unscripted technical & behavioral simulation. The Bar Raiser adapts dynamically to your specific project choices, asks incisive follow-ups, and tracks 4D scores.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Dynamic follow-ups on architectural trade-offs</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Real-time emotion & internal concern gauges</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Selectable personas (Tech Lead, Bar Raiser, Founder)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Launch Chat Round</span>
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Box 4: Question Bank Explorer */}
            <div
              onClick={() => setActiveTab("bank")}
              className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:border-amber-500/50 hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Tailored Repository
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-foreground group-hover:text-amber-500 transition-colors flex items-center gap-2">
                    Targeted Question Bank
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Browse custom-generated questions extracted from your resume experience and target job title with interviewer intent and talking points.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Filter by HR, Technical, Project, and Behavioral</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Interviewer intent notes and recommended talking points</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>One-click copy to clipboard for offline practice</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Explore Questions</span>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Active Studio Renderings (When a box is clicked) */}

      {/* Mode A: Video Recruiter */}
      {activeTab === "video" && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <RealInterviewRoom
            resume={currentResume}
            targetRole={targetRole}
          />
        </div>
      )}

      {/* Mode B: Voice Interviewer */}
      {activeTab === "voice" && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <VoiceInterviewStudio
            resume={currentResume}
            targetRole={targetRole}
          />
        </div>
      )}

      {/* Mode C: Conversational Chat Simulator & Question Bank Studio */}
      {activeTab !== "hub" && activeTab !== "voice" && activeTab !== "video" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Context & Real-Time Performance (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Target Role & Source Resume Card */}
            <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  Interview Context
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  Customizable
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">Active Resume Source</Label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-secondary/30 text-xs text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-primary transition-all"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.personalInfo?.fullName || "Untitled"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80">Target Position / Role</Label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="h-9 text-xs rounded-xl bg-secondary/30"
                />
              </div>

              {/* Persona Selector for Chat Simulator */}
              {activeTab === "mock" && (
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <Label className="text-xs font-semibold text-foreground/80">Interviewer Persona</Label>
                  <select
                    value={chatPersonaId}
                    onChange={(e) => {
                      const newPersona = e.target.value as RecruiterPersonaId;
                      setChatPersonaId(newPersona);
                      startChatSession(newPersona);
                    }}
                    className="w-full h-9 px-3 rounded-xl border border-border bg-secondary/30 text-xs text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-primary transition-all"
                  >
                    {Object.values(RECRUITER_PERSONAS).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.title})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Real-time 4D Score Card */}
            <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      4D Bar Raiser Radar
                    </h2>
                    <p className="text-[10px] text-muted-foreground">Live rubric metric tracking</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {readinessReport.overallReadiness}%
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Overall
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                {/* 1. Technical Accuracy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                      <Code2 className="w-3 h-3 text-blue-500" />
                      Technical Depth
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {readinessReport.averageScores.technicalAccuracy}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-700"
                      style={{ width: `${readinessReport.averageScores.technicalAccuracy}%` }}
                    />
                  </div>
                </div>

                {/* 2. Communication Clarity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-emerald-500" />
                      Communication & STAR
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {readinessReport.averageScores.communication}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${readinessReport.averageScores.communication}%` }}
                    />
                  </div>
                </div>

                {/* 3. Confidence & Tone */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-purple-500" />
                      Engineering Rigor
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {readinessReport.averageScores.confidence}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full transition-all duration-700"
                      style={{ width: `${readinessReport.averageScores.confidence}%` }}
                    />
                  </div>
                </div>

                {/* 4. Completeness & STAR Structure */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-amber-500" />
                      System Completeness
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {readinessReport.averageScores.completeness}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700"
                      style={{ width: `${readinessReport.averageScores.completeness}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recruiter Live Notes (if any recorded during interview) */}
              {chatRecruiterNotes.length > 0 && (
                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                    Interviewer Live Notes ({chatRecruiterNotes.length})
                  </span>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {chatRecruiterNotes.map((n, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground italic bg-secondary/30 p-2 rounded-lg border border-border/50">
                        &bull; {n.note}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold h-9 rounded-xl border-border bg-secondary/30 hover:bg-secondary transition-all cursor-pointer"
                onClick={() => setIsReportModalOpen(true)}
              >
                Inspect Full Report Card
              </Button>
            </div>
          </div>

          {/* Right Column: Conversational AI Simulator View (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            {activeTab === "mock" ? (
              <div className="rounded-3xl border border-border/80 bg-card shadow-sm flex flex-col h-[740px] overflow-hidden backdrop-blur-sm">
                {/* Chat Header Status Bar */}
                <div className="p-4 border-b border-border/80 bg-secondary/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping absolute top-0 left-0 opacity-75" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block relative" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground">{currentPersona.name}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${currentPersona.badgeClass}`}>
                          {currentPersona.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {currentPersona.company} &bull; {currentPersona.toneDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-card border border-border text-foreground">
                      {currentStageInfo.shortLabel}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startChatSession()}
                      disabled={isChatEvaluating}
                      className="h-7 px-2.5 text-[11px] font-bold rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground gap-1"
                      title="Restart Interview Session"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restart</span>
                    </Button>
                  </div>
                </div>

                {/* Conversational Turns Stream */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
                  {chatTurns.map((turn) => {
                    const isRecruiter = turn.speaker === "recruiter";
                    return (
                      <div
                        key={turn.id}
                        className={`flex gap-3 text-xs leading-relaxed animate-in fade-in duration-300 ${
                          isRecruiter ? "items-start" : "items-start flex-row-reverse"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs font-bold text-xs ${
                            isRecruiter
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-border"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {isRecruiter ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>

                        {/* Bubble & Insights Container */}
                        <div className="space-y-2.5 max-w-[85%] sm:max-w-[80%]">
                          {/* Recruiter Header info */}
                          {isRecruiter && (
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="font-bold text-foreground">{currentPersona.name}</span>
                              {turn.recruiterReaction && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/80 text-[10px] text-muted-foreground border border-border/60">
                                  <span>{turn.recruiterEmotionEmoji || "💬"}</span>
                                  <span>{turn.recruiterReaction}</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Message Text Bubble */}
                          <div
                            className={`p-4 rounded-2xl shadow-2xs ${
                              isRecruiter
                                ? "bg-secondary/70 border border-border/80 text-foreground rounded-tl-xs whitespace-pre-line leading-relaxed font-sans"
                                : "bg-primary text-primary-foreground rounded-tr-xs leading-relaxed"
                            }`}
                          >
                            {turn.text}
                          </div>

                          {/* Live Evaluation Snippet (on recruiter follow-up turns) */}
                          {turn.evaluationSnippet && (
                            <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-foreground space-y-1.5 shadow-2xs animate-in fade-in duration-200">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                  <Sparkle className="w-3.5 h-3.5" />
                                  Turn Assessment
                                </span>
                                {turn.evaluationSnippet.score > 0 && (
                                  <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                    Score: {turn.evaluationSnippet.score}/100
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {turn.evaluationSnippet.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing / Evaluating Indicator */}
                  {isChatEvaluating && (
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground p-3.5 rounded-2xl bg-secondary/50 border border-border/80 w-fit animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>{currentPersona.name} is evaluating your technical depth & formulating follow-ups...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Bar */}
                <div className="p-3.5 border-t border-border/80 bg-card space-y-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatTurn();
                    }}
                    className="flex items-center gap-2.5"
                  >
                    <Input
                      value={chatCandidateInput}
                      onChange={(e) => setChatCandidateInput(e.target.value)}
                      placeholder={`Reply to ${currentPersona.name} (discuss architectures, trade-offs, metrics)...`}
                      className="h-11 text-xs bg-secondary/30 rounded-xl focus-visible:ring-1"
                      disabled={isChatEvaluating}
                    />

                    <Button
                      type="submit"
                      variant="radiant"
                      size="sm"
                      className="h-11 px-5 font-bold text-xs gap-2 rounded-xl shadow-xs shrink-0 cursor-pointer"
                      disabled={!chatCandidateInput.trim() || isChatEvaluating}
                    >
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </form>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Tip: Press <kbd className="font-mono bg-secondary px-1 py-0.5 rounded-md border text-[9px]">Enter</kbd> to submit. Proactively cite trade-offs, architecture decisions, and metrics.
                  </p>
                </div>
              </div>
            ) : (
              /* Tab: Question Bank Explorer */
              <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Tailored Question Bank
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Browse custom-generated interview questions customized for {targetRole}.
                    </p>
                  </div>

                  {/* Category filter pills */}
                  <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-secondary/40 border border-border/60">
                    {(["all", "hr", "technical", "project", "behavioral"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                          selectedCategoryFilter === cat
                            ? "bg-card text-foreground border border-border shadow-xs scale-[1.02]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredQuestions.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-border/80 text-muted-foreground text-xs">
                      No questions found in this category. Click &ldquo;Regenerate Qs&rdquo; to reload.
                    </div>
                  ) : (
                    filteredQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="group p-5 rounded-2xl border border-border/80 bg-secondary/15 hover:bg-secondary/30 transition-all space-y-3 hover:border-primary/30"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border">
                              {q.category}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {q.difficulty}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>
                            <button
                              onClick={() => handleCopyQuestion(q.id, q.question)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border transition-all"
                              title="Copy Question"
                            >
                              {copiedQuestionId === q.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <h3 className="font-bold text-sm text-foreground leading-snug">
                          {q.question}
                        </h3>

                        <p className="text-xs text-muted-foreground">
                          <span className="font-bold text-foreground">Interviewer Intent: </span>
                          {q.intent}
                        </p>

                        {q.suggestedPoints && q.suggestedPoints.length > 0 && (
                          <div className="pt-2.5 border-t border-border/60">
                            <span className="text-[11px] font-bold text-muted-foreground block mb-1.5">
                              Recommended Talking Points:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {q.suggestedPoints.map((pt, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-2.5 py-1 rounded-lg bg-card border border-border text-foreground font-mono"
                                >
                                  {pt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Final Readiness Score Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen} maxWidth="lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-foreground">
            <Trophy className="w-5 h-5 text-amber-500" />
            <DialogTitle>Interview Readiness Report Card</DialogTitle>
          </div>
          <DialogDescription>
            Comprehensive Bar Raiser analytics calculated from your simulation responses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Top Score Banner */}
          <div className="p-6 rounded-3xl border border-border bg-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Overall Candidate Benchmark
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                {readinessReport.readinessLevel}
              </h3>
              <p className="text-xs text-muted-foreground">
                Synthesized across {readinessReport.totalTurns} conversational responses for {targetRole}.
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
            <div className="p-3.5 rounded-2xl border border-border bg-secondary/30">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Technical</span>
              <span className="text-lg font-black font-mono text-foreground">{readinessReport.averageScores.technicalAccuracy}%</span>
            </div>
            <div className="p-3.5 rounded-2xl border border-border bg-secondary/30">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Communication</span>
              <span className="text-lg font-black font-mono text-foreground">{readinessReport.averageScores.communication}%</span>
            </div>
            <div className="p-3.5 rounded-2xl border border-border bg-secondary/30">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Engineering Rigor</span>
              <span className="text-lg font-black font-mono text-foreground">{readinessReport.averageScores.confidence}%</span>
            </div>
            <div className="p-3.5 rounded-2xl border border-border bg-secondary/30">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Completeness</span>
              <span className="text-lg font-black font-mono text-foreground">{readinessReport.averageScores.completeness}%</span>
            </div>
          </div>

          {/* Strengths & Action Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2.5">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Top Candidate Strengths:
              </span>
              <ul className="space-y-1.5 text-muted-foreground list-disc pl-4">
                {readinessReport.strengths.length > 0 ? (
                  readinessReport.strengths.map((st, i) => <li key={i}>{st}</li>)
                ) : (
                  <li>Answer conversational prompts to populate strengths.</li>
                )}
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-2.5">
              <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Priority Growth Plan:
              </span>
              <ul className="space-y-1.5 text-muted-foreground list-disc pl-4">
                {readinessReport.improvements.length > 0 ? (
                  readinessReport.improvements.map((imp, i) => <li key={i}>{imp}</li>)
                ) : (
                  <li>Practice framing answers using Situation-Task-Action-Result and system trade-offs.</li>
                )}
              </ul>
            </div>
          </div>

          <Button
            type="button"
            variant="radiant"
            size="sm"
            className="w-full text-xs font-bold h-10 rounded-xl shadow-xs cursor-pointer"
            onClick={() => setIsReportModalOpen(false)}
          >
            Continue Practice Session
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
