"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLoginGuestMutation } from "@/apis/guest.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEventContext, setSession } from "@/slices/session.slice";
import { guestLoginSchema } from "@/schemas/guest.schema";
import { getEventContextStorage } from "@/lib/event-context";
import { extractApiErrorCode, extractApiErrorMessage } from "@/lib/api-error";
import { setPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";

export default function GuestLoginPage() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const eventContextCode = useAppSelector((state) => state.session.eventContextCode);
  const [login, { isLoading }] = useLoginGuestMutation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const eventCode = eventContextCode ?? getEventContextStorage() ?? "";

  useEffect(() => {
    if (!eventContextCode) {
      const stored = getEventContextStorage();
      if (stored) dispatch(setEventContext(stored));
    }
  }, [dispatch, eventContextCode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = guestLoginSchema.safeParse(form);
    if (!parsed.success) return;
    try {
      const response = await login(form).unwrap();
      dispatch(setSession({ token: response.data.token, domain: "guest" }));
      setErrorMessage(null);
      router.push(eventCode ? `/guest/event-access/${eventCode}` : "/guest/event-access/no-context");
    } catch (error) {
      if (extractApiErrorCode(error) === "EMAIL_NOT_VERIFIED") {
        setPendingEmail("guest", form.email);
        router.push("/guest/auth/verify");
        return;
      }
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold">Guest Login</h1>
      <input className="rounded bg-zinc-800 p-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="rounded bg-zinc-800 p-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="rounded bg-blue-600 px-4 py-2" disabled={isLoading}>Login</button>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
    </form>
  );
}
