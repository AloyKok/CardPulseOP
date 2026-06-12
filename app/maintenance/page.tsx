import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Maintenance",
  description:
    "CardPulse is temporarily down for maintenance. For urgent enquiries, message @beppooo on Telegram.",
  alternates: {
    canonical: "/maintenance",
  },
};

export default function MaintenancePage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center py-10">
      <section className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 text-center shadow-[0_24px_64px_rgba(0,0,0,0.38)] backdrop-blur-sm sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">
          Temporary Downtime
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          CardPulse is down for maintenance.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
          We&apos;re making updates and will be back shortly. If you have any enquiries in the
          meantime, drop me a text on Telegram.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="https://t.me/beppooo"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-slate-100"
          >
            Message @beppooo
          </Link>
          <p className="text-sm text-slate-400">Thank you for your patience.</p>
        </div>
      </section>
    </main>
  );
}
