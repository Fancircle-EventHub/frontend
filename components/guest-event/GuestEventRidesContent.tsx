"use client";

import Link from "next/link";
import { useState } from "react";
import { useGuestChatRoomsQuery } from "@/apis/guestChat.api";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import {
  useGuestEventRidesQuery,
  useGuestRideCreateMutation,
  useGuestRideDeleteMutation,
  useGuestRideInterestMutation,
  useGuestRideLeaveInterestMutation,
} from "@/apis/guest.api";
import { dateTimeInputClassName, FieldError, inputClassName, labelClass } from "@/components/organization-auth/auth-form-primitives";
import type { GuestRidePostItem } from "@/types/guest-ride.types";
import { dateAndTimePartsToIso } from "@/lib/datetime-form";
import { extractApiErrorMessage } from "@/lib/api-error";
import { guestHub } from "@/lib/guest-event-branding";
import { guestChatRoomIdForRide } from "@/lib/guest-chat-rooms";
import { isModuleEnabled } from "@/lib/event-modules";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";

type Props = {
  accessCode: string;
};

function rideRouteLine(p: GuestRidePostItem) {
  const d = p.destination_area?.trim();
  return d ? `${p.origin_area} → ${d}` : p.origin_area;
}

function formatDepartureHighlight(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function GuestEventRidesContent({ accessCode }: Props) {
  const { data: entryEnvelope } = useEventEntryByCodeQuery(accessCode, { skip: !accessCode });
  const ridesModule = isModuleEnabled(entryEnvelope?.data?.modules, "carpooling");
  const { data: chatRoomsEnvelope } = useGuestChatRoomsQuery(accessCode, { skip: !accessCode || !ridesModule });
  const chatRooms = chatRoomsEnvelope?.data?.rooms ?? [];

  const { data, isLoading, isError, refetch } = useGuestEventRidesQuery(accessCode, { skip: !accessCode });
  const [createPost, { isLoading: creating }] = useGuestRideCreateMutation();
  const [removePost, { isLoading: deleting }] = useGuestRideDeleteMutation();
  const [interest, { isLoading: interestBusy }] = useGuestRideInterestMutation();
  const [leaveInterest, { isLoading: leaveBusy }] = useGuestRideLeaveInterestMutation();

  const [type, setType] = useState<"offer" | "request">("offer");
  const [originArea, setOriginArea] = useState("");
  const [destinationArea, setDestinationArea] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seats, setSeats] = useState("2");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const busy = creating || deleting || interestBusy || leaveBusy;

  const posts = data?.data?.ride_posts ?? [];
  const eventVenue = data?.data?.event_venue ?? null;
  const eventCity = data?.data?.event_city ?? null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!departureDate.trim() || !departureTime.trim()) {
      setFormError("Choose a departure date and time.");
      return;
    }
    const departureIso = dateAndTimePartsToIso(departureDate, departureTime);
    try {
      await createPost({
        accessCode,
        body: {
          type,
          origin_area: originArea.trim() || "—",
          destination_area: destinationArea.trim() || null,
          departure_at: departureIso,
          seats_available: type === "offer" ? Number.parseInt(seats, 10) || 1 : null,
          note: note.trim() || null,
        },
      }).unwrap();
      setOriginArea("");
      setDestinationArea("");
      setDepartureDate("");
      setDepartureTime("");
      setNote("");
    } catch (err) {
      setFormError(extractApiErrorMessage(err));
    }
  }

  if (isLoading) {
    return <PageCenterSpinner />;
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-300">Couldn&apos;t load ride posts.</p>
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

  const venueLine = [eventVenue, eventCity].filter(Boolean).join(" · ");

  return (
    <div className="min-w-0 space-y-8">
      <section className={`min-w-0 rounded-2xl border border-white/10 p-4 sm:p-5 ${guestHub.surface}`}>
        <h2 className={`text-xl font-bold tracking-tight ${guestHub.accent}`}>Carpool</h2>
        <p className={`mt-1 text-sm ${guestHub.fgMuted}`}>Share a ride or find others going to the venue.</p>

        {posts.length === 0 ? (
          <p className={`mt-6 text-sm ${guestHub.fgMuted}`}>No ride posts yet — create one below.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {posts.map((p) => {
              const rideChatId =
                ridesModule && (p.is_author || p.interested) ? guestChatRoomIdForRide(chatRooms, p.id) : null;
              return (
              <li
                key={p.id}
                className="flex min-w-0 gap-3 rounded-2xl border border-white/10 bg-[color:var(--guest-bg)]/40 p-3 sm:gap-4 sm:p-4"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5 sm:size-14">
                  {p.author_avatar_url ? (
                    <img src={p.author_avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    <span className={`flex size-full items-center justify-center text-sm font-bold ${guestHub.fgMuted}`}>
                      {(p.author_username ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold leading-snug sm:text-base ${guestHub.fg} ${guestHub.wrap}`}>{rideRouteLine(p)}</p>
                  {venueLine ? (
                    <p className={`mt-1 text-xs ${guestHub.fgMuted} ${guestHub.wrap}`}>
                      {venueLine}
                      {p.type === "offer" && p.seats_available != null ? (
                        <span>
                          {" "}
                          · {p.seats_available} seat{p.seats_available === 1 ? "" : "s"} free
                        </span>
                      ) : null}
                    </p>
                  ) : p.type === "offer" && p.seats_available != null ? (
                    <p className={`mt-1 text-xs ${guestHub.fgMuted} ${guestHub.wrap}`}>
                      {p.seats_available} seat{p.seats_available === 1 ? "" : "s"} free
                    </p>
                  ) : null}
                  <p className={`mt-1.5 text-sm font-bold sm:text-base ${guestHub.accent} ${guestHub.wrap}`}>
                    {formatDepartureHighlight(p.departure_at)}
                  </p>
                  {p.note?.trim() ? (
                    <p className={`mt-1 text-xs ${guestHub.fgMuted} ${guestHub.wrap}`}>Meetup: {p.note}</p>
                  ) : null}
                  <p className={`mt-1 text-[10px] uppercase tracking-wide ${guestHub.fgMuted} ${guestHub.wrap}`}>
                    {p.is_author
                      ? "Your post"
                      : p.author_username
                        ? `@${p.author_username}`
                        : "Guest"}{" "}
                    · {p.interest_count} interested
                  </p>
                  {rideChatId ? (
                    <Link
                      href={`/guest/event-access/${accessCode}/chat/${rideChatId}`}
                      className={`mt-2 inline-block text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
                    >
                      Open ride chat
                    </Link>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end justify-center gap-2 self-center">
                  {p.is_author ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm("Remove this post?")) return;
                        try {
                          await removePost({ accessCode, ridePostId: p.id }).unwrap();
                        } catch (err) {
                          alert(extractApiErrorMessage(err));
                        }
                      }}
                      className="rounded-lg border border-red-500/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {deleting ? "…" : "Delete"}
                    </button>
                  ) : p.interested ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        try {
                          await leaveInterest({ accessCode, ridePostId: p.id }).unwrap();
                        } catch (err) {
                          alert(extractApiErrorMessage(err));
                        }
                      }}
                      className={`rounded-lg border border-white/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide disabled:opacity-50 ${guestHub.fgMuted} ${guestHub.cardHoverBorder}`}
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        try {
                          await interest({ accessCode, ridePostId: p.id }).unwrap();
                        } catch (err) {
                          alert(extractApiErrorMessage(err));
                        }
                      }}
                      className={`rounded-lg px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-[#0a0a0a] hover:brightness-95 disabled:opacity-50 ${guestHub.accentBg}`}
                    >
                      Request
                    </button>
                  )}
                </div>
              </li>
            );
            })}
          </ul>
        )}
      </section>

      <section className={`min-w-0 rounded-2xl border border-white/10 p-4 sm:p-5 ${guestHub.surface}`}>
        <h2 className={`text-sm font-bold uppercase tracking-wide ${guestHub.fg}`}>Create a ride</h2>
        <p className={`mt-1 text-xs ${guestHub.fgMuted}`}>Offer seats or ask for a ride — interest is visible to others.</p>
        <form onSubmit={(e) => void onSubmit(e)} className="mt-5 min-w-0 space-y-4">
          <div className="flex min-w-0 gap-2">
            <button
              type="button"
              onClick={() => setType("offer")}
              className={`flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-wide ${
                type === "offer" ? `${guestHub.accentBg} text-[#0a0a0a]` : `border border-white/15 ${guestHub.fgMuted}`
              }`}
            >
              Offer
            </button>
            <button
              type="button"
              onClick={() => setType("request")}
              className={`flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-wide ${
                type === "request" ? `${guestHub.accentBg} text-[#0a0a0a]` : `border border-white/15 ${guestHub.fgMuted}`
              }`}
            >
              Request
            </button>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <div className="min-w-0">
              <label className={labelClass} htmlFor="ride-origin">
                From
              </label>
              <input
                id="ride-origin"
                value={originArea}
                onChange={(e) => setOriginArea(e.target.value)}
                className={`${inputClassName(false)} min-w-0 max-w-full`}
                placeholder="e.g. Mannheim"
                required
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass} htmlFor="ride-dest">
                To (optional)
              </label>
              <input
                id="ride-dest"
                value={destinationArea}
                onChange={(e) => setDestinationArea(e.target.value)}
                className={`${inputClassName(false)} min-w-0 max-w-full`}
                placeholder="e.g. venue area"
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start">
            <div className="min-w-0 w-full flex-1 basis-0 md:min-w-0">
              <label className={labelClass} htmlFor="ride-date">
                Departure date
              </label>
              <input
                id="ride-date"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className={dateTimeInputClassName(false)}
                required
              />
            </div>
            <div className="min-w-0 w-full flex-1 basis-0 md:min-w-0">
              <label className={labelClass} htmlFor="ride-time">
                Departure time
              </label>
              <input
                id="ride-time"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className={dateTimeInputClassName(false)}
                required
              />
            </div>
          </div>
          {type === "offer" ? (
            <div className="min-w-0">
              <label className={labelClass} htmlFor="ride-seats">
                Seats available
              </label>
              <input
                id="ride-seats"
                type="number"
                min={1}
                max={50}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className={`${inputClassName(false)} min-w-0 max-w-full`}
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <label className={labelClass} htmlFor="ride-note">
              Meetup note (optional)
            </label>
            <textarea
              id="ride-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={`${inputClassName(false)} min-h-[80px] min-w-0 max-w-full resize-y`}
              placeholder="e.g. Main station east exit"
            />
          </div>
          <FieldError message={formError ?? undefined} />
          <button
            type="submit"
            disabled={busy}
            className={`w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest text-[#0a0a0a] transition hover:brightness-95 disabled:opacity-50 ${guestHub.accentBg}`}
          >
            {creating ? "Posting…" : "Create carpool post"}
          </button>
        </form>
      </section>
    </div>
  );
}
