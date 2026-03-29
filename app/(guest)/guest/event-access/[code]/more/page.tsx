"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

/**
 * STATIC: “More” hub — shipping, checkout, support copy; legal footer links.
 * Replace with CMS / organizer-configured content when implemented.
 */
export default function GuestEventMorePage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const base = `/guest/event-access/${code}`;

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-2xl">
      <h1 className="text-xl font-bold text-white sm:text-2xl">More</h1>
      <p className="mt-2 text-sm text-eh-text-secondary">
        Helpful information for your order and your visit — static placeholder until organizer content is connected.
      </p>

      <ul className="mt-8 space-y-6">
        <li className="rounded-2xl border border-white/10 bg-[#1a1d24]/90 p-5">
          <div className="flex gap-3">
            <span className="text-eh-accent" aria-hidden>
              <TruckIcon />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">Fast shipping or pickup at the concert</h2>
              <p className="mt-2 text-sm leading-relaxed text-eh-text-secondary">
                Order online and have items shipped to your home, or pick them up at the merch stand at the concert.
              </p>
            </div>
          </div>
        </li>
        <li className="rounded-2xl border border-white/10 bg-[#1a1d24]/90 p-5">
          <div className="flex gap-3">
            <span className="text-eh-accent" aria-hidden>
              <LockIcon />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">Secure checkout</h2>
              <p className="mt-2 text-sm leading-relaxed text-eh-text-secondary">
                We offer secure payment options so you can complete your purchase with confidence.
              </p>
            </div>
          </div>
        </li>
        <li className="rounded-2xl border border-white/10 bg-[#1a1d24]/90 p-5">
          <div className="flex gap-3">
            <span className="text-eh-accent" aria-hidden>
              <SupportIcon />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">Support</h2>
              <p className="mt-2 text-sm leading-relaxed text-eh-text-secondary">
                Questions? Contact our support team at{" "}
                <a href="mailto:support@example.com" className="text-eh-accent underline-offset-2 hover:underline">
                  support@example.com
                </a>
                .
              </p>
            </div>
          </div>
        </li>
      </ul>

      <nav
        className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-white/10 pt-8 text-[11px] font-semibold uppercase tracking-[0.2em]"
        aria-label="Legal"
      >
        <Link href={`${base}/legal`} className="text-eh-accent transition hover:underline">
          Legal notice
        </Link>
        <Link href={`${base}/privacy`} className="text-eh-accent transition hover:underline">
          Privacy policy
        </Link>
      </nav>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M7 15h0M12 15h.01M17 15h0" />
    </svg>
  );
}
