"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useResetGuestPasswordMutation } from "@/apis/guest.api";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { extractApiErrorMessage } from "@/lib/api-error";
import { zodFieldErrors } from "@/lib/zod-field-errors";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";
import { GuestAuthShell } from "@/components/guest-auth/GuestAuthShell";
import { guestInputClass, guestLabelClass } from "@/components/guest-auth/guestAuthStyles";
import { Button, ButtonLink } from "@/components/ui/button";
import { useGuestEventRouteCode } from "@/hooks/useGuestEventRouteCode";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";

export default function GuestEventResetPasswordPage() {
  useRedirectIfAuthenticated();
  const eventCode = useGuestEventRouteCode();
  const router = useRouter();
  const [reset, { isLoading }] = useResetGuestPasswordMutation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    password_confirmation: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error.flatten().fieldErrors));
      return;
    }
    setFieldErrors({});
    try {
      await reset(form).unwrap();
      setErrorMessage(null);
      router.push(guestEventAuthPaths.login(eventCode));
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <GuestAuthShell
      title="Choose a new password"
      description="Use the code from your email together with a new password. You started this reset from this event’s link."
      eventLine={`Event code · ${eventCode}`}
    >
      <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-5">
        <div>
          <label className={guestLabelClass} htmlFor="guest-reset-email">
            Email address
          </label>
          <input
            id="guest-reset-email"
            autoComplete="email"
            type="email"
            className={guestInputClass(Boolean(fieldErrors.email))}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {fieldErrors.email ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p> : null}
        </div>
        <div>
          <label className={guestLabelClass} htmlFor="guest-reset-otp">
            One-time code
          </label>
          <input
            id="guest-reset-otp"
            inputMode="numeric"
            maxLength={6}
            className={guestInputClass(Boolean(fieldErrors.otp))}
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
          />
          {fieldErrors.otp ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.otp}</p> : null}
        </div>
        <div>
          <label className={guestLabelClass} htmlFor="guest-reset-pass">
            New password
          </label>
          <input
            id="guest-reset-pass"
            autoComplete="new-password"
            type="password"
            className={guestInputClass(Boolean(fieldErrors.password))}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {fieldErrors.password ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p> : null}
        </div>
        <div>
          <label className={guestLabelClass} htmlFor="guest-reset-pass2">
            Confirm new password
          </label>
          <input
            id="guest-reset-pass2"
            autoComplete="new-password"
            type="password"
            className={guestInputClass(Boolean(fieldErrors.password_confirmation))}
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          />
          {fieldErrors.password_confirmation ? (
            <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password_confirmation}</p>
          ) : null}
        </div>
        {errorMessage ? <p className="text-center text-sm text-red-400">{errorMessage}</p> : null}
        <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
          Update password
        </Button>
        <ButtonLink href={guestEventAuthPaths.login(eventCode)} variant="secondary" className="justify-center">
          Back to sign in
        </ButtonLink>
      </form>
    </GuestAuthShell>
  );
}
