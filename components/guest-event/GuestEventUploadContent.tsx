"use client";

import { useGuestEventOnboardingQuery, useGuestEventMediaMineQuery } from "@/apis/guest.api";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { guestHub } from "@/lib/guest-event-branding";
import { useGuestEventGalleryUpload } from "@/hooks/useGuestEventGalleryUpload";

type Props = {
  accessCode: string;
  eventId: string;
};

export function GuestEventUploadContent({ accessCode, eventId }: Props) {
  const { data: onboardingEnvelope, isLoading: onboardingLoading } = useGuestEventOnboardingQuery(accessCode);
  const { data: mineEnvelope, isLoading: mineLoading, refetch } = useGuestEventMediaMineQuery(accessCode);
  const profile = onboardingEnvelope?.data?.profile;
  const complete = profile?.is_complete ?? false;
  const { uploadFile, status, error, progress, reset } = useGuestEventGalleryUpload(eventId, accessCode);

  const mine = mineEnvelope?.data ?? [];

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !complete) return;
    try {
      await uploadFile(file);
      await refetch();
      reset();
    } catch {}
  }

  const busy = status === "presigning" || status === "uploading" || status === "registering";

  if (onboardingLoading || mineLoading) {
    return <PageCenterSpinner />;
  }

  if (!complete) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-eh-text-secondary">
        Complete your event profile first to share photos and videos with other fans.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={`rounded-2xl border border-white/10 p-5 ${guestHub.surface}`}>
        <h2 className={`text-lg font-semibold ${guestHub.fg}`}>Add to the gallery</h2>
        <p className={`mt-1 text-sm ${guestHub.fgMuted}`}>
          Upload images or short videos (MP4, WebM, MOV). They appear in the event gallery for everyone after upload.
        </p>
        <div className="mt-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="hidden"
            id="gallery-upload"
            disabled={busy}
            onChange={(ev) => void onPick(ev)}
          />
          <label
            htmlFor="gallery-upload"
            className={`inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-lg border border-eh-border bg-transparent px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-eh-text-secondary transition hover:border-eh-text-tertiary hover:text-eh-text-primary ${busy ? "pointer-events-none opacity-60" : ""}`}
          >
            {busy ? `Uploading… ${Math.round(progress * 100)}%` : "Choose photo or video"}
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </div>

      <div>
        <h2 className={`text-lg font-semibold ${guestHub.fg}`}>Your uploads</h2>
        <p className={`mt-1 text-sm ${guestHub.fgMuted}`}>Media you shared for this event.</p>
        {mine.length === 0 ? (
          <p className={`mt-4 text-sm ${guestHub.fgMuted}`}>No uploads yet.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {mine.map((item) => (
              <li key={item.id} className={`overflow-hidden rounded-xl border border-white/10 ${guestHub.surface}`}>
                {item.kind === "video" ? (
                  <video src={item.url} className="aspect-square w-full object-cover" controls muted playsInline />
                ) : (
                  <img src={item.url} alt="" className="aspect-square w-full object-cover" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
