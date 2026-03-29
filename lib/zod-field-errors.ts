/** Maps Zod `flatten().fieldErrors` to a strict `Record<string, string>` for React state. */
export function zodFieldErrors(record: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, arr] of Object.entries(record)) {
    const first = arr?.[0];
    if (first) out[key] = first;
  }
  return out;
}
