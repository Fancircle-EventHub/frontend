"use client";

import { useState } from "react";
import { useCreateOrganizationEventMutation } from "@/apis/event.api";
import { useOrganizationSessionQuery } from "@/apis/organization.api";
import { createEventSchema } from "@/schemas/event.schema";
import { useAuthGuard } from "@/lib/auth-guard";
import { extractApiErrorMessage } from "@/lib/api-error";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();
  useAuthGuard("organization", "/organization/auth/login");
  const { isLoading: sessionLoading, isError: sessionError } = useOrganizationSessionQuery();
  const [form, setForm] = useState({ title: "", description: "" });
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createEvent, { isLoading }] = useCreateOrganizationEventMutation();

  useEffect(() => {
    if (sessionError) router.replace("/organization/auth/login");
  }, [router, sessionError]);

  if (sessionLoading) {
    return <div className="mx-auto w-full max-w-lg p-6 text-zinc-300">Checking session...</div>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = createEventSchema.safeParse(form);
    if (!parsed.success) return;
    try {
      const response = await createEvent(form).unwrap();
      setCreatedLink(response.data.join_link);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Add Event</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className="rounded bg-zinc-800 p-2" placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="rounded bg-zinc-800 p-2" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="rounded bg-blue-600 px-4 py-2" disabled={isLoading}>Create Event</button>
        {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      </form>
      {createdLink ? (
        <div className="rounded border border-green-700 p-4">
          <p className="text-sm text-zinc-300">Shareable Event Link</p>
          <p className="break-all">{createdLink}</p>
        </div>
      ) : null}
    </div>
  );
}
