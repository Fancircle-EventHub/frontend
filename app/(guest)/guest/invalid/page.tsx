import { notFound } from "next/navigation";

/** Intentionally triggers the app `not-found` UI (e.g. after guest session loss with no event context). */
export default function GuestInvalidPage() {
  notFound();
}
