"use client";

import React, { useState, useEffect, useRef } from "react";
import { RecruiterPersonaId } from "../../types";
import { Resume } from "@/types/resume";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { globalCameraManager } from "../../video/camera-manager";
import { globalVADEngine } from "../../voice/vad-engine";
import { globalVoiceSynthesizer } from "../../voice/voice-synthesizer";
import { globalIntegrityTracker } from "../../services/integrity-tracker";
import { globalFaceDetector } from "@/lib/video/face-detector";
import { useInterviewSession } from "../../hooks/useInterviewSession";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useSessionPersistence } from "../../hooks/useSessionPersistence";
import { RecruiterStageProgress } from "./RecruiterStageProgress";
import { LiveRecruiterTile } from "./LiveRecruiterTile";
import { LiveCandidateTile } from "./LiveCandidateTile";
import { RecruiterNotesDrawer } from "./RecruiterNotesDrawer";
import { PersonaSelectorModal } from "../modals/PersonaSelectorModal";
import { PreCallLobby } from "./PreCallLobby";
import { ExecutiveScorecardDashboard } from "../report/ExecutiveScorecardDashboard";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  FileText,
  Loader2,
  Send,
} from "lucide-react";

interface RealInterviewRoomProps {
  resume?: Resume | null;
  targetRole?: string;
  jobDescription?: string;
}

export function RealInterviewRoom({
  resume,
  targetRole = "Senior Software Engineer",
  jobDescription = "",
}: RealInterviewRoomProps) {
  const { error: showErrorToast } = useToast();
  const { user } = useAuth();

  // Persona modal & call state
  const [selectedPersonaId, setSelectedPersonaId] = useState<RecruiterPersonaId>("tech-lead");
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [savedSession, setSavedSession] = useState<any | null>(null);

  // Session ID reference for persistence
  const sessionIdRef = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session_${Date.now()}`
  );

  // Media — UI-only concerns
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [candidateTextInput, setCandidateTextInput] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isSubmittingRef = useRef(false);

  // Session state lives in the hook
  const session = useInterviewSession({
    resume,
    targetRole,
    jobDescription,
    initialPersonaId: selectedPersonaId,
  });

  // Session persistence hook
  const persistence = useSessionPersistence({
    sessionId: sessionIdRef.current,
    userId: user?.id,
    turns: session.turns,
    stage: session.currentStage,
    config: {
      resume,
      targetRole,
      jobDescription,
      initialPersonaId: selectedPersonaId,
    },
    isActive: isCallActive && session.isSessionActive,
  });

  // Speech-to-Text
  const stt = useSpeechRecognition();

  // Sync STT interim transcript into the text input
  useEffect(() => {
    if (stt.interimTranscript) {
      setCandidateTextInput(stt.interimTranscript);
    }
  }, [stt.interimTranscript]);

  // Auto-submit when STT detects end-of-speech (silence > 2s) with concurrency guard (C3)
  useEffect(() => {
    if (stt.finalTranscript && !session.isEvaluatingTurn && !isSubmittingRef.current) {
      isSubmittingRef.current = true;
      const text = stt.finalTranscript;
      stt.clearFinal();
      handleSendAnswer(text).finally(() => {
        isSubmittingRef.current = false;
      });
    }
  }, [stt.finalTranscript, session.isEvaluatingTurn]);

  // Check for active resumable session when lobby is shown
  useEffect(() => {
    if (!user?.id || isCallActive) return;

    fetch(`/api/interview/session?personaId=${selectedPersonaId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.session && data.session.turns?.length > 0) {
          setSavedSession(data.session);
        } else {
          setSavedSession(null);
        }
      })
      .catch(() => setSavedSession(null));
  }, [user?.id, selectedPersonaId, isCallActive]);

  // Global unmount cleanup: stop all hardware and streams (C5)
  useEffect(() => {
    return () => {
      globalVoiceSynthesizer.stop();
      globalVADEngine.stop();
      globalFaceDetector.stop();
      globalCameraManager.stopStream();
      stt.stopListening();
    };
  }, []);

  // Handle joining a new call
  const handleJoinCall = async (stream: MediaStream) => {
    sessionIdRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session_${Date.now()}`;
    setSavedSession(null);
    setMediaStream(stream);
    setIsConnecting(true);
    setIsCallActive(true);

    // Wire VAD → candidateSpeaking indicator
    try {
      await globalVADEngine.start(stream);
      globalVADEngine.onSpeechStart(() => session.setIsCandidateSpeaking(true));
      globalVADEngine.onSpeechEnd(() => session.setIsCandidateSpeaking(false));
    } catch (vadErr) {
      console.warn("VAD init notice:", vadErr);
    }

    // Start face detector (initializes lazily — no-op if MediaPipe unavailable)
    globalFaceDetector.initialize().then(() => {
      if (videoRef.current) globalFaceDetector.attachToVideo(videoRef.current);
      globalFaceDetector.startDetecting((faceCount) => {
        if (faceCount === 0) {
          globalIntegrityTracker.recordEvent(
            "face-not-detected",
            "medium",
            "No face visible in camera frame."
          );
        } else if (faceCount > 1) {
          globalIntegrityTracker.recordEvent(
            "multiple-faces",
            "high",
            `${faceCount} faces detected in camera frame.`
          );
        }
      });
    });

    // Start STT if supported
    if (stt.isSupported) {
      stt.startListening(stream);
    }

    try {
      await session.startSession();
    } catch (err) {
      showErrorToast("Failed to initialize conversational turn.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle resuming an in-progress session
  const handleResumeCall = async (stream: MediaStream) => {
    if (!savedSession) return;
    sessionIdRef.current = savedSession.id;
    setMediaStream(stream);
    setIsConnecting(true);
    setIsCallActive(true);

    try {
      await globalVADEngine.start(stream);
      globalVADEngine.onSpeechStart(() => session.setIsCandidateSpeaking(true));
      globalVADEngine.onSpeechEnd(() => session.setIsCandidateSpeaking(false));
    } catch (vadErr) {
      console.warn("VAD init notice:", vadErr);
    }

    globalFaceDetector.initialize().then(() => {
      if (videoRef.current) globalFaceDetector.attachToVideo(videoRef.current);
      globalFaceDetector.startDetecting((faceCount) => {
        if (faceCount === 0) {
          globalIntegrityTracker.recordEvent(
            "face-not-detected",
            "medium",
            "No face visible in camera frame."
          );
        } else if (faceCount > 1) {
          globalIntegrityTracker.recordEvent(
            "multiple-faces",
            "high",
            `${faceCount} faces detected in camera frame.`
          );
        }
      });
    });

    if (stt.isSupported) {
      stt.startListening(stream);
    }

    session.restoreSession(
      savedSession.turns || [],
      savedSession.current_stage || "intro",
      savedSession.persona_id || selectedPersonaId
    );
    setIsConnecting(false);
  };

  // Send answer (from text input or auto-submitted STT final)
  const handleSendAnswer = async (text: string) => {
    if (!text.trim() || session.isEvaluatingTurn) return;
    const previousInput = candidateTextInput;
    setCandidateTextInput("");
    try {
      await session.sendCandidateAnswer(text);
    } catch (err) {
      // H3: Restore candidate text on network/API failure
      setCandidateTextInput(previousInput || text);
      showErrorToast("Failed to send answer. Please try again.");
    }
  };

  // End call
  const handleEndCall = async () => {
    globalVoiceSynthesizer.stop();
    globalVADEngine.stop();
    globalFaceDetector.stop();
    globalCameraManager.stopStream(); // C5: Clean up camera hardware
    stt.stopListening();
    setIsCallActive(false);
    setIsConnecting(true);
    try {
      const scorecard = await session.finishInterview();
      if (scorecard) {
        const integrityReport = globalIntegrityTracker.generateReport();
        const durationMinutes = Math.max(1, Math.round(session.callDurationSeconds / 60));
        await persistence.markCompleted(scorecard, integrityReport, durationMinutes);
      }
    } catch (err) {
      showErrorToast("Failed to compile final scorecard.");
    } finally {
      setIsConnecting(false);
    }
  };

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // 1. Show scorecard once complete
  if (session.scorecard) {
    return (
      <ExecutiveScorecardDashboard
        scorecard={session.scorecard}
        onRestart={() => {
          session.setScorecard(null);
          setIsCallActive(false);
          setSavedSession(null);
        }}
      />
    );
  }

  // 2. Pre-call lobby
  if (!isCallActive) {
    return (
      <>
        <PreCallLobby
          resume={resume}
          targetRole={targetRole}
          selectedPersonaId={selectedPersonaId}
          onSelectPersona={setSelectedPersonaId}
          onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
          onJoinCall={handleJoinCall}
          savedSession={savedSession}
          onResumeCall={handleResumeCall}
          onDismissSavedSession={() => setSavedSession(null)}
        />
        <PersonaSelectorModal
          open={isPersonaModalOpen}
          onOpenChange={setIsPersonaModalOpen}
          selectedPersonaId={selectedPersonaId}
          onSelectPersona={(id) => {
            setSelectedPersonaId(id);
            setIsPersonaModalOpen(false);
          }}
        />
      </>
    );
  }

  // 3. Live call room
  const latestRecruiterTurn = session.turns.filter((t) => t.speaker === "recruiter").slice(-1)[0];

  return (
    <div className="space-y-4 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Session Progress Bar */}
      <div className="p-3 rounded-2xl border border-border bg-card shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-mono font-bold text-foreground">
            LIVE CALL • {formatTimer(session.callDurationSeconds)}
          </span>
          <span className="text-xs text-muted-foreground">• {session.persona.name}</span>
        </div>

        <RecruiterStageProgress currentStage={session.currentStage} />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
            className="h-8 text-xs gap-1.5 font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes ({session.recruiterNotes.length})</span>
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={handleEndCall}
            disabled={isConnecting}
            className="h-8 text-xs gap-1.5 font-bold shadow-xs"
          >
            {isConnecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PhoneOff className="w-3.5 h-3.5" />
            )}
            <span>{isConnecting ? "Generating..." : "End Call"}</span>
          </Button>
        </div>
      </div>

      {/* Main Video Call Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recruiter Tile (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <LiveRecruiterTile
            persona={session.persona}
            internalState={session.internalState}
            isSpeaking={session.isRecruiterSpeaking}
            activeTurnText={latestRecruiterTurn?.text}
          />

          {/* Answer Input — supports typing and voice */}
          <div className="p-3 rounded-2xl border border-border bg-card shadow-xs space-y-2">
            {/* STT status bar */}
            {stt.isSupported && (
              <div
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs border transition-colors ${
                  stt.isListening
                    ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600"
                    : "border-border text-muted-foreground"
                }`}
              >
                <Mic className={`w-3 h-3 ${stt.isListening ? "animate-pulse" : ""}`} />
                <span>{stt.isListening ? "Listening…" : "Voice ready"}</span>
                {stt.interimTranscript && (
                  <span className="italic text-muted-foreground truncate max-w-xs">
                    {stt.interimTranscript}
                  </span>
                )}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAnswer(candidateTextInput);
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={candidateTextInput}
                onChange={(e) => setCandidateTextInput(e.target.value)}
                placeholder={
                  stt.isSupported
                    ? "Speak into your mic, or type your response…"
                    : "Type your response here…"
                }
                disabled={session.isEvaluatingTurn}
                className="h-10 text-xs bg-secondary/30"
              />

              <Button
                type="submit"
                variant="radiant"
                size="sm"
                disabled={!candidateTextInput.trim() || session.isEvaluatingTurn}
                className="h-10 px-4 text-xs font-bold gap-1.5 shrink-0"
              >
                {session.isEvaluatingTurn ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Candidate Feed & Side Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <LiveCandidateTile
            stream={mediaStream}
            candidateName={resume?.personalInfo?.fullName || "Candidate"}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            energyLevel={session.isCandidateSpeaking ? 50 : 0}
          />

          {/* Hardware Controls */}
          <div className="p-3 rounded-2xl border border-border bg-card shadow-2xs flex items-center justify-around">
            <Button
              size="sm"
              variant={isMuted ? "destructive" : "outline"}
              onClick={() => {
                if (mediaStream) {
                  mediaStream.getAudioTracks().forEach((t) => (t.enabled = isMuted));
                  setIsMuted(!isMuted);
                }
              }}
              className="h-8 text-xs gap-1.5 font-medium"
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isMuted ? "Unmute" : "Mute"}</span>
            </Button>

            <Button
              size="sm"
              variant={isVideoOff ? "destructive" : "outline"}
              onClick={() => {
                if (mediaStream) {
                  mediaStream.getVideoTracks().forEach((t) => (t.enabled = isVideoOff));
                  setIsVideoOff(!isVideoOff);
                }
              }}
              className="h-8 text-xs gap-1.5 font-medium"
            >
              {isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              <span>{isVideoOff ? "Start Video" : "Stop Video"}</span>
            </Button>
          </div>

          {/* Recruiter Notes Drawer */}
          {isNotesDrawerOpen && (
            <RecruiterNotesDrawer persona={session.persona} notes={session.recruiterNotes} />
          )}
        </div>
      </div>
    </div>
  );
}
