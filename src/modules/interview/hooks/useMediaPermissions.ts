"use client";

import { useState, useEffect, useCallback } from "react";
import { globalCameraManager, CameraDiagnosticsInfo, CameraPermissionStatus } from "../video/camera-manager";

export function useMediaPermissions(autoRequest = false, audioOnly = false) {
  const [diagnostics, setDiagnostics] = useState<CameraDiagnosticsInfo>(globalCameraManager.getDiagnostics());
  const [stream, setStream] = useState<MediaStream | null>(globalCameraManager.getStream());

  useEffect(() => {
    const unsubscribe = globalCameraManager.subscribe((diag) => {
      setDiagnostics(diag);
      setStream(globalCameraManager.getStream());
    });
    return () => unsubscribe();
  }, []);

  const requestPermissions = useCallback(
    async (
      customAudioOnly = audioOnly,
      preferredVideoId?: string,
      preferredAudioId?: string
    ) => {
      const res = await globalCameraManager.requestPermissions(
        customAudioOnly,
        preferredVideoId,
        preferredAudioId
      );
      setStream(res.stream);
      return res;
    },
    [audioOnly]
  );

  const stopStream = useCallback(() => {
    globalCameraManager.stopStream();
    setStream(null);
  }, []);

  useEffect(() => {
    if (autoRequest && diagnostics.status === "idle") {
      requestPermissions(audioOnly);
    }
  }, [autoRequest, audioOnly, diagnostics.status, requestPermissions]);

  return {
    stream,
    diagnostics,
    status: diagnostics.status,
    isGranted: diagnostics.status === "granted",
    isDenied: diagnostics.status === "denied",
    isUnavailable: diagnostics.status === "unavailable",
    requestPermissions,
    stopStream,
  };
}
