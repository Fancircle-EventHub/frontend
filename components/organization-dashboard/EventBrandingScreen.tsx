"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { useGetOrganizationEventQuery, useUpdateOrganizationEventMutation } from "@/apis/event.api";
import { eventBrandingSchema } from "@/schemas/event-branding.schema";
import { rawStorageFromEvent } from "@/lib/storage-path";
import { extractApiErrorMessage } from "@/lib/api-error";
import { usePresignedFileUrl } from "@/hooks/usePresignedFileUrl";
import { Button } from "@/components/ui/button";
import { FieldError, inputClassName, labelClass } from "@/components/organization-auth/auth-form-primitives";
import { ImageUploadField } from "@/components/organization-dashboard/ImageUploadField";

const DEFAULT_BG = "#23272F";
const DEFAULT_FONT = "#FFFFFF";
const DEFAULT_BUTTON = "#FDDC53";

type BrandingForm = {
  title: string;
  description: string;
  logo_url: string;
  hero_image_url: string;
  background_color: string;
  font_color: string;
  button_color: string;
};

function coerceHex(v: string, fallback: string): string {
  let s = v.trim();
  if (!s.startsWith("#")) s = `#${s.replace(/^#/, "")}`;
  const hex = s
    .slice(1)
    .replace(/[^0-9A-Fa-f]/g, "")
    .slice(0, 6);
  if (hex.length !== 6) return fallback;
  return `#${hex.toUpperCase()}`;
}

function eventToForm(ev: {
  title: string;
  description: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  logo_path?: string | null;
  hero_image_path?: string | null;
  background_color: string | null;
  font_color: string | null;
  button_color: string | null;
}): BrandingForm {
  return {
    title: ev.title,
    description: ev.description ?? "",
    logo_url: rawStorageFromEvent(ev.logo_path, ev.logo_url),
    hero_image_url: rawStorageFromEvent(ev.hero_image_path, ev.hero_image_url),
    background_color: ev.background_color ?? DEFAULT_BG,
    font_color: ev.font_color ?? DEFAULT_FONT,
    button_color: ev.button_color ?? DEFAULT_BUTTON,
  };
}

function ColorField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
}) {
  const safePicker = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#000000";
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={safePicker}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="size-11 cursor-pointer shrink-0 overflow-hidden rounded-lg border border-white/15 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
          aria-label={label}
        />
        <input
          className={inputClassName(!!error)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(coerceHex(e.target.value, value))}
          spellCheck={false}
          autoComplete="off"
          maxLength={7}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

function BrandingPhonePreview({
  form,
  heroSrc,
  logoSrc,
}: {
  form: BrandingForm;
  heroSrc: string | null;
  logoSrc: string | null;
}) {
  const bg = /^#[0-9A-Fa-f]{6}$/.test(form.background_color) ? form.background_color : DEFAULT_BG;
  const fg = /^#[0-9A-Fa-f]{6}$/.test(form.font_color) ? form.font_color : DEFAULT_FONT;
  const btn = /^#[0-9A-Fa-f]{6}$/.test(form.button_color) ? form.button_color : DEFAULT_BUTTON;

  return (
    <div className="mx-auto w-full max-w-[260px] rounded-[2rem] border border-white/20 bg-[#0a0a0a] p-2 shadow-2xl shadow-black/60">
      <div
        className="min-w-0 overflow-hidden rounded-[1.65rem] shadow-inner"
        style={{ backgroundColor: bg, color: fg }}
      >
        <div className="relative h-32 w-full bg-black/30">
          {heroSrc ? (
            <img src={heroSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-700/80 to-zinc-900 text-[10px] text-white/40">
              Cover image
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-3 px-4 pb-6 pt-4">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="h-8 max-w-[140px] object-contain object-left" />
          ) : (
            <div className="h-8 w-24 rounded bg-white/10" />
          )}
          <h3 className="min-w-0 wrap-break-word text-lg font-bold leading-snug">
            {form.title || "Event heading"}
          </h3>
          <p className="min-w-0 max-w-full wrap-anywhere text-xs leading-relaxed opacity-85">
            {form.description || "Event description appears here for your guests."}
          </p>
          <button
            type="button"
            className="w-full rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider text-[#0a0a0a] shadow-sm"
            style={{ backgroundColor: btn }}
          >
            Enter hub
          </button>
        </div>
      </div>
    </div>
  );
}

type EventBrandingScreenProps = {
  eventId: string;
  /** When true, opened from organizer sidebar / hub — skip wizard-only navigation. */
  standalone?: boolean;
};

export function EventBrandingScreen({ eventId, standalone = false }: EventBrandingScreenProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetOrganizationEventQuery(eventId, { skip: !eventId });
  const [updateEvent, { isLoading: saving }] = useUpdateOrganizationEventMutation();

  const [form, setForm] = useState<BrandingForm | null>(null);
  const [baseline, setBaseline] = useState<BrandingForm | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const heroPreview = usePresignedFileUrl(form?.hero_image_url || undefined);
  const logoPreview = usePresignedFileUrl(form?.logo_url || undefined);

  useEffect(() => {
    const ev = data?.data;
    if (!ev) return;
    const next = eventToForm(ev);
    startTransition(() => {
      setForm(next);
      setBaseline(next);
      setFieldErrors({});
      setErrorMessage(null);
    });
  }, [data]);

  function patch<K extends keyof BrandingForm>(key: K, value: BrandingForm[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setFieldErrors((prev) => {
      if (!prev[key as string]) return prev;
      const n = { ...prev };
      delete n[key as string];
      return n;
    });
    setErrorMessage(null);
  }

  function discard() {
    if (baseline) setForm({ ...baseline });
    setFieldErrors({});
    setErrorMessage(null);
  }

  async function saveDraft(): Promise<boolean> {
    if (!form) return false;
    const parsed = eventBrandingSchema.safeParse({
      title: form.title.trim(),
      description: form.description,
      logo_url: form.logo_url,
      hero_image_url: form.hero_image_url,
      background_color: coerceHex(form.background_color, DEFAULT_BG),
      font_color: coerceHex(form.font_color, DEFAULT_FONT),
      button_color: coerceHex(form.button_color, DEFAULT_BUTTON),
    });
    if (!parsed.success) {
      const { fieldErrors: fe } = parsed.error.flatten();
      const next: Record<string, string> = {};
      for (const [k, arr] of Object.entries(fe)) {
        if (arr?.[0]) next[k] = arr[0];
      }
      setFieldErrors(next);
      return false;
    }
    setFieldErrors({});
    setErrorMessage(null);
    try {
      const res = await updateEvent({ eventId, body: parsed.data }).unwrap();
      const synced = eventToForm(res.data);
      setForm(synced);
      setBaseline(synced);
      return true;
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
      return false;
    }
  }

  async function continueNext() {
    const ok = await saveDraft();
    if (ok) {
      router.push(
        standalone
          ? `/organization/events/${eventId}/modules?standalone=1`
          : `/organization/events/${eventId}/modules`,
      );
    }
  }

  if (!eventId) {
    return <p className="text-sm text-eh-text-secondary">Invalid event.</p>;
  }

  if (isLoading || !form) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-eh-text-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-eh-accent/30 border-t-eh-accent" />
          <p className="text-sm">Loading branding…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0e1012] p-8 text-center">
        <p className="text-sm text-eh-text-secondary">Could not load this event.</p>
        <Link href="/organization/events" className="mt-4 inline-block text-sm font-medium text-eh-accent hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {standalone ? (
        <div className="mb-6">
          <Link
            href="/organization/branding"
            className="text-sm font-medium text-eh-accent transition hover:underline"
          >
            ← Back to event list
          </Link>
        </div>
      ) : null}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Branding & <span className="text-eh-accent">design</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-eh-text-secondary">
            Shape how your event hub looks to guests—headline, story, logo, colors, and cover. Changes update the live
            preview instantly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <button
            type="button"
            onClick={discard}
            className="text-xs font-bold uppercase tracking-wider text-eh-text-tertiary transition hover:text-eh-text-primary"
          >
            Discard
          </button>
          <Button
            type="button"
            variant="primary"
            loading={saving}
            className="border border-eh-accent/50 px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
            onClick={() => void saveDraft()}
          >
            Save draft
          </Button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-xl border border-white/10 bg-[#16181c] p-5 shadow-sm">
            <label className={labelClass} htmlFor="brand-title">
              Heading
            </label>
            <input
              id="brand-title"
              className={inputClassName(!!fieldErrors.title)}
              value={form.title}
              onChange={(e) => patch("title", e.target.value)}
              placeholder="Write a headline"
              autoComplete="off"
            />
            <FieldError message={fieldErrors.title} />
          </section>

          <section className="rounded-xl border border-white/10 bg-[#16181c] p-5 shadow-sm">
            <label className={labelClass} htmlFor="brand-desc">
              Event description
            </label>
            <textarea
              id="brand-desc"
              rows={4}
              className={`${inputClassName(!!fieldErrors.description)} min-h-[120px] resize-y`}
              value={form.description}
              onChange={(e) => patch("description", e.target.value)}
              placeholder="Describe the experience for your guests."
            />
            <FieldError message={fieldErrors.description} />
          </section>

          <section className="rounded-xl border border-white/10 bg-[#16181c] p-5 shadow-sm">
            <ImageUploadField
              label="Logo"
              hint="PNG, JPG, WebP, SVG, or GIF. Shown in the guest hub header."
              value={form.logo_url}
              onChange={(v) => patch("logo_url", v)}
              uploadType="event_logo"
              eventId={eventId}
              error={fieldErrors.logo_url}
              variant="logo"
            />
          </section>

          <section className="rounded-xl border border-white/10 bg-[#16181c] p-5 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-3">
              <ColorField
                label="Background"
                value={form.background_color}
                onChange={(v) => patch("background_color", v)}
                error={fieldErrors.background_color}
              />
              <ColorField
                label="Text"
                value={form.font_color}
                onChange={(v) => patch("font_color", v)}
                error={fieldErrors.font_color}
              />
              <ColorField
                label="Button"
                value={form.button_color}
                onChange={(v) => patch("button_color", v)}
                error={fieldErrors.button_color}
              />
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#16181c] p-5 shadow-sm">
            <ImageUploadField
              label="Cover image"
              hint="Wide image for the top of the hub. Recommended landscape."
              value={form.hero_image_url}
              onChange={(v) => patch("hero_image_url", v)}
              uploadType="event_cover"
              eventId={eventId}
              error={fieldErrors.hero_image_url}
              variant="cover"
            />
          </section>

          <div className="pt-4">
            <Button
              type="button"
              variant="primary"
              loading={saving}
              className="w-full py-3 text-sm font-bold uppercase tracking-wider sm:max-w-md"
              onClick={() => void continueNext()}
            >
              {standalone ? (
                "Save & edit modules"
              ) : (
                <>
                  Continue <span aria-hidden>→</span>
                </>
              )}
            </Button>
          </div>

          {errorMessage ? <p className="text-center text-sm text-red-400">{errorMessage}</p> : null}
        </div>

        <aside className="lg:sticky lg:top-6">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-eh-text-tertiary">Live preview</p>
          <div className="rounded-xl border border-white/10 bg-[#0e1012]/80 p-6 backdrop-blur-sm">
            <BrandingPhonePreview
              form={form}
              heroSrc={heroPreview.url}
              logoSrc={logoPreview.url}
            />
            <p className="mt-4 text-center text-[10px] text-eh-text-tertiary">Guest app appearance (illustrative)</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
