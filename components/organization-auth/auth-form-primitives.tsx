export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-400">{message}</p>;
}

const inputBase =
  "w-full rounded-lg border py-3 px-3 text-base text-eh-text-primary placeholder:text-eh-text-tertiary focus:outline-none focus:ring-1 md:text-sm";

export const labelClass = "mb-2 block text-[10px] font-semibold uppercase tracking-wider text-eh-text-tertiary";

export function inputClassName(hasError: boolean): string {
  if (hasError) {
    return `${inputBase} border-red-500/90 bg-[#23272f] focus:border-red-400 focus:ring-red-400/50`;
  }
  return `${inputBase} border-eh-border bg-[#23272f] focus:border-eh-accent focus:ring-eh-accent`;
}
