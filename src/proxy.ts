import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Generate or propagate unique X-Request-ID for distributed tracing
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const host = request.headers.get("host") || "";
  const cleanHost = host.toLowerCase().split(":")[0];
  const url = request.nextUrl.clone();

  // Multi-tenant subdomain rewrite (e.g. alexrivera.novusresume.ai)
  if (
    cleanHost.endsWith(".novusresume.ai") &&
    cleanHost !== "novusresume.ai" &&
    cleanHost !== "app.novusresume.ai" &&
    cleanHost !== "staging.novusresume.ai"
  ) {
    if (url.pathname === "/") {
      url.pathname = "/p/sample-resume-1";
      const response = NextResponse.rewrite(url, {
        request: {
          headers: requestHeaders,
        },
      });
      response.headers.set("x-request-id", requestId);
      return response;
    }
  }

  const sessionResponse = await updateSession(request);
  sessionResponse.headers.set("x-request-id", requestId);
  return sessionResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images / assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
