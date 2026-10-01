export const BRAND_NAME = "eventees";
export const PRODUCT_NAME = "eventees";
export const SITE_TITLE = "eventees";
export const TITLE_TEMPLATE = "%s | eventees";

export const SITE_DESCRIPTION =
  "Dein Event. Deine Community. eventees verbindet Menschen vor, während und nach Live-Events.";

export const SITE_LOCALE = "de_DE";
export const APPLICATION_CATEGORY = "Events / Social / Networking";

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
