import { z } from "zod";

function isAllowedStoredValue(v: string): boolean {
  if (v.startsWith("http://") || v.startsWith("https://")) return true;
  return v.startsWith("public/") || v.startsWith("private/");
}

export const optionalStoragePathOrLegacyUrl = z.preprocess(
  (raw) => {
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw !== "string") return undefined;
    const t = raw.trim();
    return t === "" ? undefined : t;
  },
  z.union([
    z.undefined(),
    z.string().max(2048).refine(isAllowedStoredValue, {
      message: "Use a valid URL or an uploaded file path",
    }),
  ]),
);

export function rawStorageFromEvent(
  pathField: string | null | undefined,
  resolvedFallback: string | null | undefined,
): string {
  if (pathField !== undefined && pathField !== null && pathField !== "") {
    return pathField;
  }
  return resolvedFallback ?? "";
}
