"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginOrganizationMutation } from "@/apis/organization.api";
import { organizationLoginSchema } from "@/schemas/organization.schema";
import { useAppDispatch } from "@/store/hooks";
import { setSession } from "@/slices/session.slice";
import { extractApiErrorCode, extractApiErrorMessage } from "@/lib/api-error";
import { setPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";

export default function OrganizationLoginPage() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginOrganization, { isLoading }] = useLoginOrganizationMutation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = organizationLoginSchema.safeParse(form);
    if (!parsed.success) return;
    try {
      const response = await loginOrganization(form).unwrap();
      dispatch(setSession({ token: response.data.token, domain: "organization" }));
      setErrorMessage(null);
      router.push("/organization/dashboard");
    } catch (error) {
      if (extractApiErrorCode(error) === "EMAIL_NOT_VERIFIED") {
        setPendingEmail("organization", form.email);
        router.push("/organization/auth/verify");
        return;
      }
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold">Organization Login</h1>
      <input className="rounded bg-zinc-800 p-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="rounded bg-zinc-800 p-2" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="rounded bg-blue-600 px-4 py-2" disabled={isLoading}>Login</button>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
    </form>
  );
}
