/**
 * Tauri v2 Desktop Bridge
 * Seamlessly interfaces with native OS APIs when running inside Desktop (Windows, macOS, Linux)
 * and gracefully falls back to browser standard web APIs when running on the web.
 */

export interface DesktopAppMetadata {
  isDesktop: boolean;
  name: string;
  version: string;
  platform: "windows" | "macos" | "linux" | "web";
  arch?: string;
}

/**
 * Detects if the current environment is running inside the Tauri native desktop webview
 */
export function isTauri(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as any).__TAURI__ ||
    (window as any).__TAURI_INTERNALS__ ||
    (window as any).__TAURI_METADATA__
  );
}

/**
 * Retrieves native desktop metadata
 */
export async function getDesktopMetadata(): Promise<DesktopAppMetadata> {
  if (!isTauri()) {
    return {
      isDesktop: false,
      name: "Novus Resume AI Web",
      version: "1.0.0",
      platform: "web",
    };
  }

  try {
    const tauri = (window as any).__TAURI__;
    if (tauri && tauri.core && tauri.core.invoke) {
      const info = await tauri.core.invoke("get_desktop_info");
      return {
        isDesktop: true,
        name: info.name || "Novus Resume AI",
        version: info.version || "1.0.0",
        platform: (info.platform || "windows").toLowerCase() as any,
        arch: info.arch,
      };
    }
  } catch (e) {
    console.warn("Could not retrieve Tauri desktop info:", e);
  }

  return {
    isDesktop: true,
    name: "Novus Resume AI Desktop",
    version: "1.0.0",
    platform: "windows",
  };
}

/**
 * Saves a file using Native OS Save File Dialog when running in desktop,
 * or browser anchor download when running on the web.
 */
export async function saveFileWithNativeFallback(
  fileName: string,
  dataUrlOrBase64: string,
  mimeType = "application/pdf"
): Promise<{ success: boolean; path?: string }> {
  if (isTauri()) {
    try {
      const tauri = (window as any).__TAURI__;
      if (tauri && tauri.core && tauri.core.invoke) {
        const cleanBase64 = dataUrlOrBase64.includes(",")
          ? dataUrlOrBase64.split(",")[1]
          : dataUrlOrBase64;

        const res = await tauri.core.invoke("save_native_file", {
          fileName,
          contentBase64: cleanBase64,
        });

        if (res && res.success) {
          return { success: true, path: res.path };
        }
      }
    } catch (err) {
      console.warn("Tauri native save dialog fallback to web download:", err);
    }
  }

  // Web Browser Standard Download Fallback
  if (typeof window !== "undefined") {
    const link = document.createElement("a");
    link.href = dataUrlOrBase64;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true };
  }

  return { success: false };
}

/**
 * Registers deep link listener for OAuth and project links (e.g. novus://auth/callback)
 */
export function initDesktopDeepLinkHandler(onDeepLink: (url: string) => void): () => void {
  if (!isTauri() || typeof window === "undefined") {
    return () => {};
  }

  const handleDeepLinkEvent = (event: any) => {
    if (event.detail && typeof event.detail === "string") {
      onDeepLink(event.detail);
    }
  };

  window.addEventListener("tauri://deep-link", handleDeepLinkEvent);
  return () => {
    window.removeEventListener("tauri://deep-link", handleDeepLinkEvent);
  };
}
