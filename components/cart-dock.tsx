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
    <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-30 md:hidden">
      <div className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-[#111317]/90 px-4 py-3.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Cart ready</p>
          <p className="font-heading text-lg font-semibold tracking-tight">
            {itemCount} item{itemCount > 1 ? "s" : ""} · {formatCurrency(subtotal)}
          </p>
        </div>
        <Link
          href="/cart"
          className="shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-[0_12px_24px_rgba(255,255,255,0.12)]"
        >
          View cart
        </Link>
      </div>
    </div>
  );
}
