import type { RelatedEventSummary } from "@/types/event.types";
import { guestHub } from "@/lib/guest-event-branding";

type Props = {
  related: RelatedEventSummary[];
};

export function GuestTourPromotionSection({ related }: Props) {
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="tour-promotion-heading">
      <h2
        id="tour-promotion-heading"
        className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.accent}`}
      >
        You might also like
      </h2>
      <ul className="mt-3 space-y-3">
        {related.map((r) => (
          <li key={r.id}>
            <a
              href={r.join_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative block overflow-hidden rounded-[1.75rem] border border-white/10 shadow-lg transition hover:brightness-[1.03] ${guestHub.cardHoverBorder}`}
            >
              <div className="relative min-h-[7.5rem] sm:min-h-[6.5rem]">
                {r.hero_image_url ? (
                  <img
                    src={r.hero_image_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-[color:var(--guest-card)] to-[color:var(--guest-bg)]"
                    aria-hidden
                  />
                )}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/25"
                  aria-hidden
                />
                <div className="relative flex min-h-[7.5rem] flex-col justify-end p-4 pr-4 sm:min-h-[6.5rem] sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className={`text-base font-bold leading-tight text-white drop-shadow-md sm:text-lg ${guestHub.wrap} line-clamp-2`}>
                      {r.artist?.trim() || "Artist"}
                    </p>
                    <p className={`mt-1 line-clamp-2 text-sm text-white/80 drop-shadow ${guestHub.wrap}`}>{r.title}</p>
                    {(r.event_date || r.venue || r.city) && (
                      <p className={`mt-1 line-clamp-2 text-xs text-white/55 ${guestHub.wrap}`}>
                        {[r.event_date, r.venue, r.city].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <span
                    className={`mt-3 inline-flex w-fit shrink-0 items-center justify-center rounded-lg px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#0a0a0a] shadow-md sm:mt-0 ${guestHub.accentBg}`}
                  >
                    Tickets
                  </span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
