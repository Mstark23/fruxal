import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/settings", "/stats", "/admin", "/api/"] },
    ],
    sitemap: `${process.env.NEXTAUTH_URL || "https://fruxal.com"}/sitemap.xml`,
  };
}
