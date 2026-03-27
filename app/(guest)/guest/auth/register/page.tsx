"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRegisterGuestMutation } from "@/apis/guest.api";
import { guestRegisterSchema } from "@/schemas/guest.schema";
import { getEventContextStorage } from "@/lib/event-context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEventContext } from "@/slices/session.slice";
import { extractApiErrorMessage, extractFieldError } from "@/lib/api-error";
import { setPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";

export default function GuestRegisterPage() {
  useRedirectIfAuthenticated();
  const dispatch = useAppDispatch();
  const eventContextCode = useAppSelector((state) => state.session.eventContextCode);
  const eventCode = eventContextCode ?? getEventContextStorage() ?? "";
  const router = useRouter();
  const [register, { isLoading }] = useRegisterGuestMutation();
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!eventContextCode) {
      const stored = getEventContextStorage();
      if (stored) dispatch(setEventContext(stored));
    }
  }, [dispatch, eventContextCode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = guestRegisterSchema.safeParse(form);
    if (!parsed.success) return;
    try {
      await register(form).unwrap();
      setPendingEmail("guest", form.email);
      setErrorMessage(null);
      router.push("/guest/auth/verify");
    } catch (error) {
      setErrorMessage(extractFieldError(error, "email") ?? extractApiErrorMessage(error));
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold">Guest Register</h1>
      <p className="text-sm text-zinc-400">Event context: {eventCode || "none"}</p>
      <input className="rounded bg-zinc-800 p-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="rounded bg-zinc-800 p-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="rounded bg-zinc-800 p-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <input className="rounded bg-zinc-800 p-2" type="password" placeholder="Confirm Password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
      <button className="rounded bg-blue-600 px-4 py-2" disabled={isLoading}>Continue</button>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
    </form>
  );
}
