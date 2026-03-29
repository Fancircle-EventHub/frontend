const TOKEN_KEY = "eventhub_token";
const DOMAIN_KEY = "eventhub_domain";

export const AUTH_STORAGE_KEYS = { token: TOKEN_KEY, domain: DOMAIN_KEY } as const;

function migrateSessionStorageToLocalStorage(): void {
  if (typeof window === "undefined") return;
  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  const sessionDomain = sessionStorage.getItem(DOMAIN_KEY);
  if (!sessionToken || !sessionDomain) return;
  if (!localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY, sessionToken);
    localStorage.setItem(DOMAIN_KEY, sessionDomain);
  }
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(DOMAIN_KEY);
}

export function getAuthFromStorage(): { token: string | null; domain: string | null } {
  if (typeof window === "undefined") return { token: null, domain: null };
  migrateSessionStorageToLocalStorage();
  return {
    token: localStorage.getItem(TOKEN_KEY),
    domain: localStorage.getItem(DOMAIN_KEY),
  };
}

export function setAuthInStorage(token: string, domain: "organization" | "guest"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(DOMAIN_KEY, domain);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(DOMAIN_KEY);
}

export function clearAuthFromStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(DOMAIN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(DOMAIN_KEY);
}
