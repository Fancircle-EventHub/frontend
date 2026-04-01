import { guestHub } from "@/lib/guest-event-branding";

export type GuestExternalPromoCardModel = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  external_url: string;
  button_label?: string | null;
  open_in_new_tab?: boolean;
};

type Props = {
  item: GuestExternalPromoCardModel;
};

export function GuestExternalPromoCard({ item }: Props) {
  const newTab = item.open_in_new_tab !== false;
  const cta = item.button_label?.trim() || null;

  return (
    <a
      href={item.external_url}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group relative block w-full overflow-hidden rounded-[28px] border border-white/10 shadow-xl transition hover:brightness-[1.04] ${guestHub.cardHoverBorder}`}
    >
      <div className="relative aspect-[2/1] w-full min-h-[140px] sm:aspect-[21/9] sm:min-h-[160px]">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-[color:var(--guest-card)] to-[color:var(--guest-bg)]"
            aria-hidden
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 pb-5 pt-16 sm:p-6 sm:pt-20">
          <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0 text-left">
              <p
                className={`text-lg font-bold leading-snug tracking-tight text-white drop-shadow-sm sm:text-xl ${guestHub.wrap} line-clamp-2`}
              >
                {item.title}
              </p>
              {item.subtitle?.trim() ? (
                <p className={`mt-1 line-clamp-2 text-sm text-white/75 drop-shadow ${guestHub.wrap}`}>
                  {item.subtitle.trim()}
                </p>
              ) : null}
            </div>
            {cta ? (
              <span
                className={`mt-3 inline-flex w-fit shrink-0 items-center justify-center self-start rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#0a0a0a] shadow-lg sm:mt-0 sm:self-end ${guestHub.accentBg}`}
              >
                {cta}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </a>
  );
}
