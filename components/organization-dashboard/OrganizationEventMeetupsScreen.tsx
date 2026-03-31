"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useCreateOrganizationEventMeetupMutation,
  useDeleteOrganizationEventMeetupMutation,
  useOrganizationEventMeetupsQuery,
  useUpdateOrganizationEventMeetupMutation,
} from "@/apis/event.api";
import { dateTimeInputClassName, FieldError, inputClassName, labelClass } from "@/components/organization-auth/auth-form-primitives";
import type { OrganizationMeetupItem } from "@/types/guest-meetup.types";
import { dateAndTimePartsToIso, isoToDateAndTimeParts } from "@/lib/datetime-form";
import { extractApiErrorMessage } from "@/lib/api-error";
import { partitionMeetupsByHost } from "@/lib/guest-meetups";
import { ImageUploadField } from "@/components/organization-dashboard/ImageUploadField";
import { Button } from "@/components/ui/button";

type Props = {
  eventId: string;
};

export function OrganizationEventMeetupsScreen({ eventId }: Props) {
  const { data, isLoading, isError, refetch } = useOrganizationEventMeetupsQuery(eventId, { skip: !eventId });
  const [createMeetup, { isLoading: creating }] = useCreateOrganizationEventMeetupMutation();
  const [updateMeetup, { isLoading: updating }] = useUpdateOrganizationEventMeetupMutation();
  const [deleteMeetup, { isLoading: deleting }] = useDeleteOrganizationEventMeetupMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [meetupDate, setMeetupDate] = useState("");
  const [meetupTime, setMeetupTime] = useState("");
  const [maxCap, setMaxCap] = useState("");
  const [meetupImageKey, setMeetupImageKey] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<OrganizationMeetupItem> | null>(null);
  const [editMeetupDate, setEditMeetupDate] = useState("");
  const [editMeetupTime, setEditMeetupTime] = useState("");

  const busy = creating || updating || deleting;

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!meetupDate.trim()) {
      setFormError("Choose a date.");
      return;
    }
    if (!meetupTime.trim()) {
      setFormError("Choose a time.");
      return;
    }
    try {
      await createMeetup({
        eventId,
        body: {
          title: title.trim() || "Meetup",
          description: description.trim() || null,
          location: location.trim() || "TBD",
          meetup_at: dateAndTimePartsToIso(meetupDate, meetupTime),
          max_capacity: maxCap.trim() ? Number.parseInt(maxCap, 10) : null,
          image_url: meetupImageKey.trim() || null,
        },
      }).unwrap();
      setTitle("");
      setDescription("");
      setLocation("");
      setMeetupDate("");
      setMeetupTime("");
      setMaxCap("");
      setMeetupImageKey("");
    } catch (err) {
      setFormError(extractApiErrorMessage(err));
    }
  }

  function startEdit(m: OrganizationMeetupItem) {
    setEditingId(m.id);
    setEditDraft({ ...m });
    const p = isoToDateAndTimeParts(m.meetup_at);
    setEditMeetupDate(p.date);
    setEditMeetupTime(p.time);
  }

  async function saveEdit() {
    if (!editingId || !editDraft) return;
    if (!editMeetupDate.trim() || !editMeetupTime.trim()) {
      alert("Set both date and time.");
      return;
    }
    try {
      await updateMeetup({
        eventId,
        meetupId: editingId,
        body: {
          title: editDraft.title,
          description: editDraft.description,
          location: editDraft.location ?? undefined,
          meetup_at: dateAndTimePartsToIso(editMeetupDate, editMeetupTime),
          max_capacity: editDraft.max_capacity,
          image_url: editDraft.image_url ?? null,
        },
      }).unwrap();
      setEditingId(null);
      setEditDraft(null);
    } catch (err) {
      alert(extractApiErrorMessage(err));
    }
  }

  if (!eventId) {
    return <p className="text-sm text-eh-text-secondary">Invalid event.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-eh-text-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-eh-accent/30 border-t-eh-accent" />
          <p className="text-sm">Loading meetups…</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-300">
        Could not load meetups.
        <button type="button" className="mt-2 block w-full text-eh-accent hover:underline" onClick={() => void refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const meetups = data.data.meetups;
  const { organizer, guestHosts } = partitionMeetupsByHost(meetups);

  const meetupListItem = (m: OrganizationMeetupItem) => (
    <li key={m.id} className="rounded-xl border border-white/10 bg-[#1a1d24]/90 p-5">
      {editingId === m.id && editDraft ? (
        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor={`edit-title-${m.id}`}>
              Title
            </label>
            <input
              id={`edit-title-${m.id}`}
              value={editDraft.title ?? ""}
              onChange={(e) => setEditDraft((d) => ({ ...d!, title: e.target.value }))}
              className={inputClassName(false)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`edit-desc-${m.id}`}>
              Description
            </label>
            <textarea
              id={`edit-desc-${m.id}`}
              value={editDraft.description ?? ""}
              onChange={(e) => setEditDraft((d) => ({ ...d!, description: e.target.value }))}
              rows={2}
              className={`${inputClassName(false)} min-h-[88px] resize-y`}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
            <div className="min-w-0 w-full flex-1 basis-0 sm:min-w-0">
              <label className={labelClass} htmlFor={`edit-date-${m.id}`}>
                Date
              </label>
              <input
                id={`edit-date-${m.id}`}
                type="date"
                value={editMeetupDate}
                onChange={(e) => setEditMeetupDate(e.target.value)}
                className={dateTimeInputClassName(false)}
              />
            </div>
            <div className="min-w-0 w-full flex-1 basis-0 sm:min-w-0">
              <label className={labelClass} htmlFor={`edit-time-${m.id}`}>
                Time
              </label>
              <input
                id={`edit-time-${m.id}`}
                type="time"
                value={editMeetupTime}
                onChange={(e) => setEditMeetupTime(e.target.value)}
                className={dateTimeInputClassName(false)}
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor={`edit-loc-${m.id}`}>
              Location
            </label>
            <input
              id={`edit-loc-${m.id}`}
              value={editDraft.location ?? ""}
              onChange={(e) => setEditDraft((d) => ({ ...d!, location: e.target.value }))}
              className={inputClassName(false)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`edit-cap-${m.id}`}>
              Max people (optional)
            </label>
            <input
              id={`edit-cap-${m.id}`}
              type="number"
              min={1}
              value={editDraft.max_capacity ?? ""}
              onChange={(e) =>
                setEditDraft((d) => ({
                  ...d!,
                  max_capacity: e.target.value ? Number.parseInt(e.target.value, 10) : null,
                }))
              }
              className={inputClassName(false)}
            />
          </div>
          <ImageUploadField
            id={`edit-img-${m.id}`}
            label="Image (optional)"
            hint="Replace or remove via Remove, then save."
            value={editDraft.image_url ?? ""}
            onChange={(next) => setEditDraft((d) => ({ ...d!, image_url: next || null }))}
            uploadType="event_meetup_image"
            eventId={eventId}
            variant="logo"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="primary"
              loading={busy}
              className="px-8 sm:px-12"
              onClick={() => void saveEdit()}
            >
              Save
            </Button>
            <button
              type="button"
              className="text-xs text-eh-text-tertiary hover:text-white"
              onClick={() => {
                setEditingId(null);
                setEditDraft(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-white/10">
              {m.display_image_url ? (
                <img src={m.display_image_url} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-xs font-bold text-eh-text-tertiary">
                  {m.title.trim().slice(0, 1).toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{m.title}</p>
              <p className="mt-1 text-xs text-eh-text-tertiary">{m.location}</p>
              <p className="mt-1 text-xs text-eh-text-secondary">{m.participant_count} joined</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="text-xs font-bold uppercase tracking-wide text-eh-accent hover:underline"
              onClick={() => startEdit(m)}
            >
              Edit
            </button>
            <button
              type="button"
              className="text-xs font-bold uppercase tracking-wide text-red-400 hover:underline"
              disabled={busy}
              onClick={async () => {
                if (!confirm("Delete this meetup?")) return;
                try {
                  await deleteMeetup({ eventId, meetupId: m.id }).unwrap();
                } catch (err) {
                  alert(extractApiErrorMessage(err));
                }
              }}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href={`/organization/events/${eventId}/modules`} className="text-sm font-medium text-eh-accent hover:underline">
          ← Back to modules
        </Link>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-white">Meetups</h1>
      <p className="mt-2 text-sm text-eh-text-secondary">Create scheduled meetups guests can join from the hub.</p>

      <form onSubmit={(e) => void onCreate(e)} className="mt-8 space-y-5 rounded-xl border border-white/10 bg-[#16181c] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">New meetup</h2>
        <div>
          <label className={labelClass} htmlFor="mu-title">
            Title
          </label>
          <input
            id="mu-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClassName(false)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="mu-desc">
            Description
          </label>
          <textarea
            id="mu-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={`${inputClassName(false)} min-h-[88px] resize-y`}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
          <div className="min-w-0 w-full flex-1 basis-0 sm:min-w-0">
            <label className={labelClass} htmlFor="mu-date">
              Date <span className="text-red-400">*</span>
            </label>
            <input
              id="mu-date"
              type="date"
              value={meetupDate}
              onChange={(e) => setMeetupDate(e.target.value)}
              className={dateTimeInputClassName(false)}
              required
            />
          </div>
          <div className="min-w-0 w-full flex-1 basis-0 sm:min-w-0">
            <label className={labelClass} htmlFor="mu-time">
              Time <span className="text-red-400">*</span>
            </label>
            <input
              id="mu-time"
              type="time"
              value={meetupTime}
              onChange={(e) => setMeetupTime(e.target.value)}
              className={dateTimeInputClassName(false)}
              required
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="mu-loc">
            Location
          </label>
          <input
            id="mu-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClassName(false)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="mu-cap">
            Max people (optional)
          </label>
          <input
            id="mu-cap"
            type="number"
            min={1}
            value={maxCap}
            onChange={(e) => setMaxCap(e.target.value)}
            className={inputClassName(false)}
          />
        </div>
        <ImageUploadField
          id="mu-img"
          label="Image (optional)"
          hint="Upload a photo for this meetup. If you skip it, your organization logo is used in the guest hub."
          value={meetupImageKey}
          onChange={setMeetupImageKey}
          uploadType="event_meetup_image"
          eventId={eventId}
          variant="logo"
        />
        <FieldError message={formError ?? undefined} />
        <Button type="submit" variant="primary" loading={busy} className="w-full min-w-[11rem] px-10 sm:w-auto sm:px-12">
          {creating ? "Creating…" : "Add meetup"}
        </Button>
      </form>

      <ul className="mt-10 space-y-4">{organizer.map(meetupListItem)}</ul>
      {guestHosts.length > 0 ? (
        <>
          <div className="mt-10 flex items-center gap-3" role="separator" aria-label="Guest hosts">
            <hr className="min-w-0 flex-1 border-white/10" />
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-eh-text-tertiary">
              GUEST HOSTS
            </span>
            <hr className="min-w-0 flex-1 border-white/10" />
          </div>
          <ul className="mt-4 space-y-4">{guestHosts.map(meetupListItem)}</ul>
        </>
      ) : null}
    </div>
  );
}
