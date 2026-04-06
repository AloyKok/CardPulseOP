import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  available: boolean;
};

export function StatusBadge({ available }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm",
        available
          ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border border-slate-200 bg-slate-100 text-slate-500",
      )}
    >
      {available ? "Available" : "Sold Out"}
    </span>
  );
}
