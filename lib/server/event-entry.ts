import { cache } from "react";
import type { ApiEnvelope } from "@/types/api.types";
import type { Event } from "@/types/event.types";

function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
}

async function fetchEventEntryByCode(code: string): Promise<Event | null> {
  if (!code || code === "no-context") return null;
  try {
    const res = await fetch(`${getApiBase()}/events/${encodeURIComponent(code)}/entry`, {
      next: { revalidate: 120 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiEnvelope<Event>;
    if (!json.success || !json.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

/** Deduplicates event fetches within a single request when composing nested metadata. */
export const getCachedEventEntryByCode = cache(fetchEventEntryByCode);
