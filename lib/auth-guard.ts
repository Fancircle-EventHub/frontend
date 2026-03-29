"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { baseApi } from "@/services/api/baseApi";
import { getAuthFromStorage } from "@/lib/auth-storage";
import { getEventContextStorage } from "@/lib/event-context";
import { clearSession, setEventContext } from "@/slices/session.slice";
import { GUEST_INVALID_SESSION_PATH, guestEventAuthPaths } from "@/lib/guest-event-auth-paths";

export function useAuthGuard(requiredDomain: "organization" | "guest", redirectTo: string): void {
  const router = useRouter();

  useEffect(() => {
    const { token, domain } = getAuthFromStorage();
    if (!token || domain !== requiredDomain) {
      router.replace(redirectTo);
    }
  }, [requiredDomain, redirectTo, router]);
}

export function useRedirectIfAuthenticated(): void {
  const router = useRouter();

  useEffect(() => {
    const { token, domain } = getAuthFromStorage();
    if (!token || !domain) return;
    if (domain === "organization") {
      router.replace("/organization/dashboard");
      return;
    }
    const code = getEventContextStorage();
    if (code) {
      router.replace(`/guest/event-access/${code}`);
      return;
    }
    router.replace(GUEST_INVALID_SESSION_PATH);
  }, [router]);
}

export function useRedirectWhenOrganizationSessionFails(isSessionError: boolean): void {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isSessionError) return;
    dispatch(clearSession());
    dispatch(baseApi.util.resetApiState());
    router.replace("/organization/auth/login");
  }, [isSessionError, router, dispatch]);
}

export function useRedirectWhenGuestSessionFails(isSessionError: boolean, eventCode?: string | null): void {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isSessionError) return;
    dispatch(setEventContext(null));
    dispatch(clearSession());
    dispatch(baseApi.util.resetApiState());
    const code = eventCode ?? getEventContextStorage();
    if (code && code !== "no-context") {
      router.replace(guestEventAuthPaths.login(code));
    } else {
      router.replace(GUEST_INVALID_SESSION_PATH);
    }
  }, [isSessionError, router, dispatch, eventCode]);
}
