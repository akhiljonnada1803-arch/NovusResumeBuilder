"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  VoiceInterviewType,
  VoiceTurn,
  VoiceInterviewSession,
  VoiceSettings,
  INTERVIEW_TYPES_CATALOG,
} from "@/types/voice-interview";
import { Resume } from "@/types/resume";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  globalVoiceEngine,
  DEFAULT_VOICE_SETTINGS,
  VoicePipelineState,
} from "@/lib/voice/voice-engine";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { VoiceSettingsModal } from "./VoiceSettingsModal";
import { VoiceFeedbackDashboard } from "./VoiceFeedbackDashboard";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  Square,
  Send,
  Loader2,
  CheckCircle2,
  Settings,
  RotateCcw,
  FileText,
  ShieldCheck,
  Award,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Flame,
  BrainCircuit,
  MessageSquare,
  UserCheck,
  Code2,
  Layers,
  BarChart3,
  Target,
  Edit3,
} from "lucide-react";

interface VoiceInterviewStudioProps {
  resume?: Resume | null;
  targetRole?: string;
}

export function VoiceInterviewStudio({
  resume,
  targetRole = "Senior Software Engineer",
}: VoiceInterviewStudioProps) {
  const { success, error: showErrorToast } = useToast();

  // Session State
  const [selectedType, setSelectedType] = useState<VoiceInterviewType>("technical");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [completedSession, setCompletedSession] = useState<VoiceInterviewSession | null>(null);

  // Turn Flow
  const [currentTurnNumber, setCurrentTurnNumber] = useState(1);
  const totalTurns = 4;
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [pipelineState, setPipelineState] = useState<VoicePipelineState>("IDLE");

  // Voice & Audio States
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [liveVolumeRms, setLiveVolumeRms] = useState(0);

  // Keep references to submit handler so silence callback always uses latest state
  const submitAnswerRef = useRef<(textOverride?: string) => Promise<void>>(async () => {});

  // Initialize VAD & State Machine listeners
  useEffect(() => {
    const unsubState = globalVoiceEngine.onStateChange((state) => {
      setPipelineState(state);
    });

    globalVoiceEngine.onVolumeChange((rms) => {
      setLiveVolumeRms(rms);
    });

    globalVoiceEngine.onEndOfSpeech((finalTranscript) => {
      if (finalTranscript && finalTranscript.trim().length > 0) {
        submitAnswerRef.current(finalTranscript);
      }
    });

    return () => {
      globalVoiceEngine.stopSpeaking();
      globalVoiceEngine.stopListening();
    };
  }, []);

  // 1. Start Mock Interview Session
  const handleStartSession = async (type: VoiceInterviewType = selectedType) => {
    setSelectedType(type);
    setIsSessionActive(true);
    setSessionCompleted(false);
    setTurns([]);
    setCurrentTurnNumber(1);
    setCurrentTranscript("");

    try {
      const res = await fetch("/api/voice-interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewType: type,
          resume,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start interview.");

      setCurrentQuestion(data.openingQuestion);

      // Auto-vocalize opening question with automatic transition to LISTENING
      if (voiceSettings.autoSpeak) {
        setTimeout(async () => {
          await globalVoiceEngine.speak(data.openingQuestion, voiceSettings);
          // AI finishes speaking -> Automatically transition to LISTENING with VAD!
          await globalVoiceEngine.startListening(
            (transcript) => {
              setCurrentTranscript(transcript);
            }
          );
        }, 300);
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to initialize voice interview.");
      setIsSessionActive(false);
    }
  };

  // 2. Vocalize Current Question
  const handleSpeakQuestion = async () => {
    if (!currentQuestion) return;
    if (pipelineState === "AI_SPEAKING") {
      globalVoiceEngine.stopSpeaking();
    } else {
      await globalVoiceEngine.speak(currentQuestion, voiceSettings);
      await globalVoiceEngine.startListening((transcript) => {
        setCurrentTranscript(transcript);
      });
    }
  };

  // 3. Toggle Microphone Recording Manual Override
  const handleToggleMic = async () => {
    if (pipelineState === "LISTENING" || pipelineState === "USER_SPEAKING") {
      globalVoiceEngine.stopListening();
    } else {
      globalVoiceEngine.stopSpeaking();
      const started = await globalVoiceEngine.startListening((transcript) => {
        setCurrentTranscript(transcript);
      });

      if (!started) {
        showErrorToast("Microphone access is not supported in this browser. You can type your response.");
      }
    }
  };

  // 4. Submit Spoken Response for Real-Time 4D Evaluation
  const handleSubmitAnswer = async (textOverride?: string) => {
    const answerText = (textOverride || currentTranscript).trim();
    if (!answerText) {
      showErrorToast("Please speak into your microphone or type a response first.");
      return;
    }

    globalVoiceEngine.stopListening();
    globalVoiceEngine.stopSpeaking();

    try {
      const res = await fetch("/api/voice-interview/evaluate-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewType: selectedType,
          question: currentQuestion,
          answer: answerText,
          turnNumber: currentTurnNumber,
          totalTurns,
          resume,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate turn.");

      const turnRecord: VoiceTurn = {
        id: `turn_${Date.now()}`,
        turnNumber: currentTurnNumber,
        interviewerQuestion: currentQuestion,
        candidateTranscript: answerText,
        evaluation: data.evaluation,
        timestamp: new Date().toISOString(),
      };

      const updatedTurns = [...turns, turnRecord];
      setTurns(updatedTurns);
      setCurrentTranscript("");
      setIsEditingTranscript(false);

      // Check if more turns remain
      if (currentTurnNumber < totalTurns && data.evaluation?.followUpQuestion) {
        const nextQ = data.evaluation.followUpQuestion;
        setCurrentQuestion(nextQ);
        setCurrentTurnNumber((prev) => prev + 1);

        if (voiceSettings.autoSpeak) {
          setTimeout(async () => {
            await globalVoiceEngine.speak(nextQ, voiceSettings);
            // AI finishes speaking -> automatically start listening
            await globalVoiceEngine.startListening((transcript) => {
              setCurrentTranscript(transcript);
            });
          }, 400);
        }
        success(`Question ${currentTurnNumber} evaluated! Recruiter is following up.`);
      } else {
        // Complete the session
        await handleFinishSession(updatedTurns);
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to evaluate answer.");
    }
  };

  // Keep ref synchronized
  submitAnswerRef.current = handleSubmitAnswer;

  // 5. Finalize Session & Compute Comprehensive Feedback
  const handleFinishSession = async (finalTurns: VoiceTurn[] = turns) => {
    globalVoiceEngine.stopSpeaking();
    globalVoiceEngine.stopListening();

    try {
      const res = await fetch("/api/voice-interview/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turns: finalTurns,
          interviewType: selectedType,
          candidateName: resume?.personalInfo?.fullName || "Candidate",
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report.");

      setCompletedSession(data.report);
      setSessionCompleted(true);
      setIsSessionActive(false);
      success("Voice interview completed! Inspect your readiness report.");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to complete session.");
    }
  };

  // If completed, show Executive Feedback Dashboard
  if (sessionCompleted && completedSession) {
    return (
      <VoiceFeedbackDashboard
        session={completedSession}
        onRestart={() => {
          setSessionCompleted(false);
          setIsSessionActive(false);
        }}
      />
    );
  }

  const isMicActive = pipelineState === "LISTENING" || pipelineState === "USER_SPEAKING";

  return (
    <div className="space-y-6">
      {/* View 1: Interview Type Picker (When session not active) */}
      {!isSessionActive && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI VOICE INTERVIEW SIMULATOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Select Your Voice Mock Interview Round
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Experience authentic speech-based mock interviews with Voice Activity Detection (VAD), dynamic follow-ups, and auto-submit on silence.
            </p>
          </div>

          {/* 6 Interview Type Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTERVIEW_TYPES_CATALOG.map((cat) => {
              const isSelected = selectedType === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedType(cat.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-4 flex flex-col justify-between ${
                    isSelected
                      ? "bg-card border-primary ring-2 ring-primary/20 shadow-lg scale-[1.01]"
                      : "bg-card/70 border-border hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs hover:scale-[1.005]"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${cat.badgeColor}`}>
                        {cat.shortTitle}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">4 Questions</span>
                    </div>

                    <h3 className="font-bold text-base text-foreground">{cat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/60">
                    <div className="flex flex-wrap gap-1">
                      {cat.focusAreas.map((f, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-foreground">
                          {f}
                        </span>
                      ))}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant={isSelected ? "radiant" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartSession(cat.id);
                      }}
                      className="w-full h-8 text-xs font-bold gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start {cat.shortTitle} Round</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 2: Active Voice Interview Studio Room */}
      {isSessionActive && (
        <div className="rounded-3xl border border-border bg-card shadow-lg p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-primary tracking-wider block">
                  Round: {selectedType.toUpperCase()} • Question {currentTurnNumber} of {totalTurns}
                </span>
                <h3 className="text-sm font-bold text-foreground">{targetRole} Mock Interview</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsSettingsOpen(true)}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voice Settings</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFinishSession()}
                className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                End Session
              </Button>
            </div>
          </div>

          {/* Central Animated Voice Visualizer (VAD 5-Stage) */}
          <VoiceVisualizer
            state={pipelineState}
            volumeRms={liveVolumeRms}
          />

          {/* Spoken Question Banner */}
          <div className="p-5 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-primary uppercase flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Interviewer Question #{currentTurnNumber}
              </span>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleSpeakQuestion}
                className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10 gap-1"
              >
                {pipelineState === "AI_SPEAKING" ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span>{pipelineState === "AI_SPEAKING" ? "Mute Voice" : "Replay Audio"}</span>
              </Button>
            </div>

            <p className="text-sm sm:text-base font-bold text-foreground leading-relaxed">
              &ldquo;{currentQuestion}&rdquo;
            </p>
          </div>

          {/* Candidate Speech-to-Text Response Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-emerald-500" />
                Your Live Spoken Response
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                  className="text-[11px] text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingTranscript ? "Done Editing" : "Edit Transcript"}</span>
                </button>
              </div>
            </div>

            {isEditingTranscript ? (
              <Textarea
                rows={4}
                value={currentTranscript}
                onChange={(e) => setCurrentTranscript(e.target.value)}
                placeholder="Type or edit your response..."
                className="text-xs font-sans leading-relaxed"
              />
            ) : (
              <div className="p-4 rounded-2xl border border-border bg-secondary/30 min-h-[90px] flex items-center justify-center text-center">
                {currentTranscript ? (
                  <p className="text-xs sm:text-sm text-foreground italic leading-relaxed text-left w-full">
                    &ldquo;{currentTranscript}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {pipelineState === "AI_SPEAKING"
                      ? "Listening paused while recruiter is speaking..."
                      : pipelineState === "PROCESSING"
                      ? "Recruiter is analyzing your response..."
                      : isMicActive
                      ? "Speak your response. The engine will auto-submit 2 seconds after you finish."
                      : "Click 'Start Speaking' to begin recording."}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Main Interaction Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isMicActive ? "destructive" : "outline"}
                onClick={handleToggleMic}
                disabled={pipelineState === "PROCESSING" || pipelineState === "AI_SPEAKING"}
                className="h-11 px-5 text-xs font-bold gap-2 shadow-xs"
              >
                {isMicActive ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Mic</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-emerald-500" />
                    <span>Start Speaking</span>
                  </>
                )}
              </Button>

              {currentTranscript && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentTranscript("")}
                  className="h-11 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>

            <Button
              type="button"
              variant="radiant"
              onClick={() => handleSubmitAnswer()}
              disabled={!currentTranscript.trim() || pipelineState === "PROCESSING"}
              className="h-11 px-8 text-xs font-black gap-2 shadow-md uppercase tracking-wider"
            >
              {pipelineState === "PROCESSING" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating 4D Score...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={voiceSettings}
        onSave={(newSettings) => {
          setVoiceSettings(newSettings);
          success("Voice preferences saved!");
        }}
      />
    </div>
  );
}
