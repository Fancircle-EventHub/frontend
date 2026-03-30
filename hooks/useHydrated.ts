"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** True after mount. Use to avoid SSR vs client-only state mismatches (e.g. RTK cache). */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
