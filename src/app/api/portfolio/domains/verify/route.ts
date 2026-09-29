import { NextResponse } from "next/server";
import { generateDomainDnsConfig, verifyCustomDomainDNS } from "@/lib/portfolio/domain-resolver";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domain, existingConfig } = body;

    if (!domain && !existingConfig) {
      return NextResponse.json({ error: "Domain name is required" }, { status: 400 });
    }

    const config = existingConfig || generateDomainDnsConfig(domain);
    const verifiedConfig = await verifyCustomDomainDNS(config);

    return NextResponse.json({
      success: true,
      domainConfig: verifiedConfig,
      message: verifiedConfig.status === "verified"
        ? `Custom domain '${verifiedConfig.domain}' verified and SSL certificate provisioned.`
        : `DNS records for '${verifiedConfig.domain}' are still propagating. Please verify your CNAME record.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify custom domain" }, { status: 500 });
  }
}
