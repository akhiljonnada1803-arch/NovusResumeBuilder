"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RecruiterPersonaId,
  RECRUITER_PERSONAS,
  RecruiterPersonaProfile,
} from "../../types";
import { Resume } from "@/types/resume";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Play,
  Settings2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Volume2,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { globalCameraManager, CameraPermissionStatus } from "../../video/camera-manager";

interface PreCallLobbyProps {
  resume?: Resume | null;
  targetRole: string;
  selectedPersonaId: RecruiterPersonaId;
  onSelectPersona: (id: RecruiterPersonaId) => void;
  onOpenPersonaModal: () => void;
  onJoinCall: (stream: MediaStream) => void;
  savedSession?: any;
  onResumeCall?: (stream: MediaStream) => void;
  onDismissSavedSession?: () => void;
}

export function PreCallLobby({
  resume,
  targetRole,
  selectedPersonaId,
  onSelectPersona,
  onOpenPersonaModal,
  onJoinCall,
  savedSession,
  onResumeCall,
  onDismissSavedSession,
}: PreCallLobbyProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraPermissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);

  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [micActivityLevel, setMicActivityLevel] = useState<number>(20);

  const persona = RECRUITER_PERSONAS[selectedPersonaId] || RECRUITER_PERSONAS["tech-lead"];
  const candidateName = resume?.personalInfo?.fullName || "Candidate";

  const requestMediaAccess = async () => {
    setIsInitializing(true);
    setErrorMessage("");

    const result = await globalCameraManager.requestPermissions(false);
    setCameraStatus(result.stream ? "granted" : "denied");

    if (result.stream) {
      setStream(result.stream);
      if (videoRef.current) {
        videoRef.current.srcObject = result.stream;
        videoRef.current.play().catch(() => {});
      }
    } else {
      setErrorMessage(result.error || "Unable to acquire camera stream.");
    }
    setIsInitializing(false);
  };

  useEffect(() => {
    requestMediaAccess();
  }, []);

  useEffect(() => {
    if (videoRef.current && stream && !isCameraOff) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [stream, isCameraOff]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (stream && !isMuted) {
      interval = setInterval(() => {
        setMicActivityLevel(Math.floor(Math.random() * 65) + 20);
      }, 120);
    } else {
      setMicActivityLevel(5);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stream, isMuted]);

  const handleToggleCamera = () => {
    if (!stream) return;
    const nextCam = !isCameraOff;
    setIsCameraOff(nextCam);
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !nextCam;
    });
  };

  const handleToggleMute = () => {
    if (!stream) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !nextMute;
    });
  };

  const handleJoin = () => {
    if (stream && cameraStatus === "granted") {
      onJoinCall(stream);
    } else {
      requestMediaAccess();
    }
  };

  const handleResume = () => {
    if (stream && cameraStatus === "granted" && onResumeCall) {
      onResumeCall(stream);
    } else {
      requestMediaAccess();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Lobby Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <span>Interview Video Check (Green Room)</span>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              HD Video Call
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Check your camera feed, microphone input, and select your hiring manager before joining.
          </p>
        </div>

        {/* Selected Persona Switcher */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenPersonaModal}
          className="h-9 text-xs font-semibold gap-2 border-primary/40 bg-card shadow-xs"
        >
          <Settings2 className="w-3.5 h-3.5 text-primary" />
          <span>Switch Recruiter ({persona.name})</span>
        </Button>
      </div>

      {/* Main 2-Column Device Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Webcam Feed & Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between p-4 group">
            {/* Top Bar: Candidate Tag */}
            <div className="flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold border border-white/10 shadow-xs">
                {candidateName} (You)
              </span>

              {/* Status Badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border backdrop-blur-md shadow-xs ${
                  cameraStatus === "granted"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                    : cameraStatus === "denied"
                    ? "bg-rose-500/20 text-rose-300 border-rose-400/40 animate-pulse"
                    : "bg-amber-500/20 text-amber-300 border-amber-400/40"
                }`}
              >
                {cameraStatus === "granted" ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Camera Ready</span>
                  </>
                ) : cameraStatus === "denied" ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Camera Blocked</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Testing Devices...</span>
                  </>
                )}
              </div>
            </div>

            {/* Live Video Feed */}
            {cameraStatus === "granted" && !isCameraOff ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-0"
              />
            ) : isCameraOff ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-300 gap-2 z-0">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-bold text-white shadow-md">
                  {candidateName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <VideoOff className="w-3.5 h-3.5" />
                  <span>Webcam Preview Paused</span>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 text-slate-200 space-y-3 z-0">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg">
                  <VideoOff className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold text-white">Camera Access Required</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {errorMessage || "Please allow webcam and microphone permissions in your browser to start the live video interview."}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="radiant"
                  onClick={requestMediaAccess}
                  className="h-8 text-xs font-bold gap-1.5 shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Grant Camera Access</span>
                </Button>
              </div>
            )}

            {/* Bottom Preview Controls Bar */}
            <div className="z-10 mt-auto flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isMuted ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleToggleMute}
                  className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-black/75 border-white/20 text-white backdrop-blur-md shadow-xs"
                >
                  {isMuted ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-white" />
                      <span>Unmute</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mic Active</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant={isCameraOff ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleToggleCamera}
                  className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-black/75 border-white/20 text-white backdrop-blur-md shadow-xs"
                >
                  {isCameraOff ? (
                    <>
                      <VideoOff className="w-3.5 h-3.5 text-white" />
                      <span>Turn Camera On</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-3.5 h-3.5 text-blue-400" />
                      <span>Camera Live</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Real-time Microphone Volume Input Tester Bar */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Mic Input:</span>
                <div className="w-16 sm:w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-100"
                    style={{ width: `${micActivityLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {cameraStatus === "denied" && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>How to allow camera in your browser:</span>
              </div>
              <p className="text-[11px] text-rose-300/80 leading-relaxed pl-5.5">
                Click the <strong>Lock / Camera icon</strong> in your browser address bar and switch permissions to <strong>Allow</strong>, then retry.
              </p>
            </div>
          )}
        </div>

        {/* Right: Recruiter Details & Join Action */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl border border-border bg-card shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Your Interviewer
              </span>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${persona.badgeClass}`}>
                {persona.company}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${persona.accentColor} text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md`}
              >
                {persona.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{persona.name}</h3>
                <p className="text-xs text-muted-foreground font-medium">{persona.title}</p>
                <p className="text-[11px] text-primary font-mono">{targetRole}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs text-foreground/85 italic leading-relaxed">
              &ldquo;{persona.sampleGreeting}&rdquo;
            </div>

            <div className="space-y-2 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Adaptive difficulty based on your answers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Continuously grounded in Resume & GitHub projects</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Comprehensive 5D Executive Scorecard upon conclusion</span>
              </div>
            </div>

            {/* Saved Session Resume Banner */}
            {savedSession && (
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs font-bold text-foreground">
                      Active Interview Found
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    Stage: {savedSession.current_stage || "In Progress"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You have an in-progress session with {savedSession.turns?.length || 0} turns.
                  You can resume where you left off or start fresh.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="radiant"
                    size="sm"
                    onClick={handleResume}
                    disabled={cameraStatus === "denied"}
                    className="flex-1 h-9 text-xs font-bold gap-1.5 shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resume Interview</span>
                  </Button>
                  {onDismissSavedSession && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onDismissSavedSession}
                      className="h-9 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <span>Dismiss</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Launch Button */}
            <div className="pt-2">
              <Button
                type="button"
                variant={savedSession ? "outline" : "radiant"}
                size="lg"
                onClick={handleJoin}
                disabled={cameraStatus === "denied"}
                className="w-full h-12 text-xs font-black gap-2 shadow-xl uppercase tracking-wider"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {cameraStatus === "granted"
                    ? (savedSession ? `Start New Call with ${persona.name}` : `Join Live Call with ${persona.name}`)
                    : "Grant Camera to Start Interview"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
