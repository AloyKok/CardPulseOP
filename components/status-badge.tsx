import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  available: boolean;
};

export function StatusBadge({ available }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "pill",
        available
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-slate-200 bg-slate-50 text-slate-500",
      )}
    >
      {available ? "Available" : "Sold"}
    </span>
  );
}
