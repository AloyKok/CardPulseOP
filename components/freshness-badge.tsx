import { getFreshnessLabel } from "@/lib/freshness";
import { cn } from "@/lib/utils";

type FreshnessBadgeProps = {
  listedAt: string;
  className?: string;
  simplifyTodayLabel?: boolean;
};

export function FreshnessBadge({
  listedAt,
  className,
  simplifyTodayLabel = false,
}: FreshnessBadgeProps) {
  const rawLabel = getFreshnessLabel(listedAt);
  const label = rawLabel === "New today" && simplifyTodayLabel ? "New" : rawLabel;

  if (!label) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em]",
        label === "New today"
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : "border-violet-200 bg-violet-50 text-violet-700",
        className,
      )}
    >
      {label}
    </span>
  );
}
