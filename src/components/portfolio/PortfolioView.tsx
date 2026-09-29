"use client";

import React, { useState } from "react";
import {
  PortfolioTheme,
  normalizeTheme,
  PortfolioSectionConfig,
  DEFAULT_PORTFOLIO_SECTIONS,
  PORTFOLIO_TEMPLATES,
  PortfolioCustomizationSettings,
} from "@/types/portfolio";
import { DeveloperTemplate } from "./templates/DeveloperTemplate";
import { StudentTemplate } from "./templates/StudentTemplate";
import { ResearcherTemplate } from "./templates/ResearcherTemplate";
import { DesignerTemplate } from "./templates/DesignerTemplate";
import { FreelancerTemplate } from "./templates/FreelancerTemplate";
import { FounderTemplate } from "./templates/FounderTemplate";

export type { PortfolioTheme };
export { normalizeTheme };

interface PortfolioViewProps {
  resume: any;
  initialTheme?: PortfolioTheme | string;
  isPublicView?: boolean;
  subdomain?: string;
  sectionsConfig?: PortfolioSectionConfig[];
  customization?: PortfolioCustomizationSettings;
  onThemeChange?: (theme: PortfolioTheme) => void;
}

export function PortfolioView({
  resume,
  initialTheme = "developer",
  isPublicView = false,
  subdomain,
  sectionsConfig = DEFAULT_PORTFOLIO_SECTIONS,
  customization,
  onThemeChange,
}: PortfolioViewProps) {
  const [currentTheme, setCurrentTheme] = useState<PortfolioTheme>(() => normalizeTheme(initialTheme));

  // Keep internal theme in sync whenever initialTheme prop changes
  React.useEffect(() => {
    if (initialTheme) {
      setCurrentTheme(normalizeTheme(initialTheme));
    }
  }, [initialTheme]);

  const handleThemeSwitch = (theme: PortfolioTheme) => {
    setCurrentTheme(theme);
    if (onThemeChange) {
      onThemeChange(theme);
    }
  };

  const renderActiveTheme = () => {
    const props = {
      resume,
      subdomain,
      onThemeChange: setCurrentTheme,
      currentTheme,
      sectionsConfig,
      customization,
    };

    switch (currentTheme) {
      case "developer":
      case "github-developer":
      case "terminal":
      case "apple-engineer":
      case "ai-engineer":
        return <DeveloperTemplate {...props} />;
      case "student":
        return <StudentTemplate {...props} />;
      case "researcher":
        return <ResearcherTemplate {...props} />;
      case "designer":
      case "interactive-3d":
        return <DesignerTemplate {...props} />;
      case "freelancer":
      case "showcase":
      case "timeline":
        return <FreelancerTemplate {...props} />;
      case "founder":
      case "executive":
        return <FounderTemplate {...props} />;
      default:
        return <DeveloperTemplate {...props} />;
    }
  };

  return (
    <div className="relative">
      {/* Floating Global Quick Template Switcher Pill */}
      <div className="fixed bottom-4 right-4 z-50 backdrop-blur-xl bg-slate-900/90 border border-slate-700/80 rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-2 text-xs">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 hidden sm:inline">Template:</span>
        <select
          suppressHydrationWarning
          value={currentTheme}
          onChange={(e) => handleThemeSwitch(normalizeTheme(e.target.value))}
          className="h-7 text-xs px-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-hidden cursor-pointer"
        >
          {PORTFOLIO_TEMPLATES.map((tmpl) => (
            <option key={tmpl.id} value={tmpl.id}>
              {tmpl.name} ({tmpl.category})
            </option>
          ))}
        </select>
      </div>

      {renderActiveTheme()}
    </div>
  );
}
