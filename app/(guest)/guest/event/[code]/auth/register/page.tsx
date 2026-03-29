"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRegisterGuestMutation } from "@/apis/guest.api";
import { guestRegisterSchema } from "@/schemas/guest.schema";
import { extractApiErrorMessage, extractFieldError } from "@/lib/api-error";
import { zodFieldErrors } from "@/lib/zod-field-errors";
import { setPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";
import { GuestAuthShell } from "@/components/guest-auth/GuestAuthShell";
import { GuestAuthTabs } from "@/components/guest-auth/GuestAuthTabs";
import { guestInputClass, guestLabelClass } from "@/components/guest-auth/guestAuthStyles";
import { Button } from "@/components/ui/button";
import { useGuestEventRouteCode } from "@/hooks/useGuestEventRouteCode";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";

export default function GuestEventRegisterPage() {
  useRedirectIfAuthenticated();
  const eventCode = useGuestEventRouteCode();
  const router = useRouter();
  const [register, { isLoading }] = useRegisterGuestMutation();
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = guestRegisterSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error.flatten().fieldErrors));
      return;
    }
    setFieldErrors({});
    try {
      await register(form).unwrap();
      setPendingEmail("guest", form.email);
      setErrorMessage(null);
      router.push(guestEventAuthPaths.verify(eventCode));
    } catch (error) {
      setErrorMessage(extractFieldError(error, "email") ?? extractApiErrorMessage(error));
    }
  }

  return (
    <GuestAuthShell
      eyebrow="Guest access"
      title="Create your guest account"
      description="Register to join the event community and receive your verification code."
      eventLine={`Event code · ${eventCode}`}
    >
      <GuestAuthTabs active="register" eventCode={eventCode} />
      <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-5">
        <div>
          <label className={guestLabelClass} htmlFor="guest-reg-name">
            Name
          </label>
          <input
            id="guest-reg-name"
            autoComplete="name"
            placeholder="Your name"
            className={guestInputClass(Boolean(fieldErrors.name))}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {fieldErrors.name ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.name}</p> : null}
        </div>
        <div>
          <label className={guestLabelClass} htmlFor="guest-reg-email">
            Email address
          </label>
          <input
            id="guest-reg-email"
            autoComplete="email"
            type="email"
            placeholder="you@example.com"
            className={guestInputClass(Boolean(fieldErrors.email))}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {fieldErrors.email ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p> : null}
        </div>
        <div>
          <label className={guestLabelClass} htmlFor="guest-reg-password">
            Password
          </label>
          <input
            id="guest-reg-password"
            autoComplete="new-password"
            type="password"
            placeholder="At least 8 characters"
            className={guestInputClass(Boolean(fieldErrors.password))}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {fieldErrors.password ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p> : null}
        </div>
        <div>
          <label className={guestLabelClass} htmlFor="guest-reg-password2">
            Confirm password
          </label>
          <input
            id="guest-reg-password2"
            autoComplete="new-password"
            type="password"
            placeholder="Repeat password"
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
          Continue
        </Button>
      </form>
    </GuestAuthShell>
  );
}
