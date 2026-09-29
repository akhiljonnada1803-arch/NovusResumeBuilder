"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { VoiceSettings } from "@/types/voice-interview";
import { globalVoiceEngine } from "@/lib/voice/voice-engine";
import { Sliders, Volume2, Mic, Check, RotateCcw } from "lucide-react";

interface VoiceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: VoiceSettings;
  onSave: (settings: VoiceSettings) => void;
}

export function VoiceSettingsModal({
  open,
  onOpenChange,
  settings,
  onSave,
}: VoiceSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<VoiceSettings>(settings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setLocalSettings(settings);
    if (typeof window !== "undefined") {
      setVoices(globalVoiceEngine.getVoices());
    }
  }, [settings, open]);

  const handleTestVoice = () => {
    globalVoiceEngine.speak(
      "Hello, I'm your AI Technical Bar Raiser. This is how my voice sounds for your mock interview.",
      localSettings
    );
  };

  const handleSave = () => {
    onSave(localSettings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader>
        <div className="flex items-center gap-2 font-bold text-foreground">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <DialogTitle>AI Voice Interviewer Settings</DialogTitle>
            <span className="text-xs text-muted-foreground font-normal">
              Configure speech synthesis, tone, and speech recognition.
            </span>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 pt-2 text-xs">
        {/* Voice Persona Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Interviewer Voice Persona</Label>
          <select
            value={localSettings.voiceName}
            onChange={(e) => setLocalSettings({ ...localSettings, voiceName: e.target.value })}
            className="w-full h-9 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-hidden"
          >
            <option value="">Default Natural Voice</option>
            {voices.map((v, i) => (
              <option key={i} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground">
            Select high-clarity natural voices available on your operating system.
          </p>
        </div>

        {/* Speech Rate Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Speaking Pace / Rate</Label>
            <span className="font-mono text-[11px] text-primary font-bold">{localSettings.rate}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.3"
            step="0.05"
            value={localSettings.rate}
            onChange={(e) => setLocalSettings({ ...localSettings, rate: parseFloat(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>

        {/* Pitch Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Pitch / Tone</Label>
            <span className="font-mono text-[11px] text-primary font-bold">{localSettings.pitch}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.05"
            value={localSettings.pitch}
            onChange={(e) => setLocalSettings({ ...localSettings, pitch: parseFloat(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>

        {/* Auto-Speak Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border">
          <div className="space-y-0.5">
            <span className="font-semibold text-foreground block">Auto-Speak Questions</span>
            <p className="text-[10px] text-muted-foreground">
              Automatically vocalize follow-up questions when turn progresses.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLocalSettings({ ...localSettings, autoSpeak: !localSettings.autoSpeak })}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              localSettings.autoSpeak ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                localSettings.autoSpeak ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-border/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestVoice}
            className="h-8 text-xs gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Audio</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="radiant"
              size="sm"
              onClick={handleSave}
              className="h-8 text-xs font-bold gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
