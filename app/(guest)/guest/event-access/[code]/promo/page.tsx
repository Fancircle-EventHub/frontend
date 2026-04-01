"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { GuestExternalPromoCard } from "@/components/guest-event/GuestExternalPromoCard";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { guestHub } from "@/lib/guest-event-branding";
import { useGuestModuleRedirect } from "@/hooks/useGuestModuleRedirect";

const DEFAULT_HEADING = "You may also like";

export default function GuestEventPromoPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const gate = useGuestModuleRedirect(code, "tour_promotion");
  const { data: entryEnvelope, isLoading } = useEventEntryByCodeQuery(code, { skip: !code || gate !== "ok" });

  const event = entryEnvelope?.data;

  const items = (event?.external_promo_items ?? [])
    .filter((i) => i.is_active)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));

  const heading = (event?.external_promo_section_label?.trim() || DEFAULT_HEADING).trim();
  const base = `/guest/event-access/${code}`;

  if (gate !== "ok") {
    return <PageCenterSpinner fixed />;
  }

  if (isLoading) {
    return <PageCenterSpinner fixed />;
  }

  return (
    <div className="min-w-0 px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-3xl">
      <div className="mb-6">
        <Link
          href={base}
          className={`text-sm font-medium transition hover:underline ${guestHub.accent}`}
        >
          ← Back to home
        </Link>
      </div>

      <h1 className={`${guestHub.sectionHeading} ${guestHub.wrap}`}>{heading}</h1>
      <p className={`mt-2 text-sm ${guestHub.fgMuted} ${guestHub.wrap}`}>Links from the organizer — opens in a new tab when marked.</p>

      {items.length === 0 ? (
        <p className={`mt-8 text-sm ${guestHub.fgMuted}`}>No links here yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4 sm:gap-5">
          {items.map((item) => (
            <li key={item.id}>
              <GuestExternalPromoCard
                item={{
                  id: item.id,
                  title: item.title,
                  subtitle: item.subtitle,
                  image_url: item.image_url,
                  external_url: item.external_url,
                  button_label: item.button_label,
                  open_in_new_tab: item.open_in_new_tab,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
