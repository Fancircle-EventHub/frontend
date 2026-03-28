"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRegisterOrganizationMutation } from "@/apis/organization.api";
import { organizationRegisterFormSchema } from "@/schemas/organization.schema";
import { extractApiErrorMessage, extractFieldError } from "@/lib/api-error";
import { setPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, inputClassName, labelClass } from "@/components/organization-auth/auth-form-primitives";
import { OrganizationAuthSplitLayout } from "@/components/organization-auth/OrganizationAuthSplitLayout";

export function OrganizationRegisterScreen() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const [registerOrganization, { isLoading }] = useRegisterOrganizationMutation();
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    website: "",
    password: "",
    password_confirmation: "",
    termsAccepted: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function clearFieldError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function patchForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    clearFieldError(key);
    setErrorMessage(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = organizationRegisterFormSchema.safeParse(form);
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
      await registerOrganization({
        name: parsed.data.name,
        contact_person: parsed.data.contact_person,
        website: parsed.data.website === "" ? null : parsed.data.website,
        email: parsed.data.email,
        password: parsed.data.password,
        password_confirmation: parsed.data.password_confirmation,
        terms_accepted: parsed.data.termsAccepted,
      }).unwrap();
      setPendingEmail("organization", form.email);
      router.push(`/organization/auth/verify?email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      for (const field of ["email", "name", "contact_person", "website", "password", "terms_accepted"] as const) {
        const msg = extractFieldError(error, field);
        if (msg) {
          const key = field === "terms_accepted" ? "termsAccepted" : field;
          setFieldErrors((prev) => ({ ...prev, [key]: msg }));
        }
      }
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <OrganizationAuthSplitLayout
      heroTitle="Turn every ticket into a live event community."
      heroDescription="Fancircle Eventhub connects your guests right after the ticket sale—so every show feels like a community, not just a transaction."
      formTitle="Registration"
      formDescription="Complete your profile to request access."
    >
      <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
        <div>
          <label className={labelClass} htmlFor="org-name">
            Organization name
          </label>
          <input
            id="org-name"
            className={inputClassName(!!fieldErrors.name)}
            value={form.name}
            onChange={(e) => patchForm("name", e.target.value)}
            placeholder="Your organization"
            autoComplete="organization"
            aria-invalid={!!fieldErrors.name}
          />
          <FieldError message={fieldErrors.name} />
        </div>
        <div>
          <label className={labelClass} htmlFor="org-contact">
            Contact person
          </label>
          <input
            id="org-contact"
            className={inputClassName(!!fieldErrors.contact_person)}
            value={form.contact_person}
            onChange={(e) => patchForm("contact_person", e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            aria-invalid={!!fieldErrors.contact_person}
          />
          <FieldError message={fieldErrors.contact_person} />
        </div>
        <div>
          <label className={labelClass} htmlFor="org-email">
            Email
          </label>
          <input
            id="org-email"
            type="email"
            className={inputClassName(!!fieldErrors.email)}
            value={form.email}
            onChange={(e) => patchForm("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!fieldErrors.email}
          />
          <FieldError message={fieldErrors.email} />
        </div>
        <div>
          <label className={labelClass} htmlFor="org-website">
            Website
          </label>
          <input
            id="org-website"
            type="url"
            className={inputClassName(!!fieldErrors.website)}
            value={form.website}
            onChange={(e) => patchForm("website", e.target.value)}
            placeholder="https://"
            inputMode="url"
            aria-invalid={!!fieldErrors.website}
          />
          <FieldError message={fieldErrors.website} />
        </div>
        <div>
          <label className={labelClass} htmlFor="org-password">
            Create password
          </label>
          <input
            id="org-password"
            type="password"
            className={inputClassName(!!fieldErrors.password)}
            value={form.password}
            onChange={(e) => patchForm("password", e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={!!fieldErrors.password}
          />
          <FieldError message={fieldErrors.password} />
        </div>
        <div>
          <label className={labelClass} htmlFor="org-password-confirm">
            Confirm password
          </label>
          <input
            id="org-password-confirm"
            type="password"
            className={inputClassName(!!fieldErrors.password_confirmation)}
            value={form.password_confirmation}
            onChange={(e) => patchForm("password_confirmation", e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={!!fieldErrors.password_confirmation}
          />
          <FieldError message={fieldErrors.password_confirmation} />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-eh-text-secondary">
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(e) => patchForm("termsAccepted", e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-eh-border bg-[#23272f] accent-[#fddc53] focus:ring-eh-accent"
              aria-invalid={!!fieldErrors.termsAccepted}
            />
            <span>
              I accept the{" "}
              <Link href="#" className="text-eh-accent hover:underline">
                terms of use
              </Link>{" "}
              and the selection process.
            </span>
          </label>
          <FieldError message={fieldErrors.termsAccepted} />
        </div>

        <Button type="submit" variant="primary" fullWidth loading={isLoading} className="mt-2">
          Request access <span aria-hidden>→</span>
        </Button>

        {errorMessage ? <p className="text-center text-sm text-red-400">{errorMessage}</p> : null}

        <p className="text-center text-sm text-eh-text-secondary">
          Already registered?{" "}
          <ButtonLink href="/organization/auth/login" variant="link">
            Sign in
          </ButtonLink>
        </p>
      </form>
    </OrganizationAuthSplitLayout>
  );
}
