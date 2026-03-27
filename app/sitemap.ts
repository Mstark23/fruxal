import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL || "https://fruxal.ca";

  const grantSlugs = ["sred-tax-credit", "cdap", "canada-job-grant"];

  const corePages: MetadataRoute.Sitemap = [
    { url: base,                            lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/pricing`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/faq`,                   lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/register`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/login`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/legal/privacy`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${base}/legal/terms`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
  ];

  const grantPages: MetadataRoute.Sitemap = grantSlugs.map(slug => ({
    url: `${base}/grants/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Additional pages
  const extraPages: MetadataRoute.Sitemap = [
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/forgot-password`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...corePages, ...grantPages, ...extraPages];
}
