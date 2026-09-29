"use client";

import React, { useRef, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, User } from "lucide-react";

interface LiveCandidateTileProps {
  stream: MediaStream | null;
  candidateName: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  energyLevel?: number;
}

export function LiveCandidateTile({
  stream,
  candidateName,
  isMuted = false,
  isVideoOff = false,
  energyLevel = 0,
}: LiveCandidateTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-2xl border border-border bg-slate-950 overflow-hidden shadow-xs flex flex-col h-[200px] sm:h-[260px]">
      {/* Video stream / Fallback */}
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
            <User className="w-8 h-8" />
          </div>
          <p className="text-xs font-medium">{candidateName}</p>
          <span className="text-[10px] text-slate-500">Camera stream offline</span>
        </div>
      )}

      {/* Candidate Name & Mic Badge */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[11px] font-semibold text-white flex items-center gap-1.5 shadow-sm">
          <span>{candidateName || "Candidate"} (You)</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Speaking Audio Energy Meter */}
          {energyLevel > 10 && (
            <div className="h-6 px-2 rounded-lg bg-emerald-500/80 backdrop-blur-xs flex items-center gap-0.5">
              <span className="w-1 h-2.5 bg-white rounded-full animate-pulse" />
              <span className="w-1 h-3.5 bg-white rounded-full animate-pulse delay-75" />
              <span className="w-1 h-1.5 bg-white rounded-full animate-pulse delay-150" />
            </div>
          )}

          <div
            className={`p-1.5 rounded-lg text-white shadow-sm ${
              isMuted ? "bg-red-500/80" : "bg-black/70 backdrop-blur-xs"
            }`}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>
    </div>
  );
}
