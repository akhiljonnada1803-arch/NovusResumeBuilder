import { CustomDomainConfig, PortfolioDeployment } from "@/types/hosting";
import { SAMPLE_RESUMES } from "@/lib/mock-data";

/**
 * Fix #16: Deterministic verification token derived from the domain name via djb2 hash.
 * Guarantees the same domain always gets the same TXT value — no persistence required.
 */
function domainVerificationToken(domain: string): string {
  let h = 5381;
  for (let i = 0; i < domain.length; i++) {
    h = ((h << 5) + h + domain.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

/**
 * Validates whether a candidate subdomain handle is valid and available
 */
export function validateSubdomainHandle(handle: string): { valid: boolean; error?: string } {
  const clean = handle.trim().toLowerCase();
  if (clean.length < 3) {
    return { valid: false, error: "Subdomain must be at least 3 characters long" };
  }
  if (clean.length > 32) {
    return { valid: false, error: "Subdomain cannot exceed 32 characters" };
  }
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(clean)) {
    return { valid: false, error: "Subdomain can only contain lowercase letters, numbers, and hyphens" };
  }
  const reserved = ["api", "app", "dashboard", "admin", "staging", "mail", "cdn", "assets", "auth", "login", "signup", "settings"];
  if (reserved.includes(clean)) {
    return { valid: false, error: `'${clean}' is a reserved subdomain name` };
  }
  return { valid: true };
}

/**
 * Generates standard DNS configuration instructions for a custom domain
 */
export function generateDomainDnsConfig(domain: string): CustomDomainConfig {
  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const isApex = !cleanDomain.includes(".") || cleanDomain.split(".").length === 2;
  const host = isApex ? "@" : cleanDomain.split(".")[0];

  return {
    domain: cleanDomain,
    status: "pending",
    cnameRecord: {
      type: "CNAME",
      host: host === "@" ? "www" : host,
      value: "cname.novusresume.ai",
      status: "pending",
    },
    txtRecord: {
      type: "TXT",
      host: `_novus-verification.${cleanDomain}`,
      value: `novus-site-verification=${domainVerificationToken(cleanDomain)}`,
      status: "pending",
    },
    sslActive: false,
  };
}

/**
 * Simulates real-time DNS verification for custom domain records
 */
export async function verifyCustomDomainDNS(domainConfig: CustomDomainConfig): Promise<CustomDomainConfig> {
  // TODO: Replace stub with real DNS verification via Node `dns.promises.resolveCname` or
  // Cloudflare for SaaS API. Currently fakes verification based on domain string content.
  await new Promise((res) => setTimeout(res, 800));

  const isConfigured = Boolean(domainConfig.domain && !domainConfig.domain.includes("error"));

  return {
    ...domainConfig,
    status: isConfigured ? "verified" : "failed",
    cnameRecord: {
      ...domainConfig.cnameRecord,
      status: isConfigured ? "valid" : "invalid",
    },
    txtRecord: {
      ...domainConfig.txtRecord,
      status: isConfigured ? "valid" : "invalid",
    },
    sslActive: isConfigured,
    verifiedAt: isConfigured ? new Date().toISOString() : undefined,
  };
}

/**
 * Resolves a request hostname to a deployment or fallback resume
 */
export function resolveHostnameToResume(hostname: string): { resumeId: string; isCustomDomain: boolean; subdomain?: string } {
  const cleanHost = hostname.toLowerCase().split(":")[0];

  // TODO: Replace with a real database lookup keyed on subdomain/custom-domain.
  // Currently returns SAMPLE_RESUMES[0] for ALL hostnames — routing is not implemented.

  // Check if it matches *.novusresume.ai
  if (cleanHost.endsWith(".novusresume.ai") && cleanHost !== "novusresume.ai" && cleanHost !== "app.novusresume.ai") {
    const subdomain = cleanHost.replace(".novusresume.ai", "");
    return {
      resumeId: SAMPLE_RESUMES[0].id,
      isCustomDomain: false,
      subdomain,
    };
  }

  // Check custom domain
  if (cleanHost !== "localhost" && !cleanHost.includes("127.0.0.1") && !cleanHost.endsWith(".novusresume.ai")) {
    return {
      resumeId: SAMPLE_RESUMES[0].id,
      isCustomDomain: true,
    };
  }

  return {
    resumeId: SAMPLE_RESUMES[0].id,
    isCustomDomain: false,
  };
}
