"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useResetGuestPasswordMutation } from "@/apis/guest.api";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { getEventContextStorage } from "@/lib/event-context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEventContext } from "@/slices/session.slice";
import { extractApiErrorMessage } from "@/lib/api-error";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";

export default function GuestResetPasswordPage() {
  useRedirectIfAuthenticated();
  const dispatch = useAppDispatch();
  const eventContextCode = useAppSelector((state) => state.session.eventContextCode);
  const eventCode = eventContextCode ?? getEventContextStorage() ?? "";
  const router = useRouter();
  const [reset, { isLoading }] = useResetGuestPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    if (!eventContextCode) {
      const stored = getEventContextStorage();
      if (stored) dispatch(setEventContext(stored));
    }
  }, [dispatch, eventContextCode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) return;
    try {
      await reset(form).unwrap();
      setErrorMessage(null);
      router.push("/guest/auth/login");
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold">Guest Reset Password</h1>
      <p className="text-sm text-zinc-400">Event context: {eventCode || "none"}</p>
      <input className="rounded bg-zinc-800 p-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="rounded bg-zinc-800 p-2" placeholder="OTP" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} />
      <input className="rounded bg-zinc-800 p-2" type="password" placeholder="New Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <input className="rounded bg-zinc-800 p-2" type="password" placeholder="Confirm New Password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
      <button className="rounded bg-blue-600 px-4 py-2" disabled={isLoading}>Reset Password</button>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
    </form>
  );
}
