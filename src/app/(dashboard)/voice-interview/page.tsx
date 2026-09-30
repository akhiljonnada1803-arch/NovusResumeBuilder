import type { Metadata } from "next";
import { VoiceInterviewPageClient } from "./client";

export const metadata: Metadata = {
  title: "Voice Interview | Novus Resume AI",
  description:
    "Practice job interviews with an AI voice coach. Speak your answers naturally and receive instant STAR-method feedback with scoring.",
};

export default function VoiceInterviewPage() {
  return <VoiceInterviewPageClient />;
}
