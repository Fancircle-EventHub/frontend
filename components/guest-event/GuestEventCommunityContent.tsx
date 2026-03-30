"use client";

import { useGuestEventCommunityQuery } from "@/apis/guest.api";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { guestHub } from "@/lib/guest-event-branding";

type Props = {
  accessCode: string;
};

const rankStyle = [
  "from-amber-500/25 to-amber-600/10 border-amber-500/40",
  "from-zinc-500/20 to-zinc-600/10 border-zinc-400/30",
  "from-orange-700/25 to-orange-900/10 border-orange-600/35",
];

export function GuestEventCommunityContent({ accessCode }: Props) {
  const { data, isLoading, isError, refetch } = useGuestEventCommunityQuery(accessCode, { skip: !accessCode });

  if (isLoading) {
    return <PageCenterSpinner />;
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-300">Couldn&apos;t load community stats.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className={`mt-4 text-xs font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
        >
          Try again
        </button>
      </div>
    );
  }

  const stats = data.data;
  const fans = stats.fan_count;
  const top = stats.top_image_uploaders ?? [];

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[color:var(--guest-elevated)] to-[color:var(--guest-bg)] p-6 shadow-inner">
        <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>Fans in this hub</p>
        <p className={`mt-2 font-mono text-5xl font-bold tabular-nums sm:text-6xl ${guestHub.fg}`}>{fans}</p>
        <p className={`mt-3 text-sm leading-relaxed ${guestHub.fgMuted} ${guestHub.wrap}`}>
          Guests who completed their event profile — ready to connect, upload, and explore.
        </p>
      </section>

      <section>
        <div className="mb-4 flex min-w-0 items-end justify-between gap-2">
          <div className="min-w-0">
            <h2 className={`text-lg font-semibold ${guestHub.fg} ${guestHub.wrap}`}>Top photographers</h2>
            <p className={`mt-1 text-sm ${guestHub.fgMuted} ${guestHub.wrap}`}>Most gallery photos shared (images only).</p>
          </div>
        </div>

        {top.length === 0 ? (
          <div className={`rounded-2xl border border-dashed border-white/15 px-5 py-10 text-center ${guestHub.surface}`}>
            <p className={`text-sm ${guestHub.fgMuted}`}>No photo uploads yet — open Upload and be the first on the board.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {top.map((u, i) => (
              <li
                key={u.guest_id}
                className={`flex items-center gap-4 rounded-2xl border bg-gradient-to-r p-4 ${rankStyle[i] ?? `border-white/10 from-[color:var(--guest-card)] to-[color:var(--guest-bg)]`}`}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-black/40 text-lg font-bold ${guestHub.accent}`}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className={`relative size-14 shrink-0 overflow-hidden rounded-full border-2 border-white/10 ${guestHub.surface}`}>
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    <div className={`flex size-full items-center justify-center text-lg ${guestHub.fgMuted}`}>?</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${guestHub.fg} ${guestHub.wrap}`}>{u.username ? `@${u.username}` : "Guest"}</p>
                  <p className={`text-xs ${guestHub.fgMuted}`}>
                    {u.image_upload_count} {u.image_upload_count === 1 ? "photo" : "photos"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
