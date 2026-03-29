"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLoginGuestMutation } from "@/apis/guest.api";
import { useAppDispatch } from "@/store/hooks";
import { setSession } from "@/slices/session.slice";
import { guestLoginSchema } from "@/schemas/guest.schema";
import { extractApiErrorCode, extractApiErrorMessage } from "@/lib/api-error";
import { zodFieldErrors } from "@/lib/zod-field-errors";
import { setPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";
import { GuestAuthShell } from "@/components/guest-auth/GuestAuthShell";
import { GuestAuthTabs } from "@/components/guest-auth/GuestAuthTabs";
import { guestInputClass, guestLabelClass } from "@/components/guest-auth/guestAuthStyles";
import { Button, ButtonLink } from "@/components/ui/button";
import { useGuestEventRouteCode } from "@/hooks/useGuestEventRouteCode";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";

export default function GuestEventLoginPage() {
  useRedirectIfAuthenticated();
  const eventCode = useGuestEventRouteCode();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginGuestMutation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = guestLoginSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error.flatten().fieldErrors));
      return;
    }
    setFieldErrors({});
    try {
      const response = await login(form).unwrap();
      dispatch(setSession({ token: response.data.token, domain: "guest" }));
      setErrorMessage(null);
      router.push(`/guest/event-access/${eventCode}`);
    } catch (error) {
      if (extractApiErrorCode(error) === "EMAIL_NOT_VERIFIED") {
        setPendingEmail("guest", form.email);
        router.push(guestEventAuthPaths.verify(eventCode));
        return;
      }
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <GuestAuthShell
      eyebrow="Guest access"
      title="Welcome back"
      description="Sign in with your guest account to enter the event experience."
      eventLine={`Event code · ${eventCode}`}
    >
      <GuestAuthTabs active="login" eventCode={eventCode} />
      <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-5">
        <div>
          <label className={guestLabelClass} htmlFor="guest-login-email">
            Email address
          </label>
          <input
            id="guest-login-email"
            autoComplete="email"
            type="email"
            placeholder="you@example.com"
            className={guestInputClass(Boolean(fieldErrors.email))}
            value={form.email}
            onChange={(e) => {
              setForm((f) => ({ ...f, email: e.target.value }));
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.email;
                return next;
              });
            }}
          />
          {fieldErrors.email ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p> : null}
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className={guestLabelClass} htmlFor="guest-login-password">
              Password
            </label>
            <ButtonLink
              href={guestEventAuthPaths.forgotPassword(eventCode)}
              variant="link"
              className="text-[11px] font-semibold uppercase tracking-wide text-eh-accent"
            >
              Forgot password?
            </ButtonLink>
          </div>
          <input
            id="guest-login-password"
            autoComplete="current-password"
            type="password"
            placeholder="••••••••"
            className={guestInputClass(Boolean(fieldErrors.password))}
            value={form.password}
            onChange={(e) => {
              setForm((f) => ({ ...f, password: e.target.value }));
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.password;
                return next;
              });
            }}
          />
          {fieldErrors.password ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p> : null}
        </div>
        {errorMessage ? <p className="text-center text-sm text-red-400">{errorMessage}</p> : null}
        <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
          Sign in
        </Button>
      </form>
    </GuestAuthShell>
  );
}
