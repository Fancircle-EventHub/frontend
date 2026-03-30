/**
 * Split ISO datetime into date + time parts for native <input type="date"> and <input type="time">,
 * matching patterns used in OrganizationCreateEventScreen (local calendar/time).
 */
export function isoToDateAndTimeParts(iso: string): { date: string; time: string } {
  if (!iso.trim()) return { date: "", time: "" };
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: "", time: "" };
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
  } catch {
    return { date: "", time: "" };
  }
}

/** Combine date (YYYY-MM-DD) + time (HH:mm) into ISO string for APIs. */
export function dateAndTimePartsToIso(date: string, time: string): string {
  const t = time.trim() || "12:00";
  if (!date.trim()) return new Date().toISOString();
  const parsed = new Date(`${date}T${t}`);
  return parsed.toISOString();
}

/**
 * Full calendar date + time for meetup cards so the day is unambiguous (not just "Fri").
 * Example: "Fri, Mar 28, 2026 · 11:09 PM" (locale-aware).
 */
export function formatMeetupSchedule(iso: string): string {
  if (!iso.trim()) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const datePart = d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return `${datePart} · ${timePart}`;
  } catch {
    return iso;
  }
}
