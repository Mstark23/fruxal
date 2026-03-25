import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/prescan", "/login", "/register", "/faq", "/legal/"],
        disallow: ["/v2/", "/api/", "/admin/", "/dashboard", "/settings", "/stats"],
      },
    ],
    sitemap: `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/sitemap.xml`,
  };
}
