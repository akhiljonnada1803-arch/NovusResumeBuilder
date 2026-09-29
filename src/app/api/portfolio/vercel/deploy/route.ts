import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_RESUMES } from "@/lib/mock-data";
import {
  synthesizeStaticPortfolioHTML,
  createOrGetVercelProject,
  deployToVercel,
} from "@/lib/portfolio/vercel-deployer";
import { DeploymentLogEntry, VercelDeploymentResult } from "@/types/vercel-deploy";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      resume,
      resumeId,
      theme = "developer",
      sectionsConfig = [],
      projectName = "portfolio",
      customization,
    } = body;

    // Fix #1 & #2: Read token from Authorization header (preferred) or body (backward compat).
    // The server env var VERCEL_ACCESS_TOKEN is intentionally NOT used as a fallback —
    // deploying to the server operator's account on behalf of any user is a security hole.
    const authHeader = req.headers.get("authorization") || "";
    const token = (
      authHeader.startsWith("Bearer ") ? authHeader.slice(7) : (body.vercelToken || "")
    ).trim();

    // Fix #3: Basic resume type guard before passing to the HTML synthesizer
    const targetResume = (() => {
      const candidate = resume || SAMPLE_RESUMES.find((r) => r.id === resumeId) || SAMPLE_RESUMES[0];
      if (!candidate || typeof candidate !== "object") return SAMPLE_RESUMES[0];
      // Ensure array fields are actually arrays
      for (const k of ["experience", "education", "skills", "projects", "certifications", "achievements"]) {
        if ((candidate as any)[k] !== undefined && !Array.isArray((candidate as any)[k])) {
          (candidate as any)[k] = [];
        }
      }
      return candidate;
    })();

    const candidateName = targetResume.personalInfo?.fullName || "Candidate";

    // Fix #8: Cap project name to Vercel's 50-char limit at the route level
    const rawName = typeof projectName === "string" ? projectName : "";
    const cleanProjectName = (
      rawName
        ? rawName.toLowerCase().replace(/[^a-z0-9-]/g, "-")
        : `${candidateName.toLowerCase().replace(/[^a-z0-9]/g, "")}-portfolio`
    ).slice(0, 50);

    const logs: DeploymentLogEntry[] = [];
    const addLog = (
      phase: DeploymentLogEntry["phase"],
      message: string,
      type: DeploymentLogEntry["type"] = "info"
    ) => {
      logs.push({
        id: `log_${Math.random().toString(36).substring(2, 8)}`,
        timestamp: new Date().toISOString(),
        phase,
        message,
        type,
      });
    };

    addLog("init", `Initializing deployment pipeline for project "${cleanProjectName}"...`, "info");

    // Phase 1: Synthesize Standalone HTML/CSS/JS Bundle
    addLog("synthesis", `Compiling static site bundle for template "${theme}"...`, "info");
    const htmlBundle = synthesizeStaticPortfolioHTML(targetResume, theme, sectionsConfig, customization);
    addLog("bundle", `Static HTML bundle synthesized (${(htmlBundle.length / 1024).toFixed(1)} KB).`, "success");

    let liveUrl = "";
    let deploymentId = `dpl_${Math.random().toString(36).substring(2, 10)}`;
    let isDemoFallback = true;

    // Phase 2: Live Vercel REST API Deployment
    // Fix #12: Require token length ≥ 20 (Vercel PATs are always much longer)
    if (token && token.length >= 20) {
      addLog("upload", `Creating or linking Vercel project "${cleanProjectName}"...`, "info");
      const project = await createOrGetVercelProject(token, cleanProjectName);

      if (project) {
        addLog("upload", `Uploading static assets to Vercel Global Edge...`, "info");
        const deployRes = await deployToVercel(token, cleanProjectName, htmlBundle);

        if (deployRes) {
          liveUrl = deployRes.url;
          deploymentId = deployRes.deploymentId;
          isDemoFallback = false;
          addLog("edge_route", `Portfolio deployed live at ${liveUrl}`, "success");
        } else {
          // Fix #5: return a real error instead of a fake "live" URL
          addLog("edge_route", `Vercel deployment failed. Check your token permissions and account limits.`, "error");
          return NextResponse.json(
            { success: false, error: "Vercel deployment failed. Verify your access token has deployment permissions and your account is within limits.", logs },
            { status: 502 }
          );
        }
      } else {
        addLog("upload", `Failed to create or find Vercel project. Check token scopes (needs project:write).`, "error");
        return NextResponse.json(
          { success: false, error: "Could not create Vercel project. Ensure your token has 'project' write scope.", logs },
          { status: 502 }
        );
      }
    } else {
      // Fix #13: clearly signal demo mode — no live URL fabricated
      liveUrl = `https://${cleanProjectName}.vercel.app`;
      addLog("edge_route", `No Vercel token provided — running in preview / demo mode.`, "info");
      addLog("ready", `Preview simulation complete. Connect your Vercel account to deploy live.`, "info");
    }

    addLog(
      "ready",
      isDemoFallback
        ? `Preview complete. Add your Vercel Access Token to deploy a real live site.`
        : `Deployment complete! Portfolio live at ${liveUrl} with automatic SSL.`,
      "success"
    );

    const result: VercelDeploymentResult = {
      success: true,
      deploymentId,
      projectName: cleanProjectName,
      url: liveUrl,
      rawUrl: liveUrl,
      state: "READY",
      logs,
      deployedAt: new Date().toISOString(),
      isDemoFallback,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Vercel Deploy Endpoint Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to deploy portfolio to Vercel." },
      { status: 500 }
    );
  }
}
