import { CircularProgress } from "@/components/ui/CircularProgress";

type Props = {
  fixed?: boolean;
  className?: string;
};

export function PageCenterSpinner({ fixed, className = "" }: Props) {
  const wrap = fixed
    ? "fixed inset-0 z-[60] flex items-center justify-center bg-black"
    : "flex min-h-[50vh] w-full flex-1 items-center justify-center bg-black";

  return (
    <div className={`${wrap} ${className}`} role="status" aria-label="Loading">
      <CircularProgress size={44} />
    </div>
  );
}
