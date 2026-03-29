import { notFound } from "next/navigation";

/** `/guest` has no standalone UI — guests must use an event link (e.g. `/event/{code}`). */
export default function GuestRootPage() {
  notFound();
}
