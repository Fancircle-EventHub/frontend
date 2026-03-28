"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { AUTH_STORAGE_KEYS, getAuthFromStorage } from "@/lib/auth-storage";
import { clearSession, restoreSession } from "@/slices/session.slice";
import { store } from "./index";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const { token, domain } = getAuthFromStorage();
    if (token && (domain === "organization" || domain === "guest")) {
      store.dispatch(restoreSession({ token, domain }));
    }
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.storageArea !== localStorage) return;
      if (e.key !== AUTH_STORAGE_KEYS.token && e.key !== AUTH_STORAGE_KEYS.domain) return;
      queueMicrotask(() => {
        const { token, domain } = getAuthFromStorage();
        if (!token || !(domain === "organization" || domain === "guest")) {
          store.dispatch(clearSession());
          return;
        }
        store.dispatch(restoreSession({ token, domain }));
      });
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
