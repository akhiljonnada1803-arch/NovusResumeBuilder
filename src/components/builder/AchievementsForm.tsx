"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AchievementItem } from "@/types/resume";
import { Trophy, Plus, Trash2, Calendar } from "lucide-react";

export function AchievementsForm() {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const addAchievement = useResumeStore((state) => state.addAchievement);
  const updateAchievement = useResumeStore((state) => state.updateAchievement);
  const deleteAchievement = useResumeStore((state) => state.deleteAchievement);

  const { achievements } = activeResume;
  const [expandedId, setExpandedId] = useState<string | null>(
    achievements.length > 0 ? achievements[0].id : null
  );

  const handleAddNew = () => {
    addAchievement();
    setTimeout(() => {
      const updated = useResumeStore.getState().getActiveResume().achievements;
      if (updated.length > 0) {
        setExpandedId(updated[updated.length - 1].id);
      }
    }, 50);
  };

  const handleItemChange = (id: string, field: keyof AchievementItem, value: any) => {
    updateAchievement(id, { [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-foreground" />
            Honors & Achievements
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hackathons, awards, publications, patents, and recognitions.
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          size="sm"
          variant="outline"
          className="gap-1.5 h-7 text-xs font-medium"
          type="button"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Achievement
        </Button>
      </div>

      {achievements.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card shadow-2xs">
          <Trophy className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
          <h3 className="font-semibold text-foreground text-xs">No achievements listed</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-3">
            Highlight hackathon wins, leadership honors, or technical recognitions.
          </p>
          <Button onClick={handleAddNew} size="sm" variant="outline" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add First Achievement
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const displayTitle = item.title || "New Honor or Award";
            const displaySub = item.issuer ? `${item.issuer}` : "Organization or Event";

            return (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden transition-colors"
              >
                <div
                  className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-secondary text-foreground flex items-center justify-center font-mono text-[11px] font-semibold border border-border/60">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">{displayTitle}</h4>
                      <p className="text-[11px] text-muted-foreground">{displaySub}</p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAchievement(item.id);
                    }}
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3.5 border-t border-border/70 mt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                      <div>
                        <Label required>Award / Honor Title</Label>
                        <Input
                          placeholder="e.g. 1st Place - Global AI Hackathon"
                          value={item.title || ""}
                          onChange={(e) => handleItemChange(item.id, "title", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label required>Issuing Organization</Label>
                        <Input
                          placeholder="e.g. OpenAI / TechCrunch"
                          value={item.issuer || ""}
                          onChange={(e) => handleItemChange(item.id, "issuer", e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Date Received</Label>
                        <Input
                          type="month"
                          value={item.date || ""}
                          onChange={(e) => handleItemChange(item.id, "date", e.target.value)}
                          leftIcon={<Calendar className="w-3.5 h-3.5" />}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Description / Key Context</Label>
                        <Textarea
                          rows={2}
                          placeholder="e.g. Built a zero-latency real-time voice translation agent awarded 1st place out of 450 competing teams..."
                          value={item.description || ""}
                          onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        />
                      </div>
                    </div>
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
