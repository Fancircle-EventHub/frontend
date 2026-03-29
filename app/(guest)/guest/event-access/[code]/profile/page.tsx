"use client";

import { useParams } from "next/navigation";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { useGuestEventOnboardingQuery, useGuestSessionQuery } from "@/apis/guest.api";
import { CircularProgress } from "@/components/ui/CircularProgress";

/**
 * Guest “My profile” for the current event: account info + event display identity.
 * Data from session (account) and onboarding (event-scoped username / avatar).
 */
export default function GuestEventProfilePage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const { data: sessionEnvelope, isLoading: sessionLoading } = useGuestSessionQuery();
  const { data: onboardingEnvelope, isLoading: onboardingLoading } = useGuestEventOnboardingQuery(code, {
    skip: !code,
  });
  const { data: eventEnvelope, isLoading: eventLoading } = useEventEntryByCodeQuery(code, { skip: !code });

  const guest = sessionEnvelope?.data?.guest;
  const profile = onboardingEnvelope?.data?.profile;
  const event = onboardingEnvelope?.data?.event ?? eventEnvelope?.data;

  const loading = sessionLoading || onboardingLoading || eventLoading;

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-xl">
      <h1 className="text-2xl font-bold text-white">My profile</h1>
      <p className="mt-1 text-sm text-eh-text-secondary">Your account and how you appear in this event.</p>

      {loading ? (
        <div className="mt-20 flex justify-center" role="status" aria-label="Loading">
          <CircularProgress size={44} />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <section className="rounded-2xl border border-white/10 bg-[#1a1d24]/90 p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-eh-text-tertiary">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-eh-text-tertiary">Name</dt>
                <dd className="mt-0.5 font-medium text-white">{guest?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-eh-text-tertiary">Email</dt>
                <dd className="mt-0.5 font-medium text-white break-all">{guest?.email ?? "—"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#1a1d24]/90 p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-eh-text-tertiary">This event</h2>
            <p className="mt-2 text-base font-semibold text-white">{event?.title ?? "—"}</p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-2 border-eh-accent/40 bg-[#252830]">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-2xl text-eh-text-tertiary">?</div>
                )}
              </div>
              <dl className="min-w-0 flex-1 space-y-3 text-sm">
                <div>
                  <dt className="text-eh-text-tertiary">Display name (this event)</dt>
                  <dd className="mt-0.5 font-medium text-white">{profile?.username ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-eh-text-tertiary">Profile in this event</dt>
                  <dd className="mt-0.5 text-eh-text-secondary">
                    {profile?.is_complete ? "Complete" : "Not completed yet"}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
