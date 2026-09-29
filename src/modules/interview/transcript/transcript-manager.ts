import { ConversationTurn } from "../types/session";

export class TranscriptManager {
  private turns: ConversationTurn[] = [];

  public reset() {
    this.turns = [];
  }

  public addTurn(turn: ConversationTurn) {
    this.turns.push(turn);
  }

  public getTurns(): ConversationTurn[] {
    return [...this.turns];
  }

  public getCandidateTurns(): ConversationTurn[] {
    return this.turns.filter((t) => t.speaker === "candidate");
  }

  public getFormattedTranscript(): string {
    return this.turns
      .map((t, idx) => `[Turn ${idx + 1} - ${t.speaker.toUpperCase()} - Stage: ${t.stage}]: "${t.text}"`)
      .join("\n\n");
  }

  public exportAsJson(): string {
    return JSON.stringify(this.turns, null, 2);
  }

  public exportAsMarkdown(candidateName: string, role: string): string {
    let md = `# Interview Transcript\n\n**Candidate:** ${candidateName}\n**Role:** ${role}\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n`;
    this.turns.forEach((turn, idx) => {
      const speaker = turn.speaker === "candidate" ? candidateName : "AI Recruiter";
      md += `### ${idx + 1}. ${speaker} (${turn.stage})\n*${turn.timestamp}*\n\n${turn.text}\n\n`;
      if (turn.recruiterReaction) {
        md += `> **Recruiter Reaction:** ${turn.recruiterReaction}\n\n`;
      }
    });
    return md;
  }
}

export const globalTranscriptManager = new TranscriptManager();
