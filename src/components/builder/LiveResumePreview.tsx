"use client";

import React, { useRef, useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { exportResumeToPDF, printResumeViaIframe } from "@/lib/pdf-export";
import { exportResumeToDocx } from "@/lib/docx-export";
import confetti from "canvas-confetti";
import {
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  Globe,
  Loader2,
  Palette,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioShareModal } from "@/components/portfolio/PortfolioShareModal";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { RESUME_TEMPLATES } from "@/templates/registry";
import Link from "next/link";

export function LiveResumePreview() {
  const activeResume = useResumeStore(
    (state) => state.resumes.find((r) => r.id === state.activeResumeId) || state.resumes[0]
  );
  const zoomLevel = useResumeStore((state) => state.zoomLevel);
  const setZoomLevel = useResumeStore((state) => state.setZoomLevel);
  const printRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"pdf" | "docx" | "">("");
  const [exportStatus, setExportStatus] = useState<string>("");
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

  const { personalInfo, design } = activeResume;
  const template = design?.template || "ats-classic";
  const fontFamily = design?.fontFamily || "Inter";

  const currentTemplateMeta =
    RESUME_TEMPLATES.find((t) => t.id === template) || RESUME_TEMPLATES[0];

  const handlePrint = () => {
    if (printRef.current) {
      printResumeViaIframe(printRef.current);
    } else {
      window.print();
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || isExporting) return;

    try {
      setIsExporting(true);
      setExportType("pdf");
      const cleanName = personalInfo?.fullName
        ? personalInfo.fullName.toLowerCase().replace(/[^a-z0-9]/g, "-")
        : "resume";

      await exportResumeToPDF(printRef.current, {
        filename: `${cleanName}-resume.pdf`,
        onProgress: (status: string) => setExportStatus(status),
      });

      // Celebration Confetti
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.warn("PDF Export fallback to print dialog:", err);
      if (printRef.current) {
        printResumeViaIframe(printRef.current);
      }
    } finally {
      setIsExporting(false);
      setExportType("");
      setExportStatus("");
    }
  };

  const handleDownloadDocx = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setExportType("docx");
      const cleanName = personalInfo?.fullName
        ? personalInfo.fullName.toLowerCase().replace(/[^a-z0-9]/g, "-")
        : "resume";

      await exportResumeToDocx(activeResume, {
        filename: `${cleanName}-resume.docx`,
        onProgress: (status: string) => setExportStatus(status),
      });

      // Celebration Confetti
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error("Word (.docx) export failed:", err);
    } finally {
      setIsExporting(false);
      setExportType("");
      setExportStatus("");
    }
  };

  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case "Merriweather":
      case "Playfair Display":
        return "font-serif";
      case "Roboto":
      case "Outfit":
      case "Inter":
      default:
        return "font-sans";
    }
  };

  const getMarginPadding = () => {
    const m = design?.margins || "normal";
    if (m === "compact") return "12mm";
    if (m === "spacious") return "28mm";
    if (m === "custom") return `${design?.customMarginMm || 20}mm`;
    return "20mm";
  };

  const currentZoom = zoomLevel <= 2 ? Math.round(zoomLevel * 100) : zoomLevel;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden relative shadow-2xs">
      {/* Top Preview Toolbar */}
      <div className="flex items-center justify-between p-2.5 border-b border-border bg-card z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">Live Document</span>
          <Link
            href="/templates"
            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border/80 hover:bg-secondary/80 transition-colors flex items-center gap-1"
            title="Browse all 25 templates"
          >
            <Palette className="w-2.5 h-2.5" />
            <span suppressHydrationWarning>{currentTemplateMeta.name}</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Zoom Stepper */}
          <div className="flex items-center gap-1 bg-secondary/80 px-1.5 py-0.5 rounded-lg border border-border/80 text-xs">
            <button
              onClick={() => setZoomLevel(Math.max(50, currentZoom - 10))}
              disabled={currentZoom <= 50}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono w-8 text-center text-foreground font-semibold">
              {currentZoom}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(150, currentZoom + 10))}
              disabled={currentZoom >= 150}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Actions */}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2 gap-1"
            onClick={() => setIsPortfolioModalOpen(true)}
            title="Publish as live web link"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web Link</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2 gap-1"
            onClick={handlePrint}
            title="Print or Save via Browser"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </Button>

          {/* Download Word (.docx) */}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2.5 gap-1.5 border-border hover:bg-secondary font-medium"
            onClick={handleDownloadDocx}
            disabled={isExporting}
            title="Download editable Microsoft Word document (.docx)"
          >
            {isExporting && exportType === "docx" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">{exportStatus || "Word..."}</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Word (.docx)</span>
              </>
            )}
          </Button>

          {/* Download PDF */}
          <Button
            size="sm"
            variant="radiant"
            className="h-7 text-xs px-3 gap-1.5 shadow-2xs font-semibold"
            onClick={handleDownloadPDF}
            disabled={isExporting}
          >
            {isExporting && exportType === "pdf" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">{exportStatus || "Exporting..."}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 bg-secondary/30 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          className="transition-transform duration-150 ease-out origin-top flex justify-center"
          style={{
            transform: `scale(${currentZoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          {/* Printable A4 Paper Shell with dynamic user-configured margins */}
          <div
            ref={printRef}
            id="resume-preview-document"
            className={`w-[210mm] min-h-[297mm] bg-white text-black shadow-lg rounded-xs overflow-hidden transition-all duration-200 border border-slate-200 ${getFontFamilyStyle()}`}
            style={{
              padding: getMarginPadding(),
            }}
          >
            <TemplateRenderer data={activeResume} templateId={template} />
          </div>
        </div>
      </div>

      {/* Portfolio Share Modal */}
      <PortfolioShareModal
        open={isPortfolioModalOpen}
        onOpenChange={setIsPortfolioModalOpen}
      />
    </div>
  );
}
