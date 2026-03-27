const TOKEN_KEY = "eventhub_token";
const DOMAIN_KEY = "eventhub_domain";

function migrateLegacyLocalStorage(): void {
  const legacyToken = localStorage.getItem(TOKEN_KEY);
  const legacyDomain = localStorage.getItem(DOMAIN_KEY);
  if (!legacyToken || !legacyDomain) return;
  if (!sessionStorage.getItem(TOKEN_KEY)) {
    sessionStorage.setItem(TOKEN_KEY, legacyToken);
    sessionStorage.setItem(DOMAIN_KEY, legacyDomain);
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(DOMAIN_KEY);
}

export function getAuthFromStorage(): { token: string | null; domain: string | null } {
  if (typeof window === "undefined") return { token: null, domain: null };
  migrateLegacyLocalStorage();
  return {
    token: sessionStorage.getItem(TOKEN_KEY),
    domain: sessionStorage.getItem(DOMAIN_KEY),
  };
}

export function setAuthInStorage(token: string, domain: "organization" | "guest"): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(DOMAIN_KEY, domain);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(DOMAIN_KEY);
}

export function clearAuthFromStorage(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(DOMAIN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(DOMAIN_KEY);
}
