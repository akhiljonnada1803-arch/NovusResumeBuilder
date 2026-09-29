import { PortfolioTheme, PortfolioSectionConfig } from "./portfolio";
import { Resume } from "./resume";

export interface DeploymentLogEntry {
  id: string;
  timestamp: string;
  phase: "init" | "bundle" | "synthesis" | "upload" | "edge_route" | "domain" | "ready" | "error";
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export type VercelDeploymentState =
  | "IDLE"
  | "INITIALIZING"
  | "COMPILING"
  | "UPLOADING"
  | "BUILDING"
  | "READY"
  | "ERROR";

export interface VercelProject {
  id: string;
  name: string;
  framework?: string;
  accountId?: string;
  updatedAt?: number;
  latestDeployments?: {
    id: string;
    url: string;
    readyState: string;
  }[];
}

export interface VercelDeploymentResult {
  success: boolean;
  deploymentId: string;
  projectName: string;
  url: string;
  rawUrl: string;
  state: VercelDeploymentState;
  logs: DeploymentLogEntry[];
  deployedAt: string;
  customDomain?: string;
  isDemoFallback?: boolean;
}

export interface VercelDeployPayload {
  resumeId: string;
  theme: PortfolioTheme;
  sectionsConfig: PortfolioSectionConfig[];
  projectName?: string;
  customDomain?: string;
  vercelToken?: string;
}
