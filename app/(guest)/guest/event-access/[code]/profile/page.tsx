"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { useGuestEventOnboardingQuery, useGuestSessionQuery, useUpdateGuestEventProfileMutation } from "@/apis/guest.api";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { guestHub } from "@/lib/guest-event-branding";
import { extractApiErrorMessage } from "@/lib/api-error";
import { useGuestR2Upload } from "@/hooks/useGuestR2Upload";

/**
 * Guest “My profile” for the current event: account info + event display identity.
 * Data from session (account) and onboarding (event-scoped username / avatar).
 */
export default function GuestEventProfilePage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: sessionEnvelope, isLoading: sessionLoading } = useGuestSessionQuery();
  const { data: onboardingEnvelope, isLoading: onboardingLoading } = useGuestEventOnboardingQuery(code, {
    skip: !code,
  });
  const { data: eventEnvelope, isLoading: eventLoading } = useEventEntryByCodeQuery(code, { skip: !code });

  const guest = sessionEnvelope?.data?.guest;
  const profile = onboardingEnvelope?.data?.profile;
  const event = onboardingEnvelope?.data?.event ?? eventEnvelope?.data;
  const eventId = event?.id ?? "";

  const { uploadFile, status: uploadStatus, error: uploadError, progress, previewObjectUrl, lastPublicUrl, reset } =
    useGuestR2Upload(eventId);
  const [updateProfile, { isLoading: saving }] = useUpdateGuestEventProfileMutation();

  const loading = sessionLoading || onboardingLoading || eventLoading;

  const displayAvatar = previewObjectUrl || lastPublicUrl || profile?.avatar_url;
  const uploadBusy = uploadStatus === "presigning" || uploadStatus === "uploading";

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !eventId || !profile?.is_complete) return;
    setSaveError(null);
    try {
      const { key } = await uploadFile(file);
      await updateProfile({ accessCode: code, body: { avatar_key: key } }).unwrap();
      reset();
    } catch (err) {
      setSaveError(extractApiErrorMessage(err));
    }
  }

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-xl">
      <h1 className={`text-2xl font-bold ${guestHub.fg}`}>My profile</h1>
      <p className={`mt-1 text-sm ${guestHub.fgMuted}`}>Your account and how you appear in this event.</p>

      {loading ? (
        <div className="mt-20 flex justify-center" role="status" aria-label="Loading">
          <CircularProgress size={44} />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <section className={`rounded-2xl border border-white/10 p-5 ${guestHub.surface}`}>
            <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className={guestHub.fgMuted}>Name</dt>
                <dd className={`mt-0.5 font-medium ${guestHub.fg}`}>{guest?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className={guestHub.fgMuted}>Email</dt>
                <dd className={`mt-0.5 font-medium break-all ${guestHub.fg}`}>{guest?.email ?? "—"}</dd>
              </div>
            </dl>
          </section>

          <section className={`rounded-2xl border border-white/10 p-5 ${guestHub.surface}`}>
            <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>This event</h2>
            <p className={`mt-2 text-base font-semibold ${guestHub.fg}`}>{event?.title ?? "—"}</p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="flex flex-col items-center gap-2 sm:items-start">
                <button
                  type="button"
                  disabled={!profile?.is_complete || !eventId || uploadBusy || saving}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 ${guestHub.accentBorderSubtle} ${guestHub.surface}`}
                  aria-label="Change profile photo"
                >
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="" className="size-full object-cover" />
                  ) : (
                    <div className={`flex size-full items-center justify-center text-2xl ${guestHub.fgMuted}`}>?</div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(ev) => void onPickAvatar(ev)}
                />
                {profile?.is_complete && eventId ? (
                  <p className={`text-center text-xs ${guestHub.fgMuted} sm:text-left`}>
                    {uploadBusy ? `Uploading… ${Math.round(progress * 100)}%` : saving ? "Saving…" : "Tap to change photo"}
                  </p>
                ) : null}
                {uploadError ? <p className="text-center text-xs text-red-400 sm:text-left">{uploadError}</p> : null}
                {saveError ? <p className="text-center text-xs text-red-400 sm:text-left">{saveError}</p> : null}
              </div>
              <dl className="min-w-0 flex-1 space-y-3 text-sm">
                <div>
                  <dt className={guestHub.fgMuted}>Display name (this event)</dt>
                  <dd className={`mt-0.5 font-medium ${guestHub.fg}`}>{profile?.username ?? "—"}</dd>
                </div>
                <div>
                  <dt className={guestHub.fgMuted}>Profile in this event</dt>
                  <dd className={`mt-0.5 ${guestHub.fgMuted}`}>
                    {profile?.is_complete ? "Complete" : "Not completed yet"}
                  </dd>
                </div>
                {!profile?.is_complete ? (
                  <div className="pt-1">
                    <Link
                      href={`/guest/onboarding/${code}`}
                      className={`text-sm font-semibold underline-offset-2 hover:underline ${guestHub.accent}`}
                    >
                      Complete event profile
                    </Link>
                    <p className={`mt-2 text-xs ${guestHub.fgMuted}`}>
                      Add a display name and photo so other fans recognize you.
                    </p>
                  </div>
                ) : null}
              </dl>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
