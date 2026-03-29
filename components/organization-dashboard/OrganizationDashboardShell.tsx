"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

function NavIconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="11" width="7" height="10" rx="1" />
      <rect x="3" y="15" width="7" height="6" rx="1" />
    </svg>
  );
}

function NavIconEventsTicket({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="12" cy="12" r="2.25" />
    </svg>
  );
}

function NavIconPalette({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.43-.18-.83-.43-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 011.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.96 6.01 17.46 2 12 2z" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function NavIconPuzzle({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <path d="M5 4h6v2h2V4h6v6h-2v2h2v6h-6v-2h-2v2H5v-6h2v-2H5V4z" />
    </svg>
  );
}

function NavIconArchiveBox({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

function NavIconEye({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function NavIconLock({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function NavIconCog({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function NavOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

const secondaryNavComingSoon = [
  { label: "Content", icon: NavIconArchiveBox },
  { label: "Preview", icon: NavIconEye },
  { label: "Access", icon: NavIconLock },
  { label: "Settings", icon: NavIconCog },
];

type OrganizationDashboardShellProps = {
  organizationName: string;
  userEmail?: string;
  organizationLogoUrl?: string | null;
  children: ReactNode;
  onLogout: () => void;
  logoutLoading: boolean;
};

export function OrganizationDashboardShell({
  organizationName,
  userEmail,
  organizationLogoUrl,
  children,
  onLogout,
  logoutLoading,
}: OrganizationDashboardShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setSidebarOpen(false);
    });
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isDashboard = pathname === "/organization/dashboard";
  const isEventsSection = pathname.startsWith("/organization/events");
  const isEventDetailsEditor =
    pathname === "/organization/events/new" || /\/organization\/events\/[^/]+\/edit$/.test(pathname ?? "");
  const isBrandingPage = /\/organization\/events\/[^/]+\/branding/.test(pathname ?? "");
  const isModulesPage = /\/organization\/events\/[^/]+\/modules$/.test(pathname ?? "");
  const isPublishPage = /\/organization\/events\/[^/]+\/publish$/.test(pathname ?? "");
  const isEventsNavActive = isEventsSection && !isBrandingPage && !isModulesPage && !isPublishPage;
  const isModuleNavActive = isModulesPage;
  const isEventEditorHeader = isEventDetailsEditor || isBrandingPage || isModulesPage || isPublishPage;
  const initials = organizationName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "OR";

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-[#121417] text-eh-text-primary">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-full flex-col border-r border-white/10 bg-[#0e1012] transition-transform duration-200 ease-out md:static md:z-auto md:w-64 md:shrink-0 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-end border-b border-white/10 px-3 md:hidden">
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-lg p-2 text-eh-text-tertiary transition hover:bg-white/5 hover:text-eh-text-primary"
            aria-label="Close navigation"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="border-b border-white/10 px-5 py-6 md:border-t-0 md:pt-6">
          <Link href="/organization/dashboard" className="block" onClick={closeSidebar}>
            <span className="text-lg font-bold tracking-tight text-white">Fancircle</span>
            <span className="text-lg font-bold tracking-tight text-eh-accent"> Eventhub</span>
            <span className="mt-2 block text-[9px] font-semibold uppercase tracking-[0.25em] text-eh-text-tertiary">
              Organizer dashboard
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Main">
          <Link
            href="/organization/dashboard"
            onClick={closeSidebar}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
              isDashboard
                ? "border-l-2 border-eh-accent bg-white/5 pl-[10px] text-eh-accent"
                : "border-l-2 border-transparent pl-[10px] text-eh-text-secondary hover:bg-white/5 hover:text-eh-text-primary"
            }`}
          >
            <NavIconDashboard className={isDashboard ? "text-eh-accent" : "text-eh-text-tertiary"} />
            Dashboard
          </Link>
          <Link
            href="/organization/events"
            onClick={closeSidebar}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
              isEventsNavActive
                ? "border-l-2 border-eh-accent bg-white/5 pl-[10px] text-eh-accent"
                : "border-l-2 border-transparent pl-[10px] text-eh-text-secondary hover:bg-white/5 hover:text-eh-text-primary"
            }`}
          >
            <NavIconEventsTicket className={isEventsNavActive ? "text-eh-accent" : "text-eh-text-tertiary"} />
            Events
          </Link>
          <span
            className={`flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 pl-[10px] text-[11px] font-semibold uppercase tracking-[0.12em] ${
              isBrandingPage
                ? "border-l-2 border-eh-accent bg-white/5 text-eh-accent"
                : "border-l-2 border-transparent text-eh-text-tertiary/80"
            }`}
            title="Use Continue on each screen to move through branding and modules."
          >
            <NavIconPalette className={isBrandingPage ? "text-eh-accent" : "text-eh-text-tertiary/60"} />
            Branding
          </span>
          <span
            className={`flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 pl-[10px] text-[11px] font-semibold uppercase tracking-[0.12em] ${
              isModuleNavActive
                ? "border-l-2 border-eh-accent bg-white/5 text-eh-accent"
                : "border-l-2 border-transparent text-eh-text-tertiary/80"
            }`}
            title="Use Continue on each screen to move through branding and modules."
          >
            <NavIconPuzzle className={isModuleNavActive ? "text-eh-accent" : "text-eh-text-tertiary/60"} />
            Module
          </span>
          {secondaryNavComingSoon.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="flex cursor-not-allowed items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 pl-[10px] text-[11px] font-semibold uppercase tracking-[0.12em] text-eh-text-tertiary/70"
              title="Coming soon"
            >
              <Icon className="text-eh-text-tertiary/50" />
              {label}
            </span>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 p-3">
          <div className="mb-3 flex items-center gap-3 rounded-lg px-1 py-2">
            {organizationLogoUrl ? (
              <span className="flex size-10 shrink-0 overflow-hidden rounded-full border border-white/15">
                { }
                <img src={organizationLogoUrl} alt="" className="size-full object-cover" />
              </span>
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#1a1d21] text-xs font-bold text-eh-accent">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{organizationName}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-eh-accent">Organizer account</p>
            </div>
          </div>
          <Link
            href="/organization/events/new"
            onClick={closeSidebar}
            className="flex w-full items-center justify-center rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-bold uppercase tracking-widest text-eh-text-primary transition hover:bg-white/10"
          >
            + New event
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={`shrink-0 border-b border-white/10 bg-[#121417] px-4 md:px-8 ${
            isEventEditorHeader ? "py-3 md:h-16 md:py-0" : "flex h-16 items-center"
          }`}
        >
          {isEventEditorHeader ? (
            <>
              <div className="flex w-full flex-col gap-2 md:hidden">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-eh-text-tertiary transition hover:bg-white/5 hover:text-eh-text-primary"
                    aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
                    aria-expanded={sidebarOpen}
                    onClick={() => setSidebarOpen((o) => !o)}
                  >
                    <NavOpenIcon />
                  </button>
                  <Link
                    href="/organization/events"
                    onClick={closeSidebar}
                    className="min-w-0 flex-1 text-center text-sm font-bold"
                  >
                    <span className="text-eh-accent">Fancircle</span>
                    <span className="text-white"> Eventhub</span>
                  </Link>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-eh-text-tertiary transition hover:bg-white/5 hover:text-eh-text-primary"
                      aria-label="Notifications"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMenuOpen((o) => !o)}
                        className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-eh-surface text-sm font-semibold text-eh-accent"
                        aria-expanded={menuOpen}
                        aria-haspopup="true"
                      >
                        {organizationLogoUrl ? (
                           
                          <img src={organizationLogoUrl} alt="" className="size-full object-cover" />
                        ) : (
                          initials
                        )}
                      </button>
                      {menuOpen ? (
                        <>
                          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
                          <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-white/10 bg-[#1a1d21] py-1 shadow-xl">
                            <div className="border-b border-white/10 px-3 py-2">
                              <p className="truncate text-xs font-semibold text-white">{organizationName}</p>
                              {userEmail ? <p className="truncate text-[10px] text-eh-text-tertiary">{userEmail}</p> : null}
                            </div>
                            <button
                              type="button"
                              disabled={logoutLoading}
                              onClick={() => {
                                setMenuOpen(false);
                                onLogout();
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-eh-text-secondary hover:bg-white/5 disabled:opacity-50"
                            >
                              {logoutLoading ? "Signing out…" : "Log out"}
                            </button>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
                <nav className="flex justify-center gap-6 border-t border-white/10 pt-2" aria-label="View mode">
                  <span className="cursor-not-allowed text-xs font-medium text-eh-text-tertiary sm:text-sm" title="Coming soon">
                    Preview
                  </span>
                  <span className="border-b-2 border-eh-accent pb-0.5 text-xs font-semibold text-white sm:text-sm">Live view</span>
                </nav>
              </div>

              <div className="hidden w-full md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
                <Link href="/organization/events" onClick={closeSidebar} className="justify-self-start text-sm font-bold">
                  <span className="text-eh-accent">Fancircle</span>
                  <span className="text-white"> Eventhub</span>
                </Link>
                <nav className="flex items-center gap-8 justify-self-center" aria-label="View mode">
                  <span className="cursor-not-allowed text-sm font-medium text-eh-text-tertiary" title="Coming soon">
                    Preview
                  </span>
                  <span className="border-b-2 border-eh-accent pb-0.5 text-sm font-semibold text-white">Live view</span>
                </nav>
                <div className="justify-self-end flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-eh-text-tertiary transition hover:bg-white/5 hover:text-eh-text-primary"
                    aria-label="Notifications"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((o) => !o)}
                      className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-eh-surface text-sm font-semibold text-eh-accent"
                      aria-expanded={menuOpen}
                      aria-haspopup="true"
                    >
                      {organizationLogoUrl ? (
                        <img src={organizationLogoUrl} alt="" className="size-full object-cover" />
                      ) : (
                        initials
                      )}
                    </button>
                    {menuOpen ? (
                      <>
                        <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-white/10 bg-[#1a1d21] py-1 shadow-xl">
                          <div className="border-b border-white/10 px-3 py-2">
                            <p className="truncate text-xs font-semibold text-white">{organizationName}</p>
                            {userEmail ? <p className="truncate text-[10px] text-eh-text-tertiary">{userEmail}</p> : null}
                          </div>
                          <button
                            type="button"
                            disabled={logoutLoading}
                            onClick={() => {
                              setMenuOpen(false);
                              onLogout();
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-eh-text-secondary hover:bg-white/5 disabled:opacity-50"
                          >
                            {logoutLoading ? "Signing out…" : "Log out"}
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex w-full items-center justify-between gap-3">
              <button
                type="button"
                className="rounded-lg p-2 text-eh-text-tertiary transition hover:bg-white/5 hover:text-eh-text-primary md:hidden"
                aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen((o) => !o)}
              >
                <NavOpenIcon />
              </button>
              <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
                <Link
                  href="/organization/events/new"
                  onClick={closeSidebar}
                  className="inline-flex shrink-0 items-center rounded-lg bg-eh-accent px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a] transition hover:brightness-95 sm:px-4 sm:text-xs"
                >
                  + New event
                </Link>
                <button
                  type="button"
                  className="rounded-lg p-2 text-eh-text-tertiary transition hover:bg-white/5 hover:text-eh-text-primary"
                  aria-label="Notifications"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="hidden rounded-lg p-2 text-eh-text-tertiary transition hover:bg-white/5 hover:text-eh-text-primary sm:block"
                  aria-label="Help"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                  </svg>
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-eh-surface text-sm font-semibold text-eh-accent"
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                  >
                    {organizationLogoUrl ? (
                       
                      <img src={organizationLogoUrl} alt="" className="size-full object-cover" />
                    ) : (
                      initials
                    )}
                  </button>
                  {menuOpen ? (
                    <>
                      <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-white/10 bg-[#1a1d21] py-1 shadow-xl">
                        <div className="border-b border-white/10 px-3 py-2">
                          <p className="truncate text-xs font-semibold text-white">{organizationName}</p>
                          {userEmail ? <p className="truncate text-[10px] text-eh-text-tertiary">{userEmail}</p> : null}
                        </div>
                        <button
                          type="button"
                          disabled={logoutLoading}
                          onClick={() => {
                            setMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-eh-text-secondary hover:bg-white/5 disabled:opacity-50"
                        >
                          {logoutLoading ? "Signing out…" : "Log out"}
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto px-4 py-8 md:px-8">{children}</main>

        <footer className="shrink-0 border-t border-white/10 px-4 py-4 text-[10px] uppercase tracking-wide text-eh-text-tertiary md:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Fancircle Eventhub</p>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
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
          </div>
        </footer>
      </div>
    </div>
  );
}
