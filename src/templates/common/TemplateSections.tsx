import React from "react";
import { Resume, ResumeDesignSettings } from "@/types/resume";
import { formatDate } from "@/lib/utils";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  Award,
  Trophy,
  Briefcase,
  GraduationCap,
  Code2,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";

export interface TemplateProps {
  data: Resume;
  className?: string;
  isPrintMode?: boolean;
}

/**
 * Universal Profile Avatar renderer for resume templates.
 * Supports configurable shape, size, border, shadow, and position.
 */
export function ProfileAvatar({
  data,
  size,
  shape,
  className = "",
  style,
}: {
  data: Resume;
  size?: "sm" | "md" | "lg" | "xl" | number;
  shape?: "circle" | "rounded" | "square";
  className?: string;
  style?: React.CSSProperties;
}) {
  const pi = data.personalInfo || {};
  const design = data.design || ({} as ResumeDesignSettings);

  // If photo is absent or explicitly hidden, do not render
  if (!pi.photoUrl || pi.showPhoto === false) {
    return null;
  }

  const effectiveShape = shape || design.photoShape || pi.photoShape || "circle";
  const effectiveSize = size || design.photoSize || (pi.photoSize as any) || "md";
  const effectiveShadow = design.photoShadow || pi.photoShadow || "subtle";
  const borderWidth = design.photoBorderWidth ?? 2;
  const accentColor = design.accentColor || "#0F172A";

  const getDimensionPx = (): number => {
    if (typeof effectiveSize === "number") return effectiveSize;
    switch (effectiveSize) {
      case "sm":
        return 60;
      case "lg":
        return 96;
      case "xl":
        return 120;
      case "md":
      default:
        return 78;
    }
  };

  const getShapeClass = () => {
    switch (effectiveShape) {
      case "circle":
        return "rounded-full";
      case "rounded":
        return "rounded-xl";
      case "square":
      default:
        return "rounded-none";
    }
  };

  const getShadowClass = () => {
    switch (effectiveShadow) {
      case "none":
        return "shadow-none";
      case "elevated":
        return "shadow-md";
      case "glow":
        return "shadow-lg shadow-slate-900/10";
      case "subtle":
      default:
        return "shadow-xs";
    }
  };

  const dim = getDimensionPx();

  return (
    <div
      className={`shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 ${getShapeClass()} ${getShadowClass()} ${className}`}
      style={{
        width: `${dim}px`,
        height: `${dim}px`,
        borderWidth: borderWidth ? `${borderWidth}px` : undefined,
        borderColor: borderWidth ? `${accentColor}30` : undefined,
        borderStyle: borderWidth ? "solid" : undefined,
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={pi.photoUrl}
        alt={pi.fullName || "Profile"}
        crossOrigin="anonymous"
        className="w-full h-full object-cover select-none"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}

export function ContactList({
  data,
  iconClass = "w-3 h-3 text-slate-500",
  itemClass = "flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300",
  containerClass = "flex flex-wrap items-center gap-3 pt-1",
}: {
  data: Resume;
  iconClass?: string;
  itemClass?: string;
  containerClass?: string;
}) {
  const pi = data.personalInfo;
  return (
    <div className={containerClass}>
      {pi.email && (
        <span className={itemClass}>
          <Mail className={iconClass} /> {pi.email}
        </span>
      )}
      {pi.phone && (
        <span className={itemClass}>
          <Phone className={iconClass} /> {pi.phone}
        </span>
      )}
      {pi.location && (
        <span className={itemClass}>
          <MapPin className={iconClass} /> {pi.location}
        </span>
      )}
      {pi.linkedin && (
        <span className={itemClass}>
          <LinkedinIcon className={iconClass} /> {pi.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
        </span>
      )}
      {pi.github && (
        <span className={itemClass}>
          <GithubIcon className={iconClass} /> {pi.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
        </span>
      )}
      {pi.website && (
        <span className={itemClass}>
          <Globe className={iconClass} /> {pi.website.replace(/^https?:\/\//, "")}
        </span>
      )}
    </div>
  );
}

export function SectionTitle({
  title,
  accentColor = "#4f46e5",
  variant = "line",
  className = "",
}: {
  title: string;
  accentColor?: string;
  variant?: "line" | "badge" | "underline" | "filled" | "minimal" | "left-bar";
  className?: string;
}) {
  if (variant === "badge") {
    return (
      <div className={`mb-2.5 ${className}`}>
        <span
          className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md text-white inline-block shadow-xs"
          style={{ backgroundColor: accentColor }}
        >
          {title}
        </span>
      </div>
    );
  }

  if (variant === "left-bar") {
    return (
      <div className={`flex items-center gap-2 mb-2.5 ${className}`}>
        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: accentColor }} />
        <h2
          className="text-xs font-black uppercase tracking-wider"
          style={{ color: accentColor }}
        >
          {title}
        </h2>
      </div>
    );
  }

  if (variant === "filled") {
    return (
      <div
        className={`px-2.5 py-1 rounded mb-2.5 ${className}`}
        style={{ backgroundColor: `${accentColor}18` }}
      >
        <h2
          className="text-xs font-black uppercase tracking-wider"
          style={{ color: accentColor }}
        >
          {title}
        </h2>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <h2
        className={`text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 mb-2 ${className}`}
      >
        {title}
      </h2>
    );
  }

  // Default "line" or "underline"
  return (
    <h2
      className={`text-xs font-black uppercase tracking-wider pb-1 mb-2.5 border-b resume-section-header ${className}`}
      style={{
        color: accentColor,
        borderColor: `${accentColor}35`,
      }}
    >
      {title}
    </h2>
  );
}
