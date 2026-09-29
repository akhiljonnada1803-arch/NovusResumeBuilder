"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { VideoInterviewTrack, RECRUITER_PERSONAS } from "@/types/video-interview";
import { globalCameraService } from "@/lib/video/camera-service";
import { CandidateSelfVideo } from "./CandidateSelfVideo";
import { CameraDiagnosticsPanel } from "./CameraDiagnosticsPanel";
import {
  Video,
  Mic,
  ShieldCheck,
  Play,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Code2,
  Briefcase,
  Target,
  ArrowRight,
  Layers,
} from "lucide-react";

interface VideoInterviewSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetRole: string;
  candidateName?: string;
  onStartCall: (track: VideoInterviewTrack) => void;
}

export function VideoInterviewSetupModal({
  open,
  onOpenChange,
  targetRole,
  candidateName = "Candidate",
  onStartCall,
}: VideoInterviewSetupModalProps) {
  const [selectedTrack, setSelectedTrack] = useState<VideoInterviewTrack>("technical");
  const [cameraActive, setCameraActive] = useState(false);

  // Initialize camera preview when setup modal opens
  useEffect(() => {
    if (open) {
      globalCameraService.startCamera(true, true).then((stream) => {
        setCameraActive(Boolean(stream));
      });
    }
  }, [open]);

  const handleLaunch = () => {
    onOpenChange(false);
    onStartCall(selectedTrack);
  };

  const recruiter = RECRUITER_PERSONAS[selectedTrack];

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="3xl">
      <DialogHeader>
        <div className="flex items-center gap-2 font-bold text-foreground">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle>AI Video Interview Pre-Call Setup</DialogTitle>
            <span className="text-xs text-muted-foreground font-normal">
              Test your camera & microphone with live diagnostics before joining the recruiter video call.
            </span>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Camera Preview & Diagnostics (6 cols) */}
          <div className="md:col-span-6 space-y-3">
            <CandidateSelfVideo
              candidateName={candidateName}
              cameraEnabled={true}
              isRecordingMic={false}
              className="w-full"
            />

            <CameraDiagnosticsPanel />
          </div>

          {/* Right: Select Interview Track & Recruiter (6 cols) */}
          <div className="md:col-span-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Select Interview Track
              </Label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "technical", label: "Technical Architecture", icon: Code2 },
                  { id: "hr", label: "HR & Behavioral", icon: UserCheck },
                  { id: "behavioral", label: "Leadership & STAR", icon: Briefcase },
                  { id: "executive", label: "Executive Strategy", icon: Target },
                ].map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setSelectedTrack(track.id as VideoInterviewTrack)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                      selectedTrack === track.id
                        ? "bg-card border-primary text-foreground ring-2 ring-primary/20 shadow-2xs"
                        : "bg-secondary/20 border-border text-muted-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <track.icon className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold text-xs">{track.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recruiter Profile Card */}
            <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-primary tracking-wider block">
                Your Interviewer for this Call
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {recruiter.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground">{recruiter.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{recruiter.title}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/60">
                {recruiter.bio}
              </p>
            </div>

            <Button
              type="button"
              variant="radiant"
              size="lg"
              onClick={handleLaunch}
              className="w-full h-11 text-xs font-black gap-2 shadow-md uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Join Recruiter Video Call</span>
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
