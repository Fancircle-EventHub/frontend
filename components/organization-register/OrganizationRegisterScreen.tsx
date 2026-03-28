"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRegisterOrganizationMutation } from "@/apis/organization.api";
import { organizationRegisterFormSchema } from "@/schemas/organization.schema";
import { extractApiErrorMessage, extractFieldError } from "@/lib/api-error";
import { setPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";
import { loginPageBackground } from "@/assets/images/login-backgrounds";
import { Button, ButtonLink } from "@/components/ui/button";

function StarBadge() {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded bg-eh-accent">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#0a0a0a]" aria-hidden>
        <path
          fill="currentColor"
          d="M12 2l2.9 7.3h7.6l-6 4.6 2.3 7.1L12 16.9 7.2 21l2.3-7.1-6-4.6h7.6L12 2z"
        />
      </svg>
    </div>
  );
}

function StarsRow() {
  return (
    <div className="flex gap-0.5 text-eh-accent" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-sm">
          ★
        </span>
      ))}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-400">{message}</p>;
}

const inputBase =
  "w-full rounded-lg border py-3 px-3 text-sm text-eh-text-primary placeholder:text-eh-text-tertiary focus:outline-none focus:ring-1";

const labelClass = "mb-2 block text-[10px] font-semibold uppercase tracking-wider text-eh-text-tertiary";

function inputClassName(hasError: boolean): string {
  if (hasError) {
    return `${inputBase} border-red-500/90 bg-[#23272f] focus:border-red-400 focus:ring-red-400/50`;
  }
  return `${inputBase} border-eh-border bg-[#23272f] focus:border-eh-accent focus:ring-eh-accent`;
}

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
      router.push("/organization/auth/verify");
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
    <div className="relative min-h-screen bg-eh-default text-eh-text-primary">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="relative order-1 flex min-h-[42vh] w-full flex-col justify-between overflow-hidden lg:order-1 lg:min-h-screen lg:w-1/2">
          <div className="absolute inset-0 grayscale">
            <Image src={loginPageBackground} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-eh-default/95 via-eh-default/40 to-black/25" />
          </div>
          <div className="relative z-10 flex flex-1 flex-col justify-between p-6 md:p-10 lg:p-12">
            <div className="flex items-center gap-3">
              <StarBadge />
              <span className="text-lg font-bold tracking-tight text-eh-accent md:text-xl">
                Fancircle <span className="text-eh-text-primary">Eventhub</span>
              </span>
            </div>
            <div className="mt-8 max-w-lg space-y-4">
              <h1 className="text-3xl font-bold leading-tight text-eh-text-primary md:text-4xl lg:text-[2.5rem]">
                Turn every ticket into a live event community.
              </h1>
              <p className="text-sm leading-relaxed text-eh-text-secondary md:text-base">
                Fancircle Eventhub connects your guests right after the ticket sale—so every show feels like a community, not just a transaction.
              </p>
            </div>
            <div className="mt-10 rounded-xl border border-eh-border/60 bg-eh-surface/80 p-5 backdrop-blur-md md:max-w-md">
              <StarsRow />
              <p className="mt-3 text-sm leading-relaxed text-eh-text-secondary">
                “Fancircle has redefined how we run our premium gala experiences. The interface matches the sophistication of our events.”
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-eh-border bg-eh-default text-xs font-semibold text-eh-text-secondary">
                  JV
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-eh-accent">Julian Vance</p>
                  <p className="text-[10px] uppercase tracking-wide text-eh-text-tertiary">Director, Art Basel</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="order-2 flex w-full flex-1 flex-col bg-eh-default lg:order-2 lg:w-1/2 lg:justify-center">
          <div className="flex flex-1 flex-col justify-center px-6 py-10 md:px-12 lg:px-16 xl:px-20">
            <div className="mx-auto w-full max-w-md">
              <h2 className="text-2xl font-semibold text-eh-text-primary">Registration</h2>
              <p className="mt-2 text-sm text-eh-text-secondary">
                Complete your profile to request access.
              </p>

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
            </div>
          </div>

          <footer className="border-t border-eh-border px-6 py-4 text-[10px] uppercase tracking-wide text-eh-text-tertiary md:px-12 lg:px-16">
            <div className="mx-auto flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-between lg:max-w-none">
              <p>© {new Date().getFullYear()} Fancircle Eventhub</p>
              <nav className="flex flex-wrap gap-x-6 gap-y-2">
                <a href="#" className="hover:text-eh-text-secondary">
                  Privacy
                </a>
                <a href="#" className="hover:text-eh-text-secondary">
                  FAQ
                </a>
                <a href="#" className="hover:text-eh-text-secondary">
                  Support
                </a>
              </nav>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
