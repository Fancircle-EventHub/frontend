"use client";

import { useId } from "react";
import { usePresignedFileUrl } from "@/hooks/usePresignedFileUrl";
import { useR2Upload } from "@/hooks/useR2Upload";
import type { UploadType } from "@/types/upload.types";
import { FieldError, labelClass } from "@/components/organization-auth/auth-form-primitives";

type ImageUploadFieldProps = {
  id?: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  uploadType: UploadType;
  eventId?: string;
  error?: string;
  variant?: "cover" | "logo";
};

export function ImageUploadField({
  id: idProp,
  label,
  hint,
  value,
  onChange,
  uploadType,
  eventId,
  error,
  variant = "cover",
}: ImageUploadFieldProps) {
  const autoId = useId();
  const inputId = idProp ?? `img-upload-${autoId}`;
  const upload = useR2Upload({ type: uploadType, eventId });
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
      {hint ? <p className="mb-3 text-[11px] leading-relaxed text-eh-text-tertiary">{hint}</p> : null}

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          void onPickFile(f ?? null);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={inputId}>
          <span
            className={`inline-flex cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-eh-text-primary transition hover:bg-white/10 ${
              busy ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {busy ? "Uploading…" : "Choose file"}
          </span>
        </label>
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-eh-text-tertiary transition hover:bg-white/5 hover:text-eh-text-primary"
          >
            Remove
          </button>
        ) : null}
      </div>

      {upload.error ? <p className="mt-2 text-xs text-red-400">{upload.error}</p> : null}
      <FieldError message={error} />

      <div
        className={
          variant === "cover"
            ? "mt-4 aspect-[21/9] w-full overflow-hidden rounded-lg border border-white/10 bg-[#0e1012]"
            : "mt-4 flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-[#0e1012]"
        }
      >
        {previewSrc ? (
           
          <img src={previewSrc} alt="" className={variant === "cover" ? "size-full object-cover" : "max-h-full max-w-full object-contain p-2"} />
        ) : (
          <div
            className={
              variant === "cover"
                ? "flex h-full min-h-[120px] items-center justify-center text-xs text-eh-text-tertiary"
                : "px-2 text-center text-[10px] text-eh-text-tertiary"
            }
          >
            {variant === "cover" ? "Cover preview" : "No image"}
          </div>
        )}
      </div>

      {upload.status === "uploading" ? (
        <div className="mt-2 h-1 w-full overflow-hidden rounded bg-white/10">
          <div
            className="h-full bg-eh-accent transition-[width]"
            style={{ width: `${Math.round(upload.progress * 100)}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
