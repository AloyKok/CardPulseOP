"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/utils";

export function CartDock() {
  const pathname = usePathname();
  const { hydrated, itemCount, subtotal } = useCart();

  if (!hydrated || itemCount === 0 || pathname.startsWith("/admin") || pathname === "/cart") {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+14px)] z-30 md:hidden">
      <div className="rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,20,0.96),rgba(10,10,11,0.94))] px-4 py-3.5 text-white shadow-[0_22px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Cart Ready
            </p>
            <p className="mt-1 font-heading text-lg font-semibold tracking-tight text-white">
              {itemCount} item{itemCount > 1 ? "s" : ""} · {formatCurrency(subtotal)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Review selections before sending your claim.</p>
          </div>
          <Link
            href="/cart"
            className="shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-[0_12px_24px_rgba(255,255,255,0.14)]"
          >
            View cart
          </Link>
        </div>
      </div>
    </div>
  );
}
