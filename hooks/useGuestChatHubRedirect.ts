"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { isChatHubAccessible } from "@/lib/event-modules";

export function useGuestChatHubRedirect(accessCode: string | undefined): "loading" | "redirecting" | "ok" {
  const router = useRouter();
  const { data, isLoading } = useEventEntryByCodeQuery(accessCode ?? "", { skip: !accessCode });
  const enabled = isChatHubAccessible(data?.data?.modules);

  useEffect(() => {
    if (!accessCode || isLoading) return;
    if (!enabled) {
      router.replace(`/guest/event-access/${accessCode}`);
    }
  }, [accessCode, isLoading, enabled, router]);

  if (!accessCode) return "loading";
  if (isLoading) return "loading";
  if (!enabled) return "redirecting";
  return "ok";
}
