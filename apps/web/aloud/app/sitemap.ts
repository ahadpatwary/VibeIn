import { MetadataRoute } from "next";

// TODO: replace with your real production domain before deploying
const SITE_URL = "https://vibe-in-vibeinbackend.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/how-it-works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/for-developers`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/for-interview-prep`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Add more routes here as you build them out (blog posts, use-case pages, etc.)
  ];
}