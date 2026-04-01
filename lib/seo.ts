import type { Metadata } from "next";
import { getCachedEventEntryByCode } from "@/lib/server/event-entry";
import { PRODUCT_NAME, SITE_DESCRIPTION } from "@/lib/site-config";

function eventShareImages(heroUrl: string | null | undefined): NonNullable<Metadata["openGraph"]>["images"] {
  if (!heroUrl) return undefined;
  return [{ url: heroUrl, alt: "" }];
}

export async function metadataForEventScopedPage(
  params: Promise<{ code: string }>,
  label: string,
  options?: { description?: string; canonical?: string },
): Promise<Metadata> {
  const { code } = await params;
  const event = await getCachedEventEntryByCode(code);
  const title = event ? `${label} · ${event.title}` : label;
  const description =
    options?.description ??
    (event?.description?.trim()
      ? event.description.length > 160
        ? `${event.description.slice(0, 157)}…`
        : event.description
      : SITE_DESCRIPTION);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: eventShareImages(event?.hero_image_url),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event?.hero_image_url ? [event.hero_image_url] : undefined,
    },
    ...(options?.canonical ? { alternates: { canonical: options.canonical } } : {}),
  };
}

export async function metadataForPublicEventEntry(params: Promise<{ code: string }>): Promise<Metadata> {
  const { code } = await params;
  const event = await getCachedEventEntryByCode(code);
  const title = event?.title ?? "Event";
  const description = event?.description?.trim()
    ? event.description.length > 200
      ? `${event.description.slice(0, 197)}…`
      : event.description
    : `Join ${event?.title ?? "this event"} on ${PRODUCT_NAME}. Sign in or register to access the event hub, community, and updates.`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      images: eventShareImages(event?.hero_image_url),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event?.hero_image_url ? [event.hero_image_url] : undefined,
    },
    alternates: {
      canonical: `/event/${code}`,
    },
  };
}
