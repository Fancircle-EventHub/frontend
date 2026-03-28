import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { forwardRef } from "react";
import { CircularProgress } from "./CircularProgress";

function cn(...parts: (string | undefined | false)[]) {
  return parts.filter(Boolean).join(" ");
}

const primaryClasses =
  "inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-eh-accent py-3.5 text-sm font-bold uppercase tracking-widest text-[#0a0a0a] transition hover:brightness-95 disabled:opacity-60";

const secondaryOutlineClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-eh-border bg-transparent px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-eh-text-secondary transition hover:border-eh-text-tertiary hover:text-eh-text-primary";

const secondaryButtonClasses = cn(secondaryOutlineClasses, "min-h-[42px] disabled:opacity-60");

const linkClasses =
  "font-medium text-eh-text-primary underline-offset-4 transition hover:underline";

export type ButtonVariant = "primary" | "secondary";

const variantClass: Record<ButtonVariant, string> = {
  primary: primaryClasses,
  secondary: secondaryButtonClasses,
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", fullWidth, loading, disabled, className, children, type = "button", ...props },
  ref,
) {
  const spinner =
    variant === "primary" ? (
      <CircularProgress variant="on-accent" size={22} />
    ) : (
      <CircularProgress variant="accent" size={22} />
    );

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(variantClass[variant], fullWidth && "w-full", className)}
      {...props}
    >
      {loading ? (
        <>
          {spinner}
          <span className="sr-only">Loading</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

export type ButtonLinkVariant = "secondary" | "link";

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonLinkVariant;
  className?: string;
};

const linkVariantClass: Record<ButtonLinkVariant, string> = {
  secondary: secondaryOutlineClasses,
  link: linkClasses,
};

export function ButtonLink({ variant = "secondary", className, ...props }: ButtonLinkProps) {
  return <Link className={cn(linkVariantClass[variant], className)} {...props} />;
}
