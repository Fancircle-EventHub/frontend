import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";

/**
 * Static discoverable routes. Event-specific URLs (`/event/{code}`) are omitted here because
 * codes are not known at build time; add a data-driven sitemap route later if public indexing of
 * every hub is required.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
