"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegisterOrganizationMutation } from "@/apis/organization.api";
import { organizationRegisterSchema } from "@/schemas/organization.schema";
import { extractApiErrorMessage, extractFieldError } from "@/lib/api-error";
import { setPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";

export default function OrganizationRegisterPage() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const [registerOrganization, { isLoading }] = useRegisterOrganizationMutation();
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = organizationRegisterSchema.safeParse(form);
    if (!parsed.success) return;
    try {
      await registerOrganization(form).unwrap();
      setPendingEmail("organization", form.email);
      setErrorMessage(null);
      router.push("/organization/auth/verify");
    } catch (error) {
      setErrorMessage(extractFieldError(error, "email") ?? extractApiErrorMessage(error));
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold">Organization Register</h1>
      <input className="rounded bg-zinc-800 p-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="rounded bg-zinc-800 p-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="rounded bg-zinc-800 p-2" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <input className="rounded bg-zinc-800 p-2" placeholder="Confirm Password" type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
      <button className="rounded bg-blue-600 px-4 py-2" disabled={isLoading}>Continue</button>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
    </form>
  );
}
