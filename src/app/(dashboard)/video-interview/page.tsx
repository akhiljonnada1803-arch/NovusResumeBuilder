import type { Metadata } from "next";
import { VideoInterviewPageClient } from "./client";

export const metadata: Metadata = {
  title: "Video Interview | Novus Resume AI",
  description:
    "Practice job interviews face-to-face with an AI recruiter. Real-time eye contact, posture, and delivery analysis with a full performance report.",
};

export default function VideoInterviewPage() {
  return <VideoInterviewPageClient />;
}
