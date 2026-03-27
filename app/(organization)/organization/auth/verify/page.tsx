"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useResendOrganizationOtpMutation, useVerifyOrganizationOtpMutation } from "@/apis/organization.api";
import { otpSchema } from "@/schemas/auth.schema";
import { extractApiErrorMessage, extractFieldError } from "@/lib/api-error";
import { useAppDispatch } from "@/store/hooks";
import { setSession } from "@/slices/session.slice";
import { clearPendingEmail, getPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";

export default function OrganizationVerifyPage() {
  useRedirectIfAuthenticated();
  const dispatch = useAppDispatch();
  const [email] = useState(() => getPendingEmail("organization"));
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [verify, { isLoading }] = useVerifyOrganizationOtpMutation();
  const [resendOtp] = useResendOrganizationOtpMutation();
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
    if (!parsed.success) return;
    try {
      const response = await verify({ email, otp }).unwrap();
      dispatch(setSession({ token: response.data.token, domain: "organization" }));
      clearPendingEmail("organization");
      setErrorMessage(null);
      router.push("/organization/dashboard");
    } catch (error) {
      setErrorMessage(extractFieldError(error, "otp") ?? extractApiErrorMessage(error));
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold">Verify Organization Email</h1>
      <p className="text-sm text-zinc-400">{email || "No pending email found. Return to register/login."}</p>
      <input className="rounded bg-zinc-800 p-2" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button className="rounded bg-blue-600 px-4 py-2" disabled={isLoading}>Verify</button>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      <button
        type="button"
        className="rounded border border-zinc-600 px-4 py-2 disabled:opacity-60"
        disabled={cooldown > 0}
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
        {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
      </button>
    </form>
  );
}
