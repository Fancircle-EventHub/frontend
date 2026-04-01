import type { Metadata } from "next";
import {
  BRAND_NAME,
  getMetadataBase,
  getSiteUrl,
  PRODUCT_NAME,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_TITLE,
  TITLE_TEMPLATE,
} from "@/lib/site-config";

const ogLocale = SITE_LOCALE.replace("_", "-");

export const rootMetadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: SITE_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  applicationName: PRODUCT_NAME,
  authors: [{ name: BRAND_NAME }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  keywords: ["events", "social", "networking", "Fancircle", "event hub", "live events", "guest access"],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: ogLocale,
    siteName: PRODUCT_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: getSiteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      [ogLocale]: "/",
    },
  },
};
