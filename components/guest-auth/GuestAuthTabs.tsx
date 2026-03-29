"use client";

import Link from "next/link";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";

type Tab = "login" | "register";

export function GuestAuthTabs({ active, eventCode }: { active: Tab; eventCode: string }) {
  return (
    <div className="mb-6 flex gap-0 border-b border-eh-border/80">
      <Link
        href={guestEventAuthPaths.login(eventCode)}
        className={`flex-1 border-b-2 pb-3 text-center text-xs font-bold uppercase tracking-[0.2em] transition ${
          active === "login" ? "border-eh-accent text-eh-text-primary" : "border-transparent text-eh-text-tertiary hover:text-eh-text-secondary"
        }`}
      >
        Sign in
      </Link>
      <Link
        href={guestEventAuthPaths.register(eventCode)}
        className={`flex-1 border-b-2 pb-3 text-center text-xs font-bold uppercase tracking-[0.2em] transition ${
          active === "register" ? "border-eh-accent text-eh-text-primary" : "border-transparent text-eh-text-tertiary hover:text-eh-text-secondary"
        }`}
      >
        Create account
      </Link>
    </div>
  );
}
