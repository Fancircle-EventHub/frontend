"use client";

import { useId } from "react";
import { FieldError, labelClass } from "@/components/organization-auth/auth-form-primitives";
import { usePresignedFileUrl } from "@/hooks/usePresignedFileUrl";
import { useGuestMeetupImageUpload } from "@/hooks/useGuestMeetupImageUpload";
import { guestHub } from "@/lib/guest-event-branding";

type Props = {
  id?: string;
  label: string;
  hint?: string;
  eventId: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
};

export function GuestMeetupImageField({ id: idProp, label, hint, eventId, value, onChange, error }: Props) {
  const autoId = useId();
  const inputId = idProp ?? `guest-meetup-img-${autoId}`;
  const upload = useGuestMeetupImageUpload(eventId);
  const { url: resolvedUrl } = usePresignedFileUrl(value || undefined);

  const previewSrc =
    upload.previewObjectUrl ||
    (upload.lastKey === value && upload.lastPublicUrl ? upload.lastPublicUrl : null) ||
    resolvedUrl ||
    null;

  const busy = upload.status === "presigning" || upload.status === "uploading";

  async function onPickFile(file: File | null) {
    if (!file) return;
    try {
      const { key } = await upload.uploadFile(file);
      onChange(key);
    } catch {}
  }

  function clear() {
    upload.reset();
    onChange("");
  }

  return (
    <div>
      <label className={labelClass} htmlFor={inputId}>
        {label}
      </label>
      {hint ? <p className={`mb-3 text-[11px] leading-relaxed ${guestHub.fgMuted}`}>{hint}</p> : null}

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="sr-only"
        disabled={busy || !eventId}
        onChange={(e) => {
          const f = e.target.files?.[0];
          void onPickFile(f ?? null);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={inputId}>
          <span
            className={`inline-flex cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition hover:bg-white/10 ${
              busy ? "pointer-events-none opacity-50" : ""
            } ${guestHub.fg}`}
          >
            {busy ? "Uploading…" : "Choose image"}
          </span>
        </label>
        {value ? (
          <button
            type="button"
            onClick={clear}
            className={`rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition hover:bg-white/5 ${guestHub.fgMuted}`}
          >
            Remove
          </button>
        ) : null}
      </div>

      {upload.error ? <p className="mt-2 text-xs text-red-400">{upload.error}</p> : null}
      <FieldError message={error} />

      <div className="mt-4 flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/20">
        {previewSrc ? (
          <img src={previewSrc} alt="" className="max-h-full max-w-full object-contain p-2" />
        ) : (
          <span className={`px-2 text-center text-[10px] ${guestHub.fgMuted}`}>No image</span>
        )}
      </div>

      {upload.status === "uploading" ? (
        <div className="mt-2 h-1 w-full overflow-hidden rounded bg-white/10">
          <div
            className={`h-full ${guestHub.accentBg}`}
            style={{ width: `${Math.round(upload.progress * 100)}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
