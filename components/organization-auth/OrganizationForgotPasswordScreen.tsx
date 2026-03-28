"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForgotOrganizationPasswordMutation } from "@/apis/organization.api";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { extractApiErrorMessage, extractFieldError } from "@/lib/api-error";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, inputClassName, labelClass } from "./auth-form-primitives";
import { OrganizationAuthSplitLayout } from "./OrganizationAuthSplitLayout";

export function OrganizationForgotPasswordScreen() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [sendOtp, { isLoading }] = useForgotOrganizationPasswordMutation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get("email")?.trim();
    if (!q) return;
    queueMicrotask(() => setEmail(q));
  }, [searchParams]);

  function patchEmail(value: string) {
    setEmail(value);
    setFieldErrors((prev) => {
      if (!prev.email) return prev;
      const next = { ...prev };
      delete next.email;
      return next;
    });
    setErrorMessage(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
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
      await sendOtp({ email: parsed.data.email }).unwrap();
      router.push(`/organization/auth/reset-password?email=${encodeURIComponent(parsed.data.email)}`);
    } catch (error) {
      const msg = extractFieldError(error, "email");
      if (msg) setFieldErrors((prev) => ({ ...prev, email: msg }));
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <OrganizationAuthSplitLayout
      heroTitle="Account access, without the friction."
      heroDescription="Request a one-time code to reset your password securely. You will choose a new password on the next step."
      formTitle="Forgot password"
      formDescription="Enter the email for your organizer account. We will send a 6-digit code."
    >
      <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
        <div>
          <label className={labelClass} htmlFor="forgot-email">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            className={inputClassName(!!fieldErrors.email)}
            value={email}
            onChange={(e) => patchEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={!!fieldErrors.email}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        <Button type="submit" variant="primary" fullWidth loading={isLoading} className="mt-2">
          Send code <span aria-hidden>→</span>
        </Button>

        {errorMessage ? <p className="text-center text-sm text-red-400">{errorMessage}</p> : null}

        <p className="text-center text-sm text-eh-text-secondary">
          Remember your password?{" "}
          <ButtonLink href="/organization/auth/login" variant="link">
            Sign in
          </ButtonLink>
        </p>
        <p className="text-center text-sm text-eh-text-secondary">
          Need an account?{" "}
          <Link href="/organization/auth/register" className="font-medium text-eh-text-primary hover:underline">
            Request access
          </Link>
        </p>
      </form>
    </OrganizationAuthSplitLayout>
  );
}
