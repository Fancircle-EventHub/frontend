"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForgotGuestPasswordMutation } from "@/apis/guest.api";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { extractApiErrorMessage } from "@/lib/api-error";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";

export default function GuestForgotPasswordPage() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sendOtp, { isLoading }] = useForgotGuestPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) return;
    try {
      await sendOtp({ email }).unwrap();
      setErrorMessage(null);
      router.push("/guest/auth/reset-password");
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold">Guest Forgot Password</h1>
      <input className="rounded bg-zinc-800 p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="rounded bg-blue-600 px-4 py-2" disabled={isLoading}>Send OTP</button>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
    </form>
  );
}
