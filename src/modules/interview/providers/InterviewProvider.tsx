"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useInterviewSession, InterviewSessionConfig } from "../hooks/useInterviewSession";
import { useMediaPermissions } from "../hooks/useMediaPermissions";

type InterviewContextType = ReturnType<typeof useInterviewSession> & {
  media: ReturnType<typeof useMediaPermissions>;
};

const InterviewContext = createContext<InterviewContextType | null>(null);

export function InterviewProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: InterviewSessionConfig;
}) {
  const session = useInterviewSession(config);
  const media = useMediaPermissions(false, false);

  return (
    <InterviewContext.Provider value={{ ...session, media }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return ctx;
}
