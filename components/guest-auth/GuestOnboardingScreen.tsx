"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCompleteGuestEventProfileMutation, useGuestEventOnboardingQuery, useGuestSessionQuery } from "@/apis/guest.api";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { useGuestR2Upload } from "@/hooks/useGuestR2Upload";
import { extractApiErrorMessage, extractFieldError } from "@/lib/api-error";
import { zodFieldErrors } from "@/lib/zod-field-errors";
import { useAuthGuard, useRedirectWhenGuestSessionFails } from "@/lib/auth-guard";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";
import { guestEventOnboardingFormSchema } from "@/schemas/guest-onboarding.schema";
import { GuestAuthShell } from "./GuestAuthShell";
import { guestInputClass, guestLabelClass } from "./guestAuthStyles";

type Props = {
  accessCode: string;
};

export function GuestOnboardingScreen({ accessCode }: Props) {
  useAuthGuard("guest", guestEventAuthPaths.login(accessCode));
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoading: sessionLoading, isSuccess: sessionOk, isError: sessionError } = useGuestSessionQuery();
  useRedirectWhenGuestSessionFails(sessionError, accessCode);

  const {
    data: onboardingEnvelope,
    isLoading: onboardingLoading,
    isError: onboardingError,
    error: onboardingErrorObj,
  } = useGuestEventOnboardingQuery(accessCode, { skip: !sessionOk });

  const [username, setUsername] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completeProfile, { isLoading: submitting }] = useCompleteGuestEventProfileMutation();

  const event = onboardingEnvelope?.data.event;
  const eventId = event?.id ?? "";
  const { uploadFile, status: uploadStatus, error: uploadError, previewObjectUrl, lastKey, lastPublicUrl, progress } =
    useGuestR2Upload(eventId);

  useEffect(() => {
    if (!onboardingEnvelope?.data.profile) return;
    if (onboardingEnvelope.data.profile.is_complete) {
      router.replace(`/guest/event-access/${accessCode}`);
    }
  }, [onboardingEnvelope, accessCode, router]);

  const onboardingLoadErrorMessage =
    onboardingError && !sessionLoading && !onboardingLoading ? extractApiErrorMessage(onboardingErrorObj) : null;

  useEffect(() => {
    const t = setTimeout(() => usernameRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const displayPreview = previewObjectUrl || lastPublicUrl;

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.avatar_key;
      return next;
    });
    setErrorMessage(null);
    try {
      await uploadFile(file);
    } catch {
      /* surfaced via uploadError */
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setErrorMessage(null);

    const parsed = guestEventOnboardingFormSchema.safeParse({
      username,
      avatar_key: lastKey ?? "",
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error.flatten().fieldErrors));
      return;
    }

    try {
      await completeProfile({
        accessCode,
        body: { username: parsed.data.username, avatar_key: parsed.data.avatar_key },
      }).unwrap();
      setErrorMessage(null);
      setTimeout(() => {
        router.replace(`/guest/event-access/${accessCode}`);
      }, 400);
    } catch (err) {
      const u = extractFieldError(err, "username");
      const a = extractFieldError(err, "avatar_key");
      if (u) setFieldErrors((prev) => ({ ...prev, username: u }));
      if (a) setFieldErrors((prev) => ({ ...prev, avatar_key: a }));
      setErrorMessage(extractApiErrorMessage(err));
    }
  }

  const isBootstrapping = sessionLoading || onboardingLoading || !event;

  if (isBootstrapping && !onboardingError) {
    return <PageCenterSpinner fixed />;
  }

  if (onboardingError) {
    return (
      <GuestAuthShell
        title="Could not load event"
        description={onboardingLoadErrorMessage ?? "This event may be unavailable. Check your link and try again."}
      >
        <div className="flex flex-col gap-4 text-center">
          <ButtonLink href={guestEventAuthPaths.login(accessCode)} variant="secondary" className="justify-center">
            Back to sign in
          </ButtonLink>
        </div>
      </GuestAuthShell>
    );
  }

  const eyebrow = event?.venue?.trim() || event?.city?.trim() || "Event access";

  return (
    <GuestAuthShell
      eyebrow={eyebrow}
      title="Almost there"
      description="Choose a display name and profile photo for this event. Other fans will see this in the event room."
      eventLine={event?.title ?? undefined}
    >
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex size-28 items-center justify-center overflow-hidden rounded-full border-2 border-eh-accent/50 bg-[#1a1d24] text-eh-accent/90 transition hover:border-eh-accent"
          >
            {displayPreview ? (
              <img src={displayPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onPickFile} />
          <p className="text-center text-xs text-eh-text-secondary">
            {uploadStatus === "uploading" ? `Uploading… ${Math.round(progress * 100)}%` : "Tap to add a profile photo"}
          </p>
          {uploadError ? <p className="text-center text-xs text-red-400">{uploadError}</p> : null}
          {fieldErrors.avatar_key ? <p className="text-center text-xs text-red-400">{fieldErrors.avatar_key}</p> : null}
        </div>

        <div>
          <label className={guestLabelClass} htmlFor="guest-username">
            Username
          </label>
          <p className="mb-1.5 text-[11px] text-eh-text-tertiary">3–20 characters · letters, numbers, dots, underscores · unique for this event</p>
          <input
            ref={usernameRef}
            id="guest-username"
            autoComplete="username"
            className={guestInputClass(Boolean(fieldErrors.username))}
            placeholder="yourname"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFieldErrors((prev) => {
                if (!prev.username) return prev;
                const next = { ...prev };
                delete next.username;
                return next;
              });
            }}
          />
          {fieldErrors.username ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.username}</p> : null}
        </div>

        {errorMessage && !fieldErrors.username && !fieldErrors.avatar_key ? (
          <p className="text-center text-sm text-red-400">{errorMessage}</p>
        ) : null}

        <Button type="submit" fullWidth loading={submitting} disabled={submitting || uploadStatus === "uploading" || uploadStatus === "presigning"}>
          Complete profile
        </Button>
      </form>
    </GuestAuthShell>
  );
}
