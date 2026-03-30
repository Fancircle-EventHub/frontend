"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogoutGuestMutation } from "@/apis/guest.api";
import { clearSession, setEventContext } from "@/slices/session.slice";
import { baseApi } from "@/services/api/baseApi";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";
import { guestHub } from "@/lib/guest-event-branding";

type Props = {
  open: boolean;
  onClose: () => void;
  eventCode: string;
};

const linkClass = `rounded-xl px-3 py-3 text-sm font-semibold text-eh-accent transition hover:bg-white/5 hover:text-eh-accent ${guestHub.wrap}`;

/**
 * Guest in-event menu: legal links (accent) + sign out.
 * Opens from the header hamburger on event routes.
 */
export function GuestEventMenuDrawer({ open, onClose, eventCode }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading: logoutLoading }] = useLogoutGuestMutation();
  const base = `/guest/event-access/${eventCode}`;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-menu-title"
        className="absolute left-0 top-0 flex h-full w-[min(100vw-2.5rem,18.5rem)] flex-col border-r border-white/10 bg-[#14161c] shadow-2xl supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <p id="guest-menu-title" className="text-sm font-bold text-white">
            Menu
          </p>
          <button
            type="button"
            className="rounded-lg p-2 text-eh-text-tertiary transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Account and legal">
          <Link href={`${base}/profile`} className={linkClass} onClick={onClose}>
            My profile
          </Link>
          <Link href={`${base}/legal`} className={linkClass} onClick={onClose}>
            Legal notice
          </Link>
          <Link href={`${base}/privacy`} className={linkClass} onClick={onClose}>
            Privacy policy
          </Link>
        </nav>

        <div className="border-t border-white/10 p-3 supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            loading={logoutLoading}
            disabled={logoutLoading}
            onClick={async () => {
              try {
                await logout().unwrap();
              } catch {
                /* still clear local session */
              }
              dispatch(setEventContext(null));
              dispatch(clearSession());
              dispatch(baseApi.util.resetApiState());
              onClose();
              router.replace(guestEventAuthPaths.login(eventCode));
            }}
          >
            Sign out
          </Button>
        </div>
      </aside>
    </div>
  );
}
