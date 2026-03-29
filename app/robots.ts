import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/organization/", "/guest", "/guest/"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
