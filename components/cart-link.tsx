"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/components/cart-provider";

export function CartLink() {
  const pathname = usePathname();
  const { itemCount, hydrated } = useCart();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
      aria-label="Cart"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-current" aria-hidden="true">
        <path
          d="M3.5 5H5.4L7.2 15H18.3L20.3 8H8.1"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9.2" cy="19" r="1.35" strokeWidth="1.8" />
        <circle cx="17" cy="19" r="1.35" strokeWidth="1.8" />
      </svg>
      {hydrated && itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold leading-none text-black">
          {itemCount}
        </span>
      ) : null}
    </Link>
  );
}
