"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForgotGuestPasswordMutation } from "@/apis/guest.api";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { extractApiErrorMessage } from "@/lib/api-error";
import { zodFieldErrors } from "@/lib/zod-field-errors";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";
import { GuestAuthShell } from "@/components/guest-auth/GuestAuthShell";
import { guestInputClass, guestLabelClass } from "@/components/guest-auth/guestAuthStyles";
import { Button, ButtonLink } from "@/components/ui/button";
import { useGuestEventRouteCode } from "@/hooks/useGuestEventRouteCode";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";

export default function GuestEventForgotPasswordPage() {
  useRedirectIfAuthenticated();
  const eventCode = useGuestEventRouteCode();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sendOtp, { isLoading }] = useForgotGuestPasswordMutation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error.flatten().fieldErrors));
      return;
    }
    setFieldErrors({});
    try {
      await sendOtp({ email }).unwrap();
      setErrorMessage(null);
      router.push(guestEventAuthPaths.resetPassword(eventCode));
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <GuestAuthShell
      title="Reset password"
      description="Enter your email. We will send a one-time code for this event’s sign-in flow. Your password applies to your guest account (same email across events)."
      eventLine={`Event code · ${eventCode}`}
    >
      <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-5">
        <div>
          <label className={guestLabelClass} htmlFor="guest-forgot-email">
            Email address
          </label>
          <input
            id="guest-forgot-email"
            autoComplete="email"
            type="email"
            placeholder="you@example.com"
            className={guestInputClass(Boolean(fieldErrors.email))}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldErrors.email ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p> : null}
        </div>
        {errorMessage ? <p className="text-center text-sm text-red-400">{errorMessage}</p> : null}
        <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
          Send code
        </Button>
        <ButtonLink href={guestEventAuthPaths.login(eventCode)} variant="secondary" className="justify-center">
          Back to sign in
        </ButtonLink>
      </form>
    </GuestAuthShell>
  );
}
