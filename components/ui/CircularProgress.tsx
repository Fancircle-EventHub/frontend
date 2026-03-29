type CircularProgressProps = {
  size?: number;
  variant?: "accent" | "on-accent";
  className?: string;
  "aria-label"?: string;
};

export function CircularProgress({
  size = 20,
  variant = "accent",
  className = "",
  "aria-label": ariaLabel = "Loading",
}: CircularProgressProps) {
  const variantClass =
    variant === "on-accent"
      ? "border-[#0a0a0a]/30 border-t-[#0a0a0a]"
      : "border-eh-accent/25 border-t-eh-accent";

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`pointer-events-none inline-block shrink-0 animate-spin rounded-full border-2 border-solid ${variantClass} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
