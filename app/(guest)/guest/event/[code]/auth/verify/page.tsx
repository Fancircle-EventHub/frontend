"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useResendGuestOtpMutation, useVerifyGuestOtpMutation } from "@/apis/guest.api";
import { otpSchema } from "@/schemas/auth.schema";
import { extractApiErrorMessage, extractFieldError } from "@/lib/api-error";
import { zodFieldErrors } from "@/lib/zod-field-errors";
import { clearPendingEmail, getPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";
import { GuestAuthShell } from "@/components/guest-auth/GuestAuthShell";
import { guestInputClass, guestLabelClass } from "@/components/guest-auth/guestAuthStyles";
import { Button, ButtonLink } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { setSession } from "@/slices/session.slice";
import { useGuestEventRouteCode } from "@/hooks/useGuestEventRouteCode";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";

export default function GuestEventVerifyPage() {
  useRedirectIfAuthenticated();
  const eventCode = useGuestEventRouteCode();
  const dispatch = useAppDispatch();
  const [email] = useState(() => getPendingEmail("guest"));
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [verify, { isLoading }] = useVerifyGuestOtpMutation();
  const [resendOtp] = useResendGuestOtpMutation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = otpSchema.safeParse({ email, otp });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error.flatten().fieldErrors));
      return;
    }
    setFieldErrors({});
    try {
      const response = await verify({ email, otp }).unwrap();
      dispatch(setSession({ token: response.data.token, domain: "guest" }));
      clearPendingEmail("guest");
      setErrorMessage(null);
      router.push(`/guest/event-access/${eventCode}`);
    } catch (error) {
      const otpErr = extractFieldError(error, "otp");
      const emailErr = extractFieldError(error, "email");
      if (otpErr) setFieldErrors((prev) => ({ ...prev, otp: otpErr }));
      if (emailErr) setFieldErrors((prev) => ({ ...prev, email: emailErr }));
      setErrorMessage(otpErr ?? emailErr ?? extractApiErrorMessage(error));
    }
  }

  return (
    <GuestAuthShell
      eyebrow="Verification"
      title="Enter your code"
      description="We sent a 6-digit code to your email. Enter it below to verify and continue."
      eventLine={`Event code · ${eventCode}`}
    >
      <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-5">
        <p className="rounded-lg border border-eh-border/60 bg-[#1a1d24] px-3 py-2 text-center text-sm text-eh-text-secondary">
          {email || "No pending email — return to register or sign in for this event."}
        </p>
        <div>
          <label className={guestLabelClass} htmlFor="guest-verify-otp">
            One-time code
          </label>
          <input
            id="guest-verify-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className={guestInputClass(Boolean(fieldErrors.otp))}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.otp;
                return next;
              });
            }}
          />
          {fieldErrors.otp ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.otp}</p> : null}
        </div>
        {errorMessage && !fieldErrors.otp ? <p className="text-center text-sm text-red-400">{errorMessage}</p> : null}
        <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
          Verify & continue
        </Button>
        <button
          type="button"
          className="text-center text-sm font-medium text-eh-text-secondary underline-offset-4 transition hover:text-eh-text-primary hover:underline disabled:opacity-50"
          disabled={cooldown > 0 || !email}
          onClick={async () => {
            try {
              await resendOtp({ email, purpose: "email_verification" }).unwrap();
              setCooldown(60);
              setErrorMessage(null);
            } catch (error) {
              setErrorMessage(extractApiErrorMessage(error));
            }
          }}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        <ButtonLink href={guestEventAuthPaths.login(eventCode)} variant="secondary" className="justify-center text-center">
          Back to sign in
        </ButtonLink>
      </form>
    </GuestAuthShell>
  );
}
