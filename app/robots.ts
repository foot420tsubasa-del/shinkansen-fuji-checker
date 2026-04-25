import type { MetadataRoute } from "next";

const siteUrl = "https://fujiseat.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/*/admin", "/questions", "/*/questions", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
