"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLoginOrganizationMutation } from "@/apis/organization.api";
import { organizationLoginSchema } from "@/schemas/organization.schema";
import { useAppDispatch } from "@/store/hooks";
import { setSession } from "@/slices/session.slice";
import { extractApiErrorCode, extractApiErrorMessage } from "@/lib/api-error";
import { setPendingEmail } from "@/lib/pending-email";
import { useRedirectIfAuthenticated } from "@/lib/auth-guard";
import { loginPageBackground } from "@/assets/images/login-backgrounds";
import { Button, ButtonLink } from "@/components/ui/button";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-400">{message}</p>;
}

const loginInputBase =
  "w-full rounded-lg border bg-[#23272f] py-3 pl-10 pr-3 text-base text-eh-text-primary placeholder:text-eh-text-tertiary focus:outline-none focus:ring-1 md:text-sm";

function loginInputClass(hasError: boolean): string {
  if (hasError) {
    return `${loginInputBase} border-red-500/90 focus:border-red-400 focus:ring-red-400/50`;
  }
  return `${loginInputBase} border-eh-border focus:border-eh-accent focus:ring-eh-accent`;
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function OrganizationLoginScreen() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginOrganization, { isLoading }] = useLoginOrganizationMutation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateField(key: "email" | "password", value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setErrorMessage(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = organizationLoginSchema.safeParse({
      email: form.email,
      password: form.password,
      remember: staySignedIn,
    });
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
      const response = await loginOrganization(parsed.data).unwrap();
      dispatch(setSession({ token: response.data.token, domain: "organization" }));
      setErrorMessage(null);
      router.push("/organization/dashboard");
    } catch (error) {
      if (extractApiErrorCode(error) === "EMAIL_NOT_VERIFIED") {
        setPendingEmail("organization", form.email);
        router.push(`/organization/auth/verify?email=${encodeURIComponent(form.email)}`);
        return;
      }
      setErrorMessage(extractApiErrorMessage(error));
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-eh-default text-eh-text-primary">
      <div className="pointer-events-none absolute inset-0 z-0 min-h-screen w-full overflow-hidden grayscale" aria-hidden>
        <div className="relative h-full min-h-screen w-full">
          <Image src={loginPageBackground} alt="" fill sizes="100vw" className="object-cover" priority />
        </div>
        <div className="absolute inset-0 bg-eh-default/55" />
      </div>
      <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12">
        <div className="flex min-h-[calc(100dvh-2.5rem)] flex-1 flex-col border border-black/30 bg-eh-surface/80 shadow-[0_4px_48px_rgba(0,0,0,0.45)] backdrop-blur-md sm:min-h-[calc(100dvh-3rem)] md:min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-5rem)] xl:min-h-[calc(100dvh-6rem)]">
          <div className="h-[3px] w-full shrink-0 bg-eh-accent" aria-hidden />
          <div className="flex flex-1 flex-col px-4 pb-8 pt-6 md:px-8 md:pb-10 lg:px-12 lg:pb-12 xl:px-16">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-8">
          <div className="flex max-w-xl flex-1 flex-col gap-8">
            <div>
              <h1 className="text-4xl font-bold uppercase leading-tight tracking-tight md:text-5xl lg:text-6xl">
                <span className="text-eh-text-primary">FANCIRCLE</span>
                <br />
                <span className="text-eh-accent">Eventhub</span>
              </h1>
              <p className="mt-6 text-base leading-relaxed text-eh-text-secondary md:text-lg">
                Welcome back. Step onto your digital stage and manage your premium events with precision.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-eh-default bg-eh-surface text-xs font-medium text-eh-text-tertiary ring-2 ring-eh-default">
                  A
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-eh-default bg-eh-surface text-xs font-medium text-eh-text-tertiary ring-2 ring-eh-default">
                  B
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-eh-default bg-eh-surface text-xs font-medium text-eh-text-tertiary ring-2 ring-eh-default">
                  C
                </span>
              </div>
              <p className="max-w-56 text-[10px] font-semibold uppercase leading-snug tracking-wide text-eh-text-tertiary">
                Trusted by 1,200+ global organizers and artists.
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md shrink-0 rounded-2xl border border-eh-border/50 bg-eh-default p-8 shadow-xl shadow-black/30 md:p-10 lg:mx-0">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-eh-text-primary">Organizer login</h2>
              <p className="mt-2 text-sm text-eh-text-secondary">
                Enter your credentials to manage your gallery.
              </p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-eh-text-tertiary">
                  Email
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-eh-text-tertiary">
                    <MailIcon />
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="kurator@fancircle.live"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={loginInputClass(!!fieldErrors.email)}
                    aria-invalid={!!fieldErrors.email}
                  />
                </div>
                <FieldError message={fieldErrors.email} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-eh-text-tertiary">
                    Password
                  </label>
                  <Link
                    href={
                      form.email.trim()
                        ? `/organization/auth/forgot-password?email=${encodeURIComponent(form.email.trim())}`
                        : "/organization/auth/forgot-password"
                    }
                    className="text-[10px] font-semibold uppercase tracking-wide text-eh-accent hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-eh-text-tertiary">
                    <LockIcon />
                  </span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className={loginInputClass(!!fieldErrors.password)}
                    aria-invalid={!!fieldErrors.password}
                  />
                </div>
                <FieldError message={fieldErrors.password} />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-eh-text-secondary">
                <input
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={(e) => setStaySignedIn(e.target.checked)}
                  className="size-4 rounded border-eh-border bg-[#23272f] accent-[#fddc53] focus:ring-eh-accent"
                />
                Stay signed in
              </label>

              <Button type="submit" variant="primary" fullWidth loading={isLoading} className="mt-2">
                Login
              </Button>

              {errorMessage ? <p className="text-center text-sm text-red-400">{errorMessage}</p> : null}
            </form>

            <div className="mt-8 flex flex-col gap-4 border-t border-eh-border pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-eh-text-secondary">New to Fancircle Eventhub?</p>
              <ButtonLink href="/organization/auth/register" variant="secondary">
                Request access
              </ButtonLink>
            </div>
          </div>
        </div>

        <footer className="mx-auto mt-auto flex w-full max-w-6xl flex-col gap-4 border-t border-eh-border/60 pt-8 text-xs text-eh-text-tertiary sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Fancircle Eventhub.</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 uppercase tracking-wide">
            <a href="#" className="hover:text-eh-text-secondary">
              Terms
            </a>
            <a href="#" className="hover:text-eh-text-secondary">
              Privacy
            </a>
            <a href="#" className="hover:text-eh-text-secondary">
              Support
            </a>
            <a href="#" className="hover:text-eh-text-secondary">
              API docs
            </a>
          </nav>
        </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
