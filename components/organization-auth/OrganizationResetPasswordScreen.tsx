"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useResetOrganizationPasswordMutation } from "@/apis/organization.api";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { extractApiErrorMessage, extractFieldError } from "@/lib/api-error";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, inputClassName, labelClass } from "./auth-form-primitives";
import { OrganizationAuthSplitLayout } from "./OrganizationAuthSplitLayout";

export function OrganizationResetPasswordScreen() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reset, { isLoading }] = useResetOrganizationPasswordMutation();
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    password_confirmation: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get("email")?.trim();
    if (!q) return;
    queueMicrotask(() => setForm((f) => ({ ...f, email: q })));
  }, [searchParams]);

  function patchForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setErrorMessage(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) {
      const { fieldErrors: fe, formErrors } = parsed.error.flatten();
      const next: Record<string, string> = {};
      for (const [k, arr] of Object.entries(fe)) {
        if (arr?.[0]) next[k] = arr[0];
      }
      setFieldErrors(next);
      setErrorMessage(formErrors[0] ?? null);
      return;
    }
    setFieldErrors({});
    setErrorMessage(null);
    try {
      await reset(parsed.data).unwrap();
      router.push("/organization/auth/login");
    } catch (error) {
      for (const field of ["email", "otp", "password", "password_confirmation"] as const) {
        const msg = extractFieldError(error, field);
        if (msg) setFieldErrors((prev) => ({ ...prev, [field]: msg }));
      }
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <OrganizationAuthSplitLayout
      heroTitle="Set a new password in one step."
      heroDescription="Use the code we emailed you and choose a strong password to secure your organizer account."
      formTitle="Reset password"
      formDescription="Enter your email, the 6-digit code, and your new password."
    >
      <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
        <div>
          <label className={labelClass} htmlFor="reset-email">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            className={inputClassName(!!fieldErrors.email)}
            value={form.email}
            onChange={(e) => patchForm("email", e.target.value)}
            placeholder="you@example.com"
            aria-invalid={!!fieldErrors.email}
          />
          <FieldError message={fieldErrors.email} />
        </div>
        <div>
          <label className={labelClass} htmlFor="reset-otp">
            One-time code
          </label>
          <input
            id="reset-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            className={inputClassName(!!fieldErrors.otp)}
            value={form.otp}
            onChange={(e) => patchForm("otp", e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            aria-invalid={!!fieldErrors.otp}
          />
          <FieldError message={fieldErrors.otp} />
        </div>
        <div>
          <label className={labelClass} htmlFor="reset-password">
            New password
          </label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            className={inputClassName(!!fieldErrors.password)}
            value={form.password}
            onChange={(e) => patchForm("password", e.target.value)}
            placeholder="••••••••"
            aria-invalid={!!fieldErrors.password}
          />
          <FieldError message={fieldErrors.password} />
        </div>
        <div>
          <label className={labelClass} htmlFor="reset-password-confirm">
            Confirm new password
          </label>
          <input
            id="reset-password-confirm"
            type="password"
            autoComplete="new-password"
            className={inputClassName(!!fieldErrors.password_confirmation)}
            value={form.password_confirmation}
            onChange={(e) => patchForm("password_confirmation", e.target.value)}
            placeholder="••••••••"
            aria-invalid={!!fieldErrors.password_confirmation}
          />
          <FieldError message={fieldErrors.password_confirmation} />
        </div>

        <Button type="submit" variant="primary" fullWidth loading={isLoading} className="mt-2">
          Update password <span aria-hidden>→</span>
        </Button>

        {errorMessage ? <p className="text-center text-sm text-red-400">{errorMessage}</p> : null}

        <p className="text-center text-sm text-eh-text-secondary">
          Did not get a code?{" "}
          <ButtonLink
            href={
              form.email
                ? `/organization/auth/forgot-password?email=${encodeURIComponent(form.email)}`
                : "/organization/auth/forgot-password"
            }
            variant="link"
          >
            Resend
          </ButtonLink>
        </p>
        <p className="text-center text-sm text-eh-text-secondary">
          <ButtonLink href="/organization/auth/login" variant="link">
            Back to sign in
          </ButtonLink>
        </p>
      </form>
    </OrganizationAuthSplitLayout>
  );
}
