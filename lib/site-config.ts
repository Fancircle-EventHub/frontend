/** Central branding and SEO defaults for Fancircle EventHub. */

export const BRAND_NAME = "Fancircle";
export const PRODUCT_NAME = "Fancircle EventHub";
export const SITE_TITLE = "Fancircle EventHub";
export const TITLE_TEMPLATE = "%s | Fancircle EventHub";

export const SITE_DESCRIPTION =
  "Fancircle EventHub is a private event engagement platform where organizers create event spaces and guests join through secure access flows to connect, participate, and engage during live events.";

export const SITE_LOCALE = "en_US";
export const APPLICATION_CATEGORY = "Events / Social / Networking";

/**
 * Canonical public URL for metadata, OG, sitemap, and robots.
 * Prefer NEXT_PUBLIC_APP_URL in production; Vercel provides VERCEL_URL when unset.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;

  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}
