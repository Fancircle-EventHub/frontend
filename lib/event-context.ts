const EVENT_CONTEXT_KEY = "eventhub_event_context_code";

export function setEventContextStorage(code: string | null): void {
  if (typeof window === "undefined") return;
  if (!code) {
    localStorage.removeItem(EVENT_CONTEXT_KEY);
    return;
  }
  localStorage.setItem(EVENT_CONTEXT_KEY, code);
}

export function getEventContextStorage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EVENT_CONTEXT_KEY);
}
