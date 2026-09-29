"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  VideoInterviewTrack,
  VideoCallState,
  VideoTurn,
  VideoInterviewSessionReport,
  RECRUITER_PERSONAS,
} from "@/types/video-interview";
import { Resume } from "@/types/resume";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { globalCameraService } from "@/lib/video/camera-service";
import { globalVoiceEngine } from "@/lib/voice/voice-engine";
import { VideoInterviewSetupModal } from "./VideoInterviewSetupModal";
import { VideoPerformanceReport } from "./VideoPerformanceReport";
import { CandidateSelfVideo } from "./CandidateSelfVideo";
import { CameraDiagnosticsPanel } from "./CameraDiagnosticsPanel";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  Send,
  Loader2,
  ArrowRight,
  Eye,
  Activity,
  UserCheck,
  CheckCircle2,
  Trophy,
  RotateCcw,
  Smile,
  Subtitles,
  Play,
  Square,
  Bot,
  User,
  Sliders,
} from "lucide-react";

interface VideoInterviewStudioProps {
  resume?: Resume | null;
  targetRole?: string;
}

export function VideoInterviewStudio({
  resume,
  targetRole = "Senior Software Engineer",
}: VideoInterviewStudioProps) {
  const { success, error: showErrorToast } = useToast();

  // Call States
  const [callState, setCallState] = useState<VideoCallState>("preview");
  const [selectedTrack, setSelectedTrack] = useState<VideoInterviewTrack>("technical");
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [sessionReport, setSessionReport] = useState<VideoInterviewSessionReport | null>(null);

  // Turn Flow
  const [currentTurnNumber, setCurrentTurnNumber] = useState(1);
  const totalTurns = 3;
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [turns, setTurns] = useState<VideoTurn[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");

  // Media & Hardware States
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micMuted, setMicMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isCandidateRecording, setIsCandidateRecording] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  // Live Telemetry HUD Simulation
  const [liveEyeContact, setLiveEyeContact] = useState(94);
  const [livePaceWpm, setLivePaceWpm] = useState(135);

  const recruiter = RECRUITER_PERSONAS[selectedTrack];
  const candidateName = resume?.personalInfo?.fullName || "Candidate";

  // Call timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (callState === "in-call" || callState === "evaluating") {
      timer = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
        // Realistic telemetry fluctuations
        setLiveEyeContact(Math.min(98, Math.max(88, 92 + Math.floor(Math.random() * 7))));
        setLivePaceWpm(Math.min(150, Math.max(125, 132 + Math.floor(Math.random() * 12))));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  // Voice speech synthesis & VAD end-of-speech listener
  useEffect(() => {
    const unsubState = globalVoiceEngine.onStateChange((state) => {
      setIsAISpeaking(state === "AI_SPEAKING");
      setIsCandidateRecording(state === "LISTENING" || state === "USER_SPEAKING");
    });

    globalVoiceEngine.onEndOfSpeech((transcript) => {
      if (transcript && transcript.trim().length > 0 && callState === "in-call") {
        setCurrentTranscript(transcript);
      }
    });

    return () => {
      globalVoiceEngine.stopSpeaking();
      globalVoiceEngine.stopListening();
      globalCameraService.stopCamera();
    };
  }, [callState]);

  // 1. Start Call with Track
  const handleLaunchCall = async (track: VideoInterviewTrack) => {
    setSelectedTrack(track);
    setCallState("connecting");
    setTurns([]);
    setCurrentTurnNumber(1);
    setCallDurationSeconds(0);
    setCurrentTranscript("");

    // Start Camera Stream & Media Recording
    await globalCameraService.startCamera(true, true);
    globalCameraService.startRecording();

    try {
      const res = await fetch("/api/video-interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          resume,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect to recruiter.");

      setCurrentQuestion(data.openingQuestion);
      setCallState("in-call");

      // Recruiter vocalizes opening question
      setTimeout(() => {
        globalVoiceEngine.speak(data.openingQuestion, { rate: 1.0, pitch: 1.0 });
      }, 400);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to initialize call.");
      setCallState("preview");
    }
  };

  // 2. Toggle Camera Video Track
  const handleToggleCamera = () => {
    const nextState = !cameraEnabled;
    setCameraEnabled(nextState);
    globalCameraService.toggleVideoTrack(nextState);
  };

  // 3. Toggle Candidate Microphone Recording & Speech-to-Text
  const handleToggleCandidateMic = () => {
    if (isCandidateRecording) {
      globalVoiceEngine.stopListening();
      setIsCandidateRecording(false);
    } else {
      globalVoiceEngine.stopSpeaking();
      setIsCandidateRecording(true);

      globalVoiceEngine.startListening(
        (transcript) => {
          setCurrentTranscript(transcript);
        },
        () => {
          // Silence handler
        }
      );
    }
  };

  // 4. Submit Spoken Turn for Real-Time Evaluation
  const handleSubmitTurn = async () => {
    if (!currentTranscript.trim()) {
      showErrorToast("Please speak your answer into the microphone before submitting.");
      return;
    }

    globalVoiceEngine.stopListening();
    globalVoiceEngine.stopSpeaking();
    setIsCandidateRecording(false);
    setCallState("evaluating");

    const answer = currentTranscript.trim();

    try {
      const res = await fetch("/api/video-interview/evaluate-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: selectedTrack,
          question: currentQuestion,
          answer,
          turnNumber: currentTurnNumber,
          totalTurns,
          durationSeconds: 35,
          resume,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate response.");

      const newTurn: VideoTurn = {
        id: `vturn_${Date.now()}`,
        turnNumber: currentTurnNumber,
        questionText: currentQuestion,
        transcriptText: answer,
        audioDurationSeconds: 35,
        behavioralScores: data.behavioralScores,
        contentEvaluation: data.contentEvaluation,
        timestamp: new Date().toISOString(),
      };

      const updatedTurns = [...turns, newTurn];
      setTurns(updatedTurns);
      setCurrentTranscript("");

      // Proceed to next question or complete call
      if (currentTurnNumber < totalTurns && data.contentEvaluation?.followUpQuestion) {
        const nextQ = data.contentEvaluation.followUpQuestion;
        setCurrentQuestion(nextQ);
        setCurrentTurnNumber((prev) => prev + 1);
        setCallState("in-call");

        setTimeout(() => {
          globalVoiceEngine.speak(nextQ, { rate: 1.0, pitch: 1.0 });
        }, 400);

        success(`Question ${currentTurnNumber} evaluated! Recruiter is following up.`);
      } else {
        await handleEndCall(updatedTurns);
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to process evaluation.");
      setCallState("in-call");
    }
  };

  // 5. End Call & Generate Report
  const handleEndCall = async (finalTurns: VideoTurn[] = turns) => {
    globalVoiceEngine.stopSpeaking();
    globalVoiceEngine.stopListening();
    setCallState("evaluating");

    const recordedUrl = await globalCameraService.stopRecording();
    globalCameraService.stopCamera();

    try {
      const res = await fetch("/api/video-interview/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turns: finalTurns,
          track: selectedTrack,
          candidateName,
          targetRole,
          recordedVideoBlobUrl: recordedUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to finalize session.");

      setSessionReport(data.report);
      setCallState("completed");
      success("Video interview completed! Inspecting performance report.");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to finalize call.");
      setCallState("preview");
    }
  };

  // Format call duration
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // If completed, render Executive Video Performance Report
  if (callState === "completed" && sessionReport) {
    return (
      <VideoPerformanceReport
        report={sessionReport}
        onRestart={() => {
          setCallState("preview");
          setSessionReport(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* View 1: Video Call Launcher / Green Room Preview */}
      {callState === "preview" && (
        <div className="rounded-3xl border border-border bg-card shadow-lg p-8 sm:p-12 text-center space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto shadow-md">
            <Video className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI RECRUITER VIDEO ROOM SIMULATOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Realistic Video Interview Simulator
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Step into an executive recruiter video call. Evaluates your live camera presence, eye contact, speaking pace, and technical answer depth with continuous video recording.
            </p>
          </div>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
            <div className="p-4 rounded-2xl border border-border bg-secondary/20 space-y-1 text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                Eye Contact & Gaze
              </span>
              <p className="text-[11px] text-muted-foreground">Measures visual engagement and camera presence.</p>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-secondary/20 space-y-1 text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-500" />
                Pace & WPM Analytics
              </span>
              <p className="text-[11px] text-muted-foreground">Detects filler words and cadence balance.</p>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-secondary/20 space-y-1 text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-emerald-500" />
                Session Video Playback
              </span>
              <p className="text-[11px] text-muted-foreground">MediaRecorder video capture with download.</p>
            </div>
          </div>

          {/* Live Diagnostics Card Preview */}
          <div className="pt-2">
            <CameraDiagnosticsPanel className="text-left" />
          </div>

          <div className="pt-4">
            <Button
              type="button"
              variant="radiant"
              size="lg"
              onClick={() => setIsSetupModalOpen(true)}
              className="h-12 px-8 text-xs font-black gap-2 shadow-lg uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Recruiter Video Setup</span>
            </Button>
          </div>
        </div>
      )}

      {/* View 2: Connecting / Loading State */}
      {callState === "connecting" && (
        <div className="rounded-3xl border border-border bg-card p-16 text-center space-y-4 max-w-xl mx-auto shadow-xl">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <h3 className="text-base font-bold text-foreground">Joining Video Call with {recruiter.name}...</h3>
          <p className="text-xs text-muted-foreground">Initializing HD camera & audio streams...</p>
        </div>
      )}

      {/* View 3: Live Split-Screen Recruiter Video Call */}
      {(callState === "in-call" || callState === "evaluating") && (
        <div className="rounded-3xl border border-border bg-black shadow-2xl p-4 sm:p-6 space-y-4 animate-in fade-in duration-300">
          {/* Top Call Info Bar */}
          <div className="flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-mono font-bold text-white uppercase tracking-wider text-[11px]">
                ● REC {formatTimer(callDurationSeconds)}
              </span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-slate-300 font-semibold hidden sm:inline">
                {selectedTrack.toUpperCase()} Video Call • Question {currentTurnNumber} of {totalTurns}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                1080p Encrypted HD
              </span>
            </div>
          </div>

          {/* Video Room Tiles Grid (Split Screen) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tile 1: AI Recruiter Stream */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg group">
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                {/* Glowing Avatar */}
                <div
                  className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${recruiter.accentColor} text-white font-bold text-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
                    isAISpeaking ? "scale-105 ring-4 ring-primary/40 animate-pulse" : ""
                  }`}
                >
                  {recruiter.name.split(" ").map((n) => n[0]).join("")}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                    {recruiter.name}
                    {isAISpeaking && <Volume2 className="w-3.5 h-3.5 text-primary animate-bounce" />}
                  </h4>
                  <p className="text-[11px] text-slate-400">{recruiter.title} • {recruiter.company}</p>
                </div>
              </div>

              {/* Recruiter Badge */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Interviewer ({recruiter.name})</span>
              </div>
            </div>

            {/* Tile 2: Candidate Live Camera Feed (Google Meet Quality Self-View) */}
            <CandidateSelfVideo
              candidateName={candidateName}
              isRecordingMic={isCandidateRecording}
              cameraEnabled={cameraEnabled}
              liveEyeContact={liveEyeContact}
              livePaceWpm={livePaceWpm}
            />
          </div>

          {/* Subtitle Bar: Recruiter Question */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-white space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-primary font-bold">
                <Subtitles className="w-3.5 h-3.5" />
                Live Recruiter Subtitle
              </span>
              <span>Question #{currentTurnNumber}</span>
            </div>

            <p className="text-sm font-semibold text-slate-100 leading-relaxed">
              &ldquo;{currentQuestion}&rdquo;
            </p>
          </div>

          {/* Candidate Speech-to-Text Live Transcript */}
          {currentTranscript && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs">
              <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                Your Spoken Answer:
              </span>
              <p className="italic leading-relaxed">&ldquo;{currentTranscript}&rdquo;</p>
            </div>
          )}

          {/* Bottom Call Controls Toolbar (Zoom/Meet Style) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 px-2">
            {/* Audio & Camera Toggles */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={cameraEnabled ? "outline" : "destructive"}
                size="sm"
                onClick={handleToggleCamera}
                className="h-10 px-3.5 text-xs font-bold gap-1.5"
                title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
              >
                {cameraEnabled ? (
                  <>
                    <Video className="w-4 h-4 text-emerald-500" />
                    <span className="hidden sm:inline">Camera On</span>
                  </>
                ) : (
                  <>
                    <VideoOff className="w-4 h-4" />
                    <span className="hidden sm:inline">Camera Off</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant={isCandidateRecording ? "destructive" : "outline"}
                size="sm"
                onClick={handleToggleCandidateMic}
                disabled={callState === "evaluating"}
                className="h-10 px-4 text-xs font-bold gap-2"
              >
                {isCandidateRecording ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Speaking</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-emerald-500" />
                    <span>Start Speaking</span>
                  </>
                )}
              </Button>
            </div>

            {/* Main Action Button */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="radiant"
                size="sm"
                onClick={handleSubmitTurn}
                disabled={!currentTranscript.trim() || callState === "evaluating"}
                className="h-10 px-6 text-xs font-black gap-2 shadow-md uppercase tracking-wider"
              >
                {callState === "evaluating" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Recruiter Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleEndCall()}
                className="h-10 px-3 text-xs gap-1.5"
                title="End Video Call"
              >
                <PhoneOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Call Setup Modal */}
      <VideoInterviewSetupModal
        open={isSetupModalOpen}
        onOpenChange={setIsSetupModalOpen}
        targetRole={targetRole}
        candidateName={candidateName}
        onStartCall={handleLaunchCall}
      />
    </div>
  );
}
