import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — Fancircle Eventhub",
  description: "We couldn’t find that page.",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-[#121417] text-eh-text-primary">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(253,220,83,0.9) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-[min(80vh,520px)] w-[min(90vw,520px)] -translate-y-1/2 rounded-full bg-eh-accent/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-white/3 blur-2xl"
        aria-hidden
      />

      <header className="relative z-10 border-b border-white/10 px-6 py-6 md:px-10">
        <Link href="/" className="inline-block text-lg font-bold tracking-tight">
          <span className="text-white">Fancircle</span>
          <span className="text-eh-accent"> Eventhub</span>
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-8 md:px-10">
        <div className="mx-auto w-full max-w-lg text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-eh-accent">Error 404</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Lights on,
            <br />
            <span className="text-eh-accent">nobody’s home</span>
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-eh-text-secondary sm:text-base">
            That URL isn’t on the bill. It may have moved, never went live, or the access code doesn’t match an event
            hub.
          </p>

          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-eh-accent px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] transition hover:brightness-95"
            >
              Organizer sign in
            </Link>
          </div>

          <div className="mt-14 rounded-2xl border border-white/10 bg-[#16181c]/80 p-6 text-left shadow-xl backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-eh-text-tertiary">Organizers</p>
            <p className="mt-2 text-sm text-eh-text-secondary">
              Open the dashboard from your account to pick an event, or create a new hub from the sidebar.
            </p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-eh-text-tertiary">Guests</p>
            <p className="mt-2 text-sm text-eh-text-secondary">
              Use the link or QR code from your ticket—guest access uses your event’s unique path, not a generic sign-in
              page.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-6 py-5 text-center text-[10px] uppercase tracking-wider text-eh-text-tertiary md:px-10">
        © {new Date().getFullYear()} Fancircle Eventhub
      </footer>
    </div>
  );
}
