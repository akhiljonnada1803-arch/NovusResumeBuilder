import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Novus Resume AI - Production-Ready AI Resume Builder",
    short_name: "Novus AI",
    description: "Build high-converting, ATS-compliant resumes with real-time AI bullet enhancement and live preview.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
