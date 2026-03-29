import { notFound } from "next/navigation";

/** Legacy `/guest/auth/*` URLs are no longer valid — guest auth requires `/guest/event/{code}/auth/...`. */
export default function LegacyGuestAuthCatchAll() {
  notFound();
}
