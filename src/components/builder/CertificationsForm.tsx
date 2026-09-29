"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CertificationItem } from "@/types/resume";
import { Award, Plus, Trash2, Globe, Calendar } from "lucide-react";

export function CertificationsForm() {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const addCertification = useResumeStore((state) => state.addCertification);
  const updateCertification = useResumeStore((state) => state.updateCertification);
  const deleteCertification = useResumeStore((state) => state.deleteCertification);

  const { certifications } = activeResume;
  const [expandedId, setExpandedId] = useState<string | null>(
    certifications.length > 0 ? certifications[0].id : null
  );

  const handleAddNew = () => {
    addCertification();
    setTimeout(() => {
      const updated = useResumeStore.getState().getActiveResume().certifications;
      if (updated.length > 0) {
        setExpandedId(updated[updated.length - 1].id);
      }
    }, 50);
  };

  const handleItemChange = (id: string, field: keyof CertificationItem, value: any) => {
    updateCertification(id, { [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-foreground" />
            Certifications & Accreditations
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cloud credentials, technical certificates, and professional licenses.
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
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card shadow-2xs">
          <Award className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
          <h3 className="font-semibold text-foreground text-xs">No certifications added</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-3">
            Add AWS, GCP, Azure, or industry credentials.
          </p>
          <Button onClick={handleAddNew} size="sm" variant="outline" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add First Certification
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const displayTitle = item.name || "New Certification";
            const displaySub = item.issuer ? `${item.issuer}` : "Issuing Organization";

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
                      deleteCertification(item.id);
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
                        <Label required>Certificate Name</Label>
                        <Input
                          placeholder="e.g. AWS Certified Solutions Architect"
                          value={item.name || ""}
                          onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label required>Issuing Organization</Label>
                        <Input
                          placeholder="e.g. Amazon Web Services"
                          value={item.issuer || ""}
                          onChange={(e) => handleItemChange(item.id, "issuer", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label required>Issue Date</Label>
                        <Input
                          type="month"
                          value={item.issueDate || ""}
                          onChange={(e) => handleItemChange(item.id, "issueDate", e.target.value)}
                          leftIcon={<Calendar className="w-3.5 h-3.5" />}
                        />
                      </div>

                      <div>
                        <Label>Credential ID / URL (Optional)</Label>
                        <Input
                          placeholder="e.g. https://credly.com/earner/..."
                          value={item.credentialUrl || ""}
                          onChange={(e) => handleItemChange(item.id, "credentialUrl", e.target.value)}
                          leftIcon={<Globe className="w-3.5 h-3.5" />}
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
