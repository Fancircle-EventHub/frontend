export const guestInputBase =
  "w-full rounded-xl border border-eh-border bg-[#1a1d24] py-3.5 px-4 text-sm text-eh-text-primary placeholder:text-eh-text-tertiary focus:outline-none focus:ring-1 focus:border-eh-accent focus:ring-eh-accent/40";

export function guestInputClass(hasError: boolean): string {
  if (hasError) {
    return `${guestInputBase} border-red-500/80 focus:border-red-400 focus:ring-red-400/40`;
  }
  return guestInputBase;
}

export const guestLabelClass = "text-[10px] font-semibold uppercase tracking-[0.2em] text-eh-text-tertiary";
