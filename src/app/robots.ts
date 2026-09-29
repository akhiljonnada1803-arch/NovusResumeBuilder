import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://novusresume.ai";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/templates", "/p/"],
        disallow: ["/api/", "/dashboard/", "/builder/", "/settings/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
