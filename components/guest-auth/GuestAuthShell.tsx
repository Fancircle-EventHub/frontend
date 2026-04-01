"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { loginPageBackground } from "@/assets/images/login-backgrounds";

export type GuestAuthShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  eventLine?: string | null;
};

export function GuestAuthShell({ eyebrow, title, description, children, eventLine }: GuestAuthShellProps) {
  return (
    <div className="relative min-h-dvh bg-black text-eh-text-primary">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="relative h-full min-h-dvh w-full">
          <Image src={loginPageBackground} alt="" fill sizes="100vw" className="object-cover opacity-40" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-[#0a0a0a]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-10 pt-8 sm:px-6">
        <header className="mb-8 flex flex-col items-center gap-2 text-center">
          <p className="text-lg font-bold tracking-tight text-eh-accent">
            Fancircle <span className="text-eh-text-primary">EventHub</span>
          </p>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-eh-accent/90">{eyebrow}</p>
          ) : null}
          {eventLine ? (
            <p className="text-xs font-medium uppercase tracking-wide text-eh-text-secondary">{eventLine}</p>
          ) : null}
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">{title}</h1>
          {description ? <p className="mt-3 max-w-md text-sm leading-relaxed text-eh-text-secondary">{description}</p> : null}
        </header>

        <div className="rounded-2xl border border-white/10 bg-eh-surface/85 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-7">
          {children}
        </div>

        <p className="mx-auto mt-8 max-w-sm text-center text-[10px] uppercase leading-relaxed tracking-wide text-eh-text-tertiary">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
