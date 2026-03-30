"use client";

import { useCallback, useState } from "react";
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

function MeetupDescription({
  meetupId,
  description,
  expanded,
  onToggle,
}: {
  meetupId: string;
  description: string;
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  const desc = description.trim();
  const needsToggle = desc.length > 140;
  return (
    <div className="mt-2">
      <p
        className={`text-xs leading-relaxed ${guestHub.fgMuted} ${guestHub.wrap} ${needsToggle && !expanded ? "line-clamp-2" : ""}`}
      >
        {desc}
      </p>
      {needsToggle ? (
        <button
          type="button"
          onClick={() => onToggle(meetupId)}
          aria-expanded={expanded}
          className={`mt-1 text-[11px] font-semibold uppercase tracking-wide underline-offset-2 hover:underline ${guestHub.accent}`}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}

export function GuestEventMeetupsContent({ accessCode }: Props) {
  const { data, isLoading, isError, refetch } = useGuestEventMeetupsQuery(accessCode, { skip: !accessCode });
  const [join, { isLoading: joining }] = useGuestMeetupJoinMutation();
  const [leave, { isLoading: leaving }] = useGuestMeetupLeaveMutation();
  const busy = joining || leaving;
  const [expandedDescIds, setExpandedDescIds] = useState<Set<string>>(() => new Set());

  const toggleDescription = useCallback((id: string) => {
    setExpandedDescIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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
      <p className={`mt-1 text-sm ${guestHub.fgMuted}`}>
        Participate in fan meetups before the show — coordinated here, no DMs.
      </p>

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
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold leading-snug sm:text-base ${guestHub.fg} ${guestHub.wrap}`}>{m.title}</p>
                <p className={`mt-1 text-xs leading-relaxed ${guestHub.fgMuted} ${guestHub.wrap}`}>{meetupVenueMeta(m)}</p>
                <p className={`mt-1.5 text-sm font-bold sm:text-base ${guestHub.accent} ${guestHub.wrap}`}>
                  {formatMeetupHighlight(m.meetup_at)}
                </p>
                {m.description?.trim() ? (
                  <MeetupDescription
                    meetupId={m.id}
                    description={m.description}
                    expanded={expandedDescIds.has(m.id)}
                    onToggle={toggleDescription}
                  />
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
                    Participate
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
