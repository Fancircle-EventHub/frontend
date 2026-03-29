"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useResendOrganizationOtpMutation, useVerifyOrganizationOtpMutation } from "@/apis/organization.api";
import { otpSchema } from "@/schemas/auth.schema";
import { extractApiErrorMessage, extractFieldError } from "@/lib/api-error";
import { useAppDispatch } from "@/store/hooks";
import { setSession } from "@/slices/session.slice";
import { clearPendingEmail, getPendingEmail, setPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, inputClassName, labelClass } from "./auth-form-primitives";
import { OrganizationAuthSplitLayout } from "./OrganizationAuthSplitLayout";

export function OrganizationVerifyScreen() {
  useRedirectIfAuthenticated();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verify, { isLoading }] = useVerifyOrganizationOtpMutation();
  const [resendOtp, { isLoading: resendLoading }] = useResendOrganizationOtpMutation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [staySignedIn, setStaySignedIn] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const fromUrl = searchParams.get("email")?.trim();
      if (fromUrl) {
        setEmail(fromUrl);
        return;
      }
      const pending = getPendingEmail("organization");
      if (pending) setEmail(pending);
    });
  }, [searchParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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

  function patchOtp(value: string) {
    setOtp(value.replace(/\D/g, "").slice(0, 6));
    setFieldErrors((prev) => {
      if (!prev.otp) return prev;
      const next = { ...prev };
      delete next.otp;
      return next;
    });
    setErrorMessage(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = otpSchema.safeParse({ email, otp, remember: staySignedIn });
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
      const response = await verify(parsed.data).unwrap();
      dispatch(setSession({ token: response.data.token, domain: "organization" }));
      clearPendingEmail("organization");
      router.push("/organization/dashboard");
    } catch (error) {
      const otpErr = extractFieldError(error, "otp");
      const emailErr = extractFieldError(error, "email");
      if (otpErr) setFieldErrors((prev) => ({ ...prev, otp: otpErr }));
      if (emailErr) setFieldErrors((prev) => ({ ...prev, email: emailErr }));
      setErrorMessage(otpErr ?? emailErr ?? extractApiErrorMessage(error));
    }
  }

  return (
    <OrganizationAuthSplitLayout
      heroTitle="Almost there—confirm your email."
      heroDescription="We sent a one-time code to the address you used to register. Enter it below to unlock your organizer dashboard."
      formTitle="Verify your email"
      formDescription="Use the 6-digit code from your inbox. Codes expire after a short time."
    >
      <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
        <div>
          <label className={labelClass} htmlFor="verify-email">
            Email
          </label>
          <input
            id="verify-email"
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
        <div>
          <label className={labelClass} htmlFor="verify-otp">
            Verification code
          </label>
          <input
            id="verify-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            className={inputClassName(!!fieldErrors.otp)}
            value={otp}
            onChange={(e) => patchOtp(e.target.value)}
            placeholder="000000"
            maxLength={6}
            aria-invalid={!!fieldErrors.otp}
          />
          <FieldError message={fieldErrors.otp} />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-eh-text-secondary">
          <input
            type="checkbox"
            checked={staySignedIn}
            onChange={(e) => setStaySignedIn(e.target.checked)}
            className="size-4 rounded border-eh-border bg-[#23272f] accent-[#fddc53] focus:ring-eh-accent"
          />
          Stay signed in
        </label>

        <Button type="submit" variant="primary" fullWidth loading={isLoading} className="mt-2">
          Verify & continue <span aria-hidden>→</span>
        </Button>

        {errorMessage ? <p className="text-center text-sm text-red-400">{errorMessage}</p> : null}

        <Button
          type="button"
          variant="secondary"
          fullWidth
          loading={resendLoading}
          disabled={cooldown > 0 || !email.trim()}
          onClick={async () => {
            try {
              await resendOtp({ email: email.trim(), purpose: "email_verification" }).unwrap();
              setPendingEmail("organization", email.trim());
              setCooldown(60);
              setErrorMessage(null);
            } catch (error) {
              setErrorMessage(extractApiErrorMessage(error));
            }
          }}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </Button>

        <p className="text-center text-sm text-eh-text-secondary">
          <ButtonLink href="/organization/auth/login" variant="link">
            Back to sign in
          </ButtonLink>
          {" · "}
          <Link href="/organization/auth/register" className="font-medium text-eh-text-primary hover:underline">
            Register again
          </Link>
        </p>
      </form>
    </OrganizationAuthSplitLayout>
  );
}
