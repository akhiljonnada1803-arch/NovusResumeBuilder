import React from "react";
import { Resume, ResumeTemplateId } from "@/types/resume";

// Category 1: ATS Professional
import { ATSClassic } from "./ats/ATSClassic";
import { ATSExecutive } from "./ats/ATSExecutive";
import { ATSModern } from "./ats/ATSModern";
import { ATSMinimal } from "./ats/ATSMinimal";
import { ATSTechnical } from "./ats/ATSTechnical";

// Category 2: Modern Professional
import { CorporateBlue } from "./professional/CorporateBlue";
import { ModernExecutive } from "./professional/ModernExecutive";
import { ContemporaryPro } from "./professional/ContemporaryPro";
import { ElegantBusiness } from "./professional/ElegantBusiness";
import { PremiumConsultant } from "./professional/PremiumConsultant";

// Category 3: Software Engineer
import { DeveloperPro } from "./engineering/DeveloperPro";
import { FullStackEngineer } from "./engineering/FullStackEngineer";
import { TechMinimal } from "./engineering/TechMinimal";
import { EngineeringPortfolio } from "./engineering/EngineeringPortfolio";

// Category 4: Creative Designer
import { CreativePortfolio } from "./creative/CreativePortfolio";
import { DesignerGrid } from "./creative/DesignerGrid";
import { VisualArtist } from "./creative/VisualArtist";
import { CreativeModern } from "./creative/CreativeModern";

// Category 5: Student & Fresher
import { GraduateStarter } from "./student/GraduateStarter";
import { CampusProfessional } from "./student/CampusProfessional";
import { FresherATS } from "./student/FresherATS";

// Category 6: Premium Showcase
import { LuxuryBlack } from "./premium/LuxuryBlack";
import { PremiumGold } from "./premium/PremiumGold";
import { MinimalLuxury } from "./premium/MinimalLuxury";
import { EliteExecutive } from "./premium/EliteExecutive";

export interface TemplateRendererProps {
  data: Resume;
  templateId?: ResumeTemplateId;
  className?: string;
  isPrintMode?: boolean;
}

export function TemplateRenderer({
  data,
  templateId,
  className = "",
  isPrintMode = false,
}: TemplateRendererProps) {
  const activeId = templateId || data.design?.template || "ats-classic";

  switch (activeId) {
    // Category 1: ATS Professional
    case "ats-classic":
      return <ATSClassic data={data} className={className} isPrintMode={isPrintMode} />;
    case "ats-executive":
      return <ATSExecutive data={data} className={className} isPrintMode={isPrintMode} />;
    case "ats-modern":
      return <ATSModern data={data} className={className} isPrintMode={isPrintMode} />;
    case "ats-minimal":
    case "minimalist": // Legacy alias
      return <ATSMinimal data={data} className={className} isPrintMode={isPrintMode} />;
    case "ats-technical":
    case "tech": // Legacy alias
      return <ATSTechnical data={data} className={className} isPrintMode={isPrintMode} />;

    // Category 2: Modern Professional
    case "corporate-blue":
    case "modern": // Legacy alias
      return <CorporateBlue data={data} className={className} isPrintMode={isPrintMode} />;
    case "modern-executive":
      return <ModernExecutive data={data} className={className} isPrintMode={isPrintMode} />;
    case "contemporary-pro":
      return <ContemporaryPro data={data} className={className} isPrintMode={isPrintMode} />;
    case "elegant-business":
      return <ElegantBusiness data={data} className={className} isPrintMode={isPrintMode} />;
    case "premium-consultant":
      return <PremiumConsultant data={data} className={className} isPrintMode={isPrintMode} />;

    // Category 3: Software Engineer
    case "developer-pro":
      return <DeveloperPro data={data} className={className} isPrintMode={isPrintMode} />;
    case "fullstack-engineer":
      return <FullStackEngineer data={data} className={className} isPrintMode={isPrintMode} />;
    case "tech-minimal":
      return <TechMinimal data={data} className={className} isPrintMode={isPrintMode} />;
    case "engineering-portfolio":
      return <EngineeringPortfolio data={data} className={className} isPrintMode={isPrintMode} />;

    // Category 4: Creative Designer
    case "creative-portfolio":
    case "creative": // Legacy alias
      return <CreativePortfolio data={data} className={className} isPrintMode={isPrintMode} />;
    case "designer-grid":
      return <DesignerGrid data={data} className={className} isPrintMode={isPrintMode} />;
    case "visual-artist":
      return <VisualArtist data={data} className={className} isPrintMode={isPrintMode} />;
    case "creative-modern":
      return <CreativeModern data={data} className={className} isPrintMode={isPrintMode} />;

    // Category 5: Student & Fresher
    case "graduate-starter":
      return <GraduateStarter data={data} className={className} isPrintMode={isPrintMode} />;
    case "campus-professional":
      return <CampusProfessional data={data} className={className} isPrintMode={isPrintMode} />;
    case "fresher-ats":
      return <FresherATS data={data} className={className} isPrintMode={isPrintMode} />;

    // Category 6: Premium Showcase
    case "luxury-black":
      return <LuxuryBlack data={data} className={className} isPrintMode={isPrintMode} />;
    case "premium-gold":
      return <PremiumGold data={data} className={className} isPrintMode={isPrintMode} />;
    case "minimal-luxury":
      return <MinimalLuxury data={data} className={className} isPrintMode={isPrintMode} />;
    case "elite-executive":
    case "executive": // Legacy alias
      return <EliteExecutive data={data} className={className} isPrintMode={isPrintMode} />;

    default:
      return <CorporateBlue data={data} className={className} isPrintMode={isPrintMode} />;
  }
}
