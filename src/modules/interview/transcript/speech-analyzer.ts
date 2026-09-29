import { ConversationTurn } from "../types/session";
import { SpeechAnalytics } from "../types/scorecard";

/**
 * Computes deep speech analytics from candidate conversation turns.
 */
export function analyzeSpeechTranscript(
  turns: ConversationTurn[],
  durationMinutes: number
): SpeechAnalytics {
  const candidateTurns = turns.filter((t) => t.speaker === "candidate");
  const allCandidateWords = candidateTurns
    .map((t) => t.text)
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const totalWords = allCandidateWords.length;
  const safeDuration = Math.max(durationMinutes, 0.5);
  const speakingPaceWpm = Math.round(totalWords / safeDuration);

  // Spoken filler word detection
  const fillerWordList = ["um", "uh", "like", "you know", "actually", "basically", "sort of", "kind of"];
  const fillerWordsBreakdown: Record<string, number> = {};
  let fillerWordsCount = 0;

  fillerWordList.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const count = (candidateTurns.map((t) => t.text).join(" ").match(regex) || []).length;
    if (count > 0) {
      fillerWordsBreakdown[word] = count;
      fillerWordsCount += count;
    }
  });

  const avgWordsPerAnswer = candidateTurns.length > 0 ? Math.round(totalWords / candidateTurns.length) : 0;
  const hesitationScore = Math.min(100, Math.round((fillerWordsCount / Math.max(totalWords, 1)) * 100));

  return {
    speakingPaceWpm: totalWords > 0 ? speakingPaceWpm : 0,
    totalWords,
    fillerWordsCount,
    fillerWordsBreakdown,
    avgWordsPerAnswer,
    hesitationScore,
  };
}
