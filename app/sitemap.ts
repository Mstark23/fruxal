import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL || "https://fruxal.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/prescan`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/scan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}
