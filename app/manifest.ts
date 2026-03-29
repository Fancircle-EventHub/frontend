import type { MetadataRoute } from "next";
import { getSiteUrl, PRODUCT_NAME, SITE_DESCRIPTION } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  const base = getSiteUrl();

  return {
    name: PRODUCT_NAME,
    short_name: "EventHub",
    description: SITE_DESCRIPTION,
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#23272f",
    theme_color: "#fddc53",
    categories: ["events", "social", "networking"],
    lang: "en-US",
    dir: "ltr",
    icons: [
      {
        src: `${base}/icon`,
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}/apple-icon`,
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
