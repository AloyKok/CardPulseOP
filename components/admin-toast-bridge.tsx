"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useToast } from "@/components/toast-provider";

const toastMessages: Record<string, string> = {
  "card-added": "Card added successfully.",
  "card-updated": "Card updated successfully.",
  "card-deleted": "Card deleted successfully.",
};

export function AdminToastBridge() {
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastToastRef = useRef<string | null>(null);

  useEffect(() => {
    const toastKey = searchParams.get("toast");

    if (!toastKey || lastToastRef.current === toastKey) {
      return;
    }

    const message = toastMessages[toastKey];

    if (message) {
      showToast(message);
      lastToastRef.current = toastKey;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("toast");
    const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;

    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams, showToast]);

  return null;
}
