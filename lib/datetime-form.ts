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
