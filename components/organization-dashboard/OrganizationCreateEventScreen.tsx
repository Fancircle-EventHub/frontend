"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useCreateOrganizationEventMutation,
  useGetOrganizationEventQuery,
  useUpdateOrganizationEventMutation,
} from "@/apis/event.api";
import { createEventSchema, EVENT_VENUE_VALUES, type EventVenue } from "@/schemas/event.schema";
import type { Event } from "@/types/event.types";
import { extractApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { FieldError, inputClassName, labelClass } from "@/components/organization-auth/auth-form-primitives";

const venueLabel: Record<EventVenue, string> = {
  arena: "Arena",
  club: "Club",
  theater: "Theater",
  outdoor: "Outdoor",
  other: "Other",
};

const venueOptions = [{ value: "" as const, label: "Select venue" }, ...EVENT_VENUE_VALUES.map((v) => ({ value: v, label: venueLabel[v] }))];

function isValidHttpUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

type FormState = {
  title: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  startTime: string;
  doorsTime: string;
  hero_image_url: string;
};

function eventToFormState(ev: Event): FormState {
  return {
    title: ev.title,
    artist: ev.artist ?? "",
    venue: ev.venue ?? "",
    city: ev.city ?? "",
    date: ev.event_date ?? "",
    startTime: ev.start_time ? ev.start_time.slice(0, 5) : "",
    doorsTime: ev.doors_time ? ev.doors_time.slice(0, 5) : "",
    hero_image_url: ev.hero_image_url ?? "",
  };
}

export type OrganizationCreateEventScreenProps = {
  eventId?: string;
};

export function OrganizationCreateEventScreen({ eventId }: OrganizationCreateEventScreenProps) {
  const router = useRouter();
  const isEdit = Boolean(eventId);
  const { data, isLoading, isError } = useGetOrganizationEventQuery(eventId!, { skip: !eventId });
  const [createOrganizationEvent, { isLoading: creating }] = useCreateOrganizationEventMutation();
  const [updateOrganizationEvent, { isLoading: updating }] = useUpdateOrganizationEventMutation();

  const [form, setForm] = useState<FormState>({
    title: "",
    artist: "",
    venue: "",
    city: "",
    date: "",
    startTime: "",
    doorsTime: "",
    hero_image_url: "",
  });
  const [baseline, setBaseline] = useState<FormState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId || !data?.data) return;
    const next = eventToFormState(data.data);
    setForm(next);
    setBaseline(next);
    setFieldErrors({});
    setErrorMessage(null);
  }, [eventId, data]);

  const saving = creating || updating;

  const heroPreviewUrl = form.hero_image_url.trim() && isValidHttpUrl(form.hero_image_url) ? form.hero_image_url.trim() : null;

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const n = { ...prev };
      delete n[key];
      return n;
    });
    setErrorMessage(null);
  }

  function discardDraft() {
    if (isEdit && baseline) {
      setForm({ ...baseline });
      setFieldErrors({});
      setErrorMessage(null);
      return;
    }
    setForm({
      title: "",
      artist: "",
      venue: "",
      city: "",
      date: "",
      startTime: "",
      doorsTime: "",
      hero_image_url: "",
    });
    setFieldErrors({});
    setErrorMessage(null);
    router.push("/organization/events");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = createEventSchema.safeParse({
      title: form.title.trim(),
      artist: form.artist,
      venue: form.venue,
      city: form.city,
      event_date: form.date,
      start_time: form.startTime,
      doors_time: form.doorsTime,
      hero_image_url: form.hero_image_url,
    });
    if (!parsed.success) {
      const { fieldErrors: fe } = parsed.error.flatten();
      const next: Record<string, string> = {};
      for (const [k, arr] of Object.entries(fe)) {
        if (arr?.[0]) next[k] = arr[0];
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    setErrorMessage(null);
    try {
      if (eventId) {
        await updateOrganizationEvent({ eventId, body: parsed.data }).unwrap();
        router.push(`/organization/events/${eventId}/branding`);
      } else {
        const res = await createOrganizationEvent(parsed.data).unwrap();
        router.push(`/organization/events/${res.data.id}/branding`);
      }
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  const input = (name: keyof FormState, id: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      id={id}
      className={inputClassName(!!fieldErrors[name])}
      value={form[name]}
      onChange={(e) => patch(name, e.target.value as FormState[typeof name])}
      aria-invalid={!!fieldErrors[name]}
      {...props}
    />
  );

  if (isEdit && isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-eh-text-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-eh-accent/30 border-t-eh-accent" />
          <p className="text-sm">Loading event…</p>
        </div>
      </div>
    );
  }

  if (isEdit && isError) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-[#0e1012] p-8 text-center">
        <p className="text-sm text-eh-text-secondary">We couldn&apos;t load this event.</p>
        <Link href="/organization/events" className="mt-4 inline-block text-sm font-medium text-eh-accent hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          {isEdit ? (
            <>
              Edit event <span className="text-eh-accent">hub</span>
            </>
          ) : (
            <>
              Create event <span className="text-eh-accent">hub</span>
            </>
          )}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-eh-text-secondary">
          {isEdit
            ? "Review and update your event details. Saved values match what guests will see after branding."
            : "Set up a new event hub and connect your guests right after the ticket sale—before they arrive at the venue."}
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_320px]" noValidate>
        <div className="space-y-5">
          <div>
            <label className={labelClass} htmlFor="evt-title">
              Event title <span className="text-red-400">*</span>
            </label>
            {input("title", "evt-title", { placeholder: "Enter title", autoComplete: "off", required: true })}
            <FieldError message={fieldErrors.title} />
          </div>
          <div>
            <label className={labelClass} htmlFor="evt-artist">
              Artist <span className="text-red-400">*</span>
            </label>
            {input("artist", "evt-artist", { placeholder: "Artist name", required: true })}
            <FieldError message={fieldErrors.artist} />
          </div>
          <div>
            <label className={labelClass} htmlFor="evt-venue">
              Venue <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                id="evt-venue"
                className={`${inputClassName(!!fieldErrors.venue)} appearance-none bg-[#23272f] pr-10`}
                value={form.venue}
                onChange={(e) => patch("venue", e.target.value)}
                required
                aria-invalid={!!fieldErrors.venue}
              >
                {venueOptions.map((o) => (
                  <option key={o.value || "empty"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <FieldError message={fieldErrors.venue} />
          </div>
          <div>
            <label className={labelClass} htmlFor="evt-city">
              City <span className="text-red-400">*</span>
            </label>
            {input("city", "evt-city", { placeholder: "City", required: true })}
            <FieldError message={fieldErrors.city} />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="evt-date">
                Date <span className="text-red-400">*</span>
              </label>
              {input("date", "evt-date", { type: "date", required: true })}
              <FieldError message={fieldErrors.event_date} />
            </div>
            <div>
              <label className={labelClass} htmlFor="evt-start">
                Start <span className="text-red-400">*</span>
              </label>
              {input("startTime", "evt-start", { type: "time", required: true })}
              <FieldError message={fieldErrors.start_time} />
            </div>
            <div>
              <label className={labelClass} htmlFor="evt-doors">
                Doors <span className="text-red-400">*</span>
              </label>
              {input("doorsTime", "evt-doors", { type: "time", required: true })}
              <FieldError message={fieldErrors.doors_time} />
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div>
            <label className={labelClass} htmlFor="evt-hero-url">
              Hero image URL
            </label>
            <p className="mb-2 text-[11px] text-eh-text-tertiary">Paste a public image URL (e.g. from Cloudflare R2).</p>
            {input("hero_image_url", "evt-hero-url", {
              type: "url",
              placeholder: "https://…",
              autoComplete: "off",
            })}
            <FieldError message={fieldErrors.hero_image_url} />
            <div className="mt-4 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#0e1012] px-4 py-8 text-center transition">
              {heroPreviewUrl ? (
                <img src={heroPreviewUrl} alt="" className="mb-3 max-h-40 w-full rounded-lg object-cover" />
              ) : (
                <svg className="mb-3 size-12 text-eh-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.25}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              <span className="text-sm font-medium text-eh-text-secondary">
                {heroPreviewUrl ? "Preview" : "Hero preview"}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-wide text-eh-text-tertiary">Recommended 1600×2000px</span>
            </div>
          </div>
          <div className="rounded-xl border border-eh-accent/30 bg-eh-accent/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-eh-accent">Premium tip</p>
            <p className="mt-2 text-xs leading-relaxed text-eh-text-secondary">
              High-quality, darker hero images typically convert better—keep the focus on the experience, not clutter.
            </p>
          </div>
        </aside>

        <div className="col-span-full mt-4 flex flex-col-reverse gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={discardDraft}
            className="text-sm font-medium text-eh-text-tertiary transition hover:text-eh-text-secondary"
          >
            ✕ {isEdit ? "Reset" : "Discard draft"}
          </button>
          <Button type="submit" variant="primary" loading={saving} className="w-full min-w-0 px-8 sm:w-auto sm:min-w-[240px]">
            Continue to branding <span aria-hidden>→</span>
          </Button>
        </div>

        {errorMessage ? <p className="col-span-full text-center text-sm text-red-400">{errorMessage}</p> : null}
      </form>
    </div>
  );
}
