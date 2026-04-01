import Link from "next/link";
import type { EventExternalPromoItem } from "@/types/event.types";
import { GuestExternalPromoCard } from "@/components/guest-event/GuestExternalPromoCard";
import { guestHub } from "@/lib/guest-event-branding";

type Props = {
  items: EventExternalPromoItem[];
  heading?: string | null;
  showMoreHref?: string | null;
};

const DEFAULT_HEADING = "You may also like";

export function GuestExternalPromoSection({ items, heading, showMoreHref }: Props) {
  if (items.length === 0) return null;

  const label = (heading?.trim() || DEFAULT_HEADING).trim();
  const moreHref = showMoreHref?.trim() ?? "";

  return (
    <section aria-labelledby="external-promo-heading">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h2 id="external-promo-heading" className={`min-w-0 flex-1 ${guestHub.sectionHeading} ${guestHub.wrap}`}>
          {label}
        </h2>
        {moreHref ? (
          <Link
            href={moreHref}
            className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
          >
            Show more
          </Link>
        ) : null}
      </div>
      <ul className="mt-4 flex flex-col gap-4 sm:gap-5">
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
    </section>
  );
}
