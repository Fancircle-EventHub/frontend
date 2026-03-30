"use client";

import {
  useGuestEventMeetupsQuery,
  useGuestMeetupJoinMutation,
  useGuestMeetupLeaveMutation,
} from "@/apis/guest.api";
import type { GuestMeetupItem } from "@/types/guest-meetup.types";
import { extractApiErrorMessage } from "@/lib/api-error";
import { guestHub } from "@/lib/guest-event-branding";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";

type Props = {
  accessCode: string;
};

function meetupInitial(title: string) {
  const t = title.trim();
  return t ? t.slice(0, 1).toUpperCase() : "M";
}

function formatMeetupHighlight(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function meetupVenueMeta(m: GuestMeetupItem): string {
  const parts: string[] = [m.location];
  if (m.max_capacity != null && m.spots_left !== null) {
    parts.push(m.spots_left === 0 ? "Full" : `${m.spots_left} spots free`);
  } else if (m.max_capacity != null) {
    parts.push(`${m.participant_count}/${m.max_capacity} going`);
  } else {
    parts.push(`${m.participant_count} going`);
  }
  return parts.join(" · ");
}

export function GuestEventMeetupsContent({ accessCode }: Props) {
  const { data, isLoading, isError, refetch } = useGuestEventMeetupsQuery(accessCode, { skip: !accessCode });
  const [join, { isLoading: joining }] = useGuestMeetupJoinMutation();
  const [leave, { isLoading: leaving }] = useGuestMeetupLeaveMutation();
  const busy = joining || leaving;

  if (isLoading) {
    return <PageCenterSpinner />;
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-300">Couldn&apos;t load meetups.</p>
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

  const meetups = data.data.meetups;

  return (
    <section className={`rounded-2xl border border-white/10 p-4 sm:p-5 ${guestHub.surface}`}>
      <h2 className={`text-xl font-bold tracking-tight ${guestHub.accent}`}>Meetups</h2>
      <p className={`mt-1 text-sm ${guestHub.fgMuted}`}>Join fan meetups before the show — coordinated here, no DMs.</p>

      {meetups.length === 0 ? (
        <p className={`mt-8 rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm ${guestHub.fgMuted}`}>
          No meetups scheduled yet. Check back soon.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {meetups.map((m) => (
            <li
              key={m.id}
              className="flex gap-3 rounded-2xl border border-white/10 bg-[color:var(--guest-bg)]/40 p-3 sm:gap-4 sm:p-4"
            >
              <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-sm font-bold sm:size-14 sm:text-base">
                <span className={guestHub.fg}>{meetupInitial(m.title)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold leading-snug sm:text-base ${guestHub.fg}`}>{m.title}</p>
                <p className={`mt-1 text-xs leading-relaxed ${guestHub.fgMuted}`}>{meetupVenueMeta(m)}</p>
                <p className={`mt-1.5 text-sm font-bold sm:text-base ${guestHub.accent}`}>{formatMeetupHighlight(m.meetup_at)}</p>
                {m.description?.trim() ? (
                  <p className={`mt-1 line-clamp-2 text-xs ${guestHub.accent} opacity-90`}>Details: {m.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end justify-center self-center">
                {m.joined ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      try {
                        await leave({ accessCode, meetupId: m.id }).unwrap();
                      } catch (e) {
                        alert(extractApiErrorMessage(e));
                      }
                    }}
                    className={`rounded-lg border border-white/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide transition disabled:opacity-50 ${guestHub.fgMuted} ${guestHub.cardHoverBorder}`}
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy || (m.spots_left !== null && m.spots_left <= 0)}
                    onClick={async () => {
                      try {
                        await join({ accessCode, meetupId: m.id }).unwrap();
                      } catch (e) {
                        alert(extractApiErrorMessage(e));
                      }
                    }}
                    className={`rounded-lg px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-[#0a0a0a] hover:brightness-95 disabled:opacity-50 ${guestHub.accentBg}`}
                  >
                    Join
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
