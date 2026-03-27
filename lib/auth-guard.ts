"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthFromStorage } from "@/lib/auth-storage";
import { getEventContextStorage } from "@/lib/event-context";

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
    router.replace(code ? `/guest/event-access/${code}` : "/guest/event-access/no-context");
  }, [router]);
}
