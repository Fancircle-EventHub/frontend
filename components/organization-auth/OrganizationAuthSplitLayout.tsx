import type { ReactNode } from "react";
import Image from "next/image";
import { loginPageBackground } from "@/assets/images/login-backgrounds";

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

export type OrganizationAuthSplitLayoutProps = {
  heroTitle: string;
  heroDescription: string;
  formTitle: string;
  formDescription: string;
  children: ReactNode;
};

export function OrganizationAuthSplitLayout({
  heroTitle,
  heroDescription,
  formTitle,
  formDescription,
  children,
}: OrganizationAuthSplitLayoutProps) {
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
              <h1 className="text-3xl font-bold leading-tight text-eh-text-primary md:text-4xl lg:text-[2.5rem]">{heroTitle}</h1>
              <p className="text-sm leading-relaxed text-eh-text-secondary md:text-base">{heroDescription}</p>
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
              <h2 className="text-2xl font-semibold text-eh-text-primary">{formTitle}</h2>
              <p className="mt-2 text-sm text-eh-text-secondary">{formDescription}</p>
              {children}
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
