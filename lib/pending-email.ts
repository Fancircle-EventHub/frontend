const ORG_PENDING_EMAIL_KEY = "eventhub_org_pending_email";
const GUEST_PENDING_EMAIL_KEY = "eventhub_guest_pending_email";

export function setPendingEmail(domain: "organization" | "guest", email: string): void {
  if (typeof window === "undefined") return;
  const key = domain === "organization" ? ORG_PENDING_EMAIL_KEY : GUEST_PENDING_EMAIL_KEY;
  localStorage.setItem(key, email);
}

export function getPendingEmail(domain: "organization" | "guest"): string {
  if (typeof window === "undefined") return "";
  const key = domain === "organization" ? ORG_PENDING_EMAIL_KEY : GUEST_PENDING_EMAIL_KEY;
  return localStorage.getItem(key) ?? "";
}

export function clearPendingEmail(domain: "organization" | "guest"): void {
  if (typeof window === "undefined") return;
  const key = domain === "organization" ? ORG_PENDING_EMAIL_KEY : GUEST_PENDING_EMAIL_KEY;
  localStorage.removeItem(key);
}
