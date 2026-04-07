import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Manrope, Space_Grotesk } from "next/font/google";

import { CartDock } from "@/components/cart-dock";
import { CartLink } from "@/components/cart-link";
import { CartProvider } from "@/components/cart-provider";
import { ToastProvider } from "@/components/toast-provider";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "CardPulse",
  description: "Telegram Mini App storefront for trading cards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} font-[family-name:var(--font-body)] text-ink antialiased`}
      >
        <ToastProvider>
          <CartProvider>
            <div className="mx-auto min-h-screen max-w-7xl px-4 pb-32 pt-1.5 sm:px-6 lg:px-8">
              <header className="z-20 mb-3 rounded-[1.1rem] border border-white/10 bg-white/5 px-2.5 py-1 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-sm md:sticky md:top-2 sm:px-3.5">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
                  <nav className="flex items-center justify-start text-sm font-medium text-slate-300">
                    <Link
                      href="/browse"
                      className="rounded-full px-2 py-0.5 hover:bg-white/10 sm:px-2.5"
                    >
                      Browse
                    </Link>
                  </nav>
                  <Link href="/" className="flex min-w-0 items-center justify-center">
                    <Image
                      src="/brand/cardpulse-logo.png"
                      alt="CardPulse"
                      width={208}
                      height={64}
                      priority
                      className="h-auto w-[92px] object-contain sm:w-[156px]"
                    />
                  </Link>
                  <nav className="flex items-center justify-end gap-1 text-sm font-medium text-slate-300 sm:gap-2">
                    <CartLink />
                  </nav>
                </div>
              </header>
              {children}
            </div>
            <CartDock />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
