"use client";

import { useCallback, useState } from "react";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import {
  useGuestEventMeetupsQuery,
  useGuestMeetupCreateMutation,
  useGuestMeetupJoinMutation,
  useGuestMeetupLeaveMutation,
} from "@/apis/guest.api";
import { GuestMeetupImageField } from "@/components/guest-event/GuestMeetupImageField";
import { FieldError, inputClassName, labelClass } from "@/components/organization-auth/auth-form-primitives";
import type { GuestMeetupItem } from "@/types/guest-meetup.types";
import { dateAndTimePartsToIso, formatMeetupSchedule } from "@/lib/datetime-form";
import { extractApiErrorMessage } from "@/lib/api-error";
import { guestHub } from "@/lib/guest-event-branding";
import { partitionMeetupsByHost } from "@/lib/guest-meetups";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";

type Props = {
  accessCode: string;
};

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

function GuestHostsDivider() {
  return (
    <div className="mt-8 flex items-center gap-3" role="separator" aria-label="Guest hosts">
      <hr className="min-w-0 flex-1 border-white/15" />
      <span className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] ${guestHub.fgMuted}`}>GUEST HOSTS</span>
      <hr className="min-w-0 flex-1 border-white/15" />
    </div>
  );
}

type MeetupCardProps = {
  m: GuestMeetupItem;
  accessCode: string;
  busy: boolean;
  expandedDescIds: Set<string>;
  onToggleDescription: (id: string) => void;
  join: ReturnType<typeof useGuestMeetupJoinMutation>[0];
  leave: ReturnType<typeof useGuestMeetupLeaveMutation>[0];
};

function MeetupCard({ m, accessCode, busy, expandedDescIds, onToggleDescription, join, leave }: MeetupCardProps) {
  return (
    <li className="flex gap-3 rounded-2xl border border-white/10 bg-[color:var(--guest-bg)]/40 p-3 sm:gap-4 sm:p-4">
      <div className="relative size-11 shrink-0 self-start overflow-hidden rounded-full bg-white/10 sm:size-12">
        {m.display_image_url ? (
          <img src={m.display_image_url} alt="" className="size-full object-cover" />
        ) : (
          <span className={`flex size-full items-center justify-center text-xs font-bold sm:text-sm ${guestHub.fgMuted}`}>
            {m.title.trim().slice(0, 1).toUpperCase() || "?"}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold leading-snug sm:text-base ${guestHub.fg} ${guestHub.wrap}`}>{m.title}</p>
        <p className={`mt-1 text-xs leading-relaxed ${guestHub.fgMuted} ${guestHub.wrap}`}>{meetupVenueMeta(m)}</p>
                <p className={`mt-1.5 text-sm font-bold sm:text-base ${guestHub.accent} ${guestHub.wrap}`}>
                  {formatMeetupSchedule(m.meetup_at)}
                </p>
        {m.description?.trim() ? (
          <MeetupDescription
            meetupId={m.id}
            description={m.description}
            expanded={expandedDescIds.has(m.id)}
            onToggle={onToggleDescription}
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
  );
}

export function GuestEventMeetupsContent({ accessCode }: Props) {
  const { data: entryEnvelope } = useEventEntryByCodeQuery(accessCode, { skip: !accessCode });
  const eventId = entryEnvelope?.data?.id ?? "";
  const { data, isLoading, isError, refetch } = useGuestEventMeetupsQuery(accessCode, { skip: !accessCode });
  const [createMeetup, { isLoading: creating }] = useGuestMeetupCreateMutation();
  const [join, { isLoading: joining }] = useGuestMeetupJoinMutation();
  const [leave, { isLoading: leaving }] = useGuestMeetupLeaveMutation();
  const busy = joining || leaving || creating;
  const [expandedDescIds, setExpandedDescIds] = useState<Set<string>>(() => new Set());

  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createLocation, setCreateLocation] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createTime, setCreateTime] = useState("");
  const [createMaxCap, setCreateMaxCap] = useState("");
  const [createImageKey, setCreateImageKey] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const toggleDescription = useCallback((id: string) => {
    setExpandedDescIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  async function onCreateMeetup(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!createDate.trim() || !createTime.trim()) {
      setCreateError("Choose a date and time.");
      return;
    }
    try {
      await createMeetup({
        accessCode,
        body: {
          title: createTitle.trim() || "Meetup",
          description: createDescription.trim() || null,
          location: createLocation.trim() || "TBD",
          meetup_at: dateAndTimePartsToIso(createDate, createTime),
          max_capacity: createMaxCap.trim() ? Number.parseInt(createMaxCap, 10) : null,
          image_url: createImageKey.trim() || null,
        },
      }).unwrap();
      setCreateTitle("");
      setCreateDescription("");
      setCreateLocation("");
      setCreateDate("");
      setCreateTime("");
      setCreateMaxCap("");
      setCreateImageKey("");
    } catch (err) {
      setCreateError(extractApiErrorMessage(err));
    }
  }

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
  const { organizer, guestHosts } = partitionMeetupsByHost(meetups);

  return (
    <section className={`rounded-2xl border border-white/10 p-4 sm:p-5 ${guestHub.surface}`}>
      <h2 className={`text-xl font-bold tracking-tight ${guestHub.accent}`}>Meetups</h2>
      <p className={`mt-1 text-sm ${guestHub.fgMuted}`}>
        Participate in fan meetups before the show — coordinated here, no DMs.
      </p>

      {organizer.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {organizer.map((m) => (
            <MeetupCard
              key={m.id}
              m={m}
              accessCode={accessCode}
              busy={busy}
              expandedDescIds={expandedDescIds}
              onToggleDescription={toggleDescription}
              join={join}
              leave={leave}
            />
          ))}
        </ul>
      ) : null}

      <form
        onSubmit={(e) => void onCreateMeetup(e)}
        className={`mt-6 space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5 ${guestHub.elevated}`}
      >
        <h3 className={`text-sm font-bold uppercase tracking-wide ${guestHub.accent}`}>Host a meetup</h3>
        <div>
          <label className={labelClass} htmlFor="gmu-title">
            Title
          </label>
          <input
            id="gmu-title"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            className={inputClassName(false)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="gmu-desc">
            Description
          </label>
          <textarea
            id="gmu-desc"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
            rows={2}
            className={`${inputClassName(false)} min-h-[80px] resize-y`}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="gmu-date">
              Date <span className="text-red-400">*</span>
            </label>
            <input
              id="gmu-date"
              type="date"
              value={createDate}
              onChange={(e) => setCreateDate(e.target.value)}
              className={inputClassName(false)}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="gmu-time">
              Time <span className="text-red-400">*</span>
            </label>
            <input
              id="gmu-time"
              type="time"
              value={createTime}
              onChange={(e) => setCreateTime(e.target.value)}
              className={inputClassName(false)}
              required
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="gmu-loc">
            Location
          </label>
          <input
            id="gmu-loc"
            value={createLocation}
            onChange={(e) => setCreateLocation(e.target.value)}
            className={inputClassName(false)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="gmu-cap">
            Max people (optional)
          </label>
          <input
            id="gmu-cap"
            type="number"
            min={1}
            value={createMaxCap}
            onChange={(e) => setCreateMaxCap(e.target.value)}
            className={inputClassName(false)}
          />
        </div>
        {eventId ? (
          <GuestMeetupImageField
            eventId={eventId}
            label="Image (optional)"
            hint="Upload a photo for this meetup. If you skip it, your event profile photo is used when you've set one; otherwise a letter from the title."
            value={createImageKey}
            onChange={setCreateImageKey}
          />
        ) : (
          <p className={`text-xs ${guestHub.fgMuted}`}>Loading upload options…</p>
        )}
        <FieldError message={createError ?? undefined} />
        <button
          type="submit"
          disabled={busy}
          className={`w-full rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[#0a0a0a] disabled:opacity-50 ${guestHub.accentBg}`}
        >
          {creating ? "Posting…" : "Post meetup"}
        </button>
      </form>

      {guestHosts.length > 0 ? (
        <>
          <GuestHostsDivider />
          <ul className="mt-4 space-y-4">
            {guestHosts.map((m) => (
              <MeetupCard
                key={m.id}
                m={m}
                accessCode={accessCode}
                busy={busy}
                expandedDescIds={expandedDescIds}
                onToggleDescription={toggleDescription}
                join={join}
                leave={leave}
              />
            ))}
          </ul>
        </>
      ) : null}

      {meetups.length === 0 ? (
        <p className={`mt-8 rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm ${guestHub.fgMuted}`}>
          No meetups scheduled yet. Check back soon.
        </p>
      ) : null}
    </section>
  );
}
