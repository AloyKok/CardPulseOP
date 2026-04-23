import Link from "next/link";

import { AdminCommandConsole } from "@/components/admin-command-console";
import { AdminInventoryManager } from "@/components/admin-inventory-manager";
import { AdminToastBridge } from "@/components/admin-toast-bridge";
import { getAdminCards } from "@/lib/queries";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const query = (getSearchValue(params.query) ?? "").trim();
  const cards = await getAdminCards();

  return (
    <main className="space-y-8 pb-10">
      <AdminToastBridge />
      <section className="space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white">Admin panel</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-white">
              Manage CardPulse inventory.
            </h1>
            <p className="max-w-2xl text-slate-300">
              Add cards, update price and stock, and cards with zero quantity will show as sold out automatically.
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className="inline-flex min-h-[48px] items-center justify-center whitespace-nowrap rounded-full border border-white/16 bg-white px-5 text-sm font-medium text-ink shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition hover:bg-slate-100"
          >
            View analytics
          </Link>
        </div>
      </section>

      <AdminCommandConsole />

      <AdminInventoryManager initialCards={cards} initialQuery={query} />
    </main>
  );
}
