import { ConversationTurn, MultiSourceContext } from "../types/session";

export type DifficultyTier = "Foundational" | "Senior Engineer" | "Staff / Principal Bar Raiser";
export type QuestionStrategy = "clarification" | "challenge" | "technical-deep-dive" | "behavioral-tradeoff";

export interface CandidateClaim {
  id: string;
  topic: string;
  claimText: string;
  depthScore: number;
  stage: string;
  turnIndex: number;
  needsFollowup: boolean;
  questioned: boolean;
}

export class AdaptiveMemoryGraph {
  private claims: CandidateClaim[] = [];
  private discussedProjects: Set<string> = new Set();
  private discussedSkills: Set<string> = new Set();
  private previousQuestions: string[] = [];

  /**
   * Clears session memory for a fresh interview
   */
  public resetSession() {
    this.claims = [];
    this.discussedProjects.clear();
    this.discussedSkills.clear();
    this.previousQuestions = [];
  }

  /**
   * Analyzes conversation history to dynamically calculate candidate competency and active difficulty tier.
   */
  public computeDifficultyTier(history: ConversationTurn[]): DifficultyTier {
    const candidateTurns = history.filter((t) => t.speaker === "candidate");
    if (candidateTurns.length === 0) return "Senior Engineer";

    const scoredTurns = history
      .filter((t) => t.speaker === "recruiter" && t.evaluationSnippet?.score !== undefined)
      .map((t) => t.evaluationSnippet!.score);

    if (scoredTurns.length === 0) return "Senior Engineer";

    const avgScore = scoredTurns.reduce((a, b) => a + b, 0) / scoredTurns.length;

    if (avgScore >= 88) {
      return "Staff / Principal Bar Raiser";
    } else if (avgScore < 72) {
      return "Foundational";
    }
    return "Senior Engineer";
  }

  /**
   * Determines the optimal next questioning strategy (Clarification vs Challenge vs Deep Dive).
   */
  public selectNextStrategy(latestAnswer: string, history: ConversationTurn[]): QuestionStrategy {
    const text = latestAnswer.toLowerCase();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // 1. Challenge only on specific architectural bold claims (not casual mentions)
    const hasBoldArchitecturalClaim =
      text.includes("zero downtime") ||
      text.includes("always scalable") ||
      text.includes("infinitely") ||
      text.includes("kafka") ||
      // "guarantee" only counts in architectural context (e.g. "guarantee availability")
      (text.includes("guarantee") && (text.includes("availability") || text.includes("consistency") || text.includes("delivery"))) ||
      // "microservices" only counts when candidate claims to have built/designed them
      (text.includes("microservices") && (text.includes("built") || text.includes("deployed") || text.includes("designed") || text.includes("architected")));

    if (hasBoldArchitecturalClaim) {
      return "challenge";
    }

    // 2. If answer is brief (< 20 words) or lacks any analytical signal → Clarification
    if (
      wordCount < 20 ||
      (!text.includes("because") && !text.includes("ms") && !text.includes("%") && !text.includes("trade") && !text.includes("index") && !text.includes("lock"))
    ) {
      return "clarification";
    }

    // 3. Default to technical deep dive on implementation mechanics
    return "technical-deep-dive";
  }

  /**
   * Extracts concrete claims, technologies, and project mentions from the candidate's latest response.
   */
  public extractCandidateClaims(
    latestAnswer: string,
    stage: string,
    context: MultiSourceContext,
    turnIndex = 0
  ): CandidateClaim[] {
    const newClaims: CandidateClaim[] = [];
    const text = latestAnswer.toLowerCase();

    // 1. Detect technologies mentioned
    const knownTech = [
      "typescript", "javascript", "python", "go", "golang", "rust", "java", "c++",
      "react", "next.js", "node.js", "express", "fastapi", "django", "postgres", "postgresql",
      "redis", "mongodb", "supabase", "firebase", "kafka", "rabbitmq", "docker", "kubernetes",
      "aws", "gcp", "azure", "graphql", "rest", "grpc", "jwt", "oauth", "websockets", "vector"
    ];

    for (const tech of knownTech) {
      if (text.includes(tech)) {
        this.discussedSkills.add(tech);
        newClaims.push({
          id: `claim_${Date.now()}_${tech}`,
          topic: tech,
          claimText: latestAnswer.slice(0, 140),
          depthScore: text.includes("trade-off") || text.includes("latency") || text.includes("concurrency") ? 90 : 70,
          stage,
          turnIndex,
          needsFollowup: !text.includes("metric") && !text.includes("%") && !text.includes("ms"),
          questioned: false,
        });
      }
    }

    // 2. Track discussed projects
    for (const proj of context.portfolioProjects) {
      const projName = proj.split("(")[0].replace(/"/g, "").trim().toLowerCase();
      if (projName && (text.includes(projName) || projName.includes(text.slice(0, 15)))) {
        this.discussedProjects.add(projName);
      }
    }

    for (const repo of context.githubRepos) {
      const repoName = repo.split(":")[0].trim().toLowerCase();
      if (repoName && text.includes(repoName)) {
        this.discussedProjects.add(repoName);
      }
    }

    this.claims.push(...newClaims);
    return newClaims;
  }

  /**
   * Generates rich conversational memory summary to inject into the LLM context.
   */
  public generateMemorySummary(
    history: ConversationTurn[],
    context: MultiSourceContext,
    recruiterNotes: { note: string; stage: string }[],
    strategy: QuestionStrategy
  ): string {
    const tier = this.computeDifficultyTier(history);
    const recentNotes = recruiterNotes.slice(-3).map((n) => `[${n.stage}]: ${n.note}`);
    const unprobedClaims = this.claims.filter((c) => !c.questioned).slice(-3);

    const discussedProjectsList = Array.from(this.discussedProjects);
    const discussedSkillsList = Array.from(this.discussedSkills);

    return `
CONVERSATION MEMORY & RECRUITER SCRATCHPAD:
- Active Difficulty Tier: ${tier}
- Recommended Next Strategy: ${strategy.toUpperCase()}
${
  strategy === "clarification"
    ? "• STRATEGY: Candidate's explanation was high-level. Ask for explicit technical mechanics, quantifiable metrics, or implementation steps."
    : strategy === "challenge"
    ? "• STRATEGY: Probe edge cases, distributed failure modes (e.g. partition splits, caching thundering herds, race conditions), and trade-offs."
    : "• STRATEGY: Conduct a technical deep dive into underlying memory layout, serialization, concurrency locks, or database execution plans."
}

ACTIVE MEMORY LOG:
- Projects Already Discussed: ${discussedProjectsList.length > 0 ? discussedProjectsList.join(", ") : "None yet"}
- Skills Touched So Far: ${discussedSkillsList.length > 0 ? discussedSkillsList.join(", ") : "None yet"}
- Unprobed Candidate Claims:
${
  unprobedClaims.length > 0
    ? unprobedClaims.map((c) => `  * Turn ${c.turnIndex + 1} Claim (${c.topic.toUpperCase()}): "${c.claimText}"`).join("\n")
    : "  * No unprobed claims"
}

RECENT RECRUITER OBSERVATIONS:
${recentNotes.length > 0 ? recentNotes.join("\n") : "(First conversational turn)"}
`.trim();
  }
}

/**
 * Client-side singleton — used ONLY in browser components for local state tracking.
 * SERVER-SIDE code (API routes) must create a new AdaptiveMemoryGraph() per request
 * and rebuild state from the conversation history to avoid cross-user data leakage.
 */
export const globalAdaptiveMemoryGraph = new AdaptiveMemoryGraph();
