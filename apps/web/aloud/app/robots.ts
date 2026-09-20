import { MetadataRoute } from "next";

// TODO: replace with your real production domain before deploying
const SITE_URL = "https://vibe-in-vibeinbackend.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/settings/", "/session/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}