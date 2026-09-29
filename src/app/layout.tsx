import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Novus Resume AI - Production-Ready AI Resume Builder",
  description:
    "Build high-converting, ATS-compliant resumes with real-time AI bullet enhancement, live previews, and instant PDF exports.",
  keywords: [
    "AI Resume Builder",
    "ATS Resume Scanner",
    "Next.js 15 Resume Builder",
    "CV Maker",
    "Software Engineer Resume",
  ],
  metadataBase: new URL("https://novusresume.ai"),
  openGraph: {
    title: "Novus Resume AI - Production-Ready AI Resume Builder",
    description:
      "Build high-converting, ATS-compliant resumes with real-time AI bullet enhancement, live previews, and instant PDF exports.",
    siteName: "Novus Resume AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novus Resume AI",
    description: "Build high-converting, ATS-compliant resumes with real-time AI bullet enhancement.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen selection:bg-primary/20 selection:text-primary`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
