import Link from "next/link";

import { getAnalyticsDashboard } from "@/lib/analytics-queries";

export const dynamic = "force-dynamic";

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_14px_28px_rgba(0,0,0,0.08)]">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsDashboard();

  return (
    <main className="space-y-8 pb-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white">Admin analytics</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-white">
            CardPulse activity snapshot.
          </h1>
          <p className="max-w-2xl text-slate-300">
            Lightweight funnel and discovery signals from the latest tracked app events.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex min-h-[48px] items-center justify-center whitespace-nowrap rounded-full border border-white/16 bg-white px-5 text-sm font-medium text-ink shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition hover:bg-slate-100"
        >
          Back to admin
        </Link>
      </section>

      {!analytics.isConfigured ? (
        <section className="card-shell rounded-[1.75rem] p-5">
          <h2 className="font-heading text-2xl font-semibold text-ink">Analytics setup required</h2>
          <p className="mt-3 max-w-3xl text-stone">
            Analytics is not fully configured yet. Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in
            your environment and run the analytics SQL migration in the Supabase SQL Editor, then
            refresh this page.
          </p>
          <div className="mt-4 rounded-[1.15rem] bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-ink">
              File to run: <span className="font-mono">supabase/migrations/20260407_add_analytics_events.sql</span>
            </p>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Browse viewed" value={analytics.funnel.browse_viewed} />
        <MetricCard label="Product viewed" value={analytics.funnel.product_viewed} />
        <MetricCard label="Claim clicked" value={analytics.funnel.claim_clicked} />
        <MetricCard label="Telegram checkout" value={analytics.funnel.telegram_checkout_clicked} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="card-shell rounded-[1.75rem] p-5">
          <h2 className="font-heading text-2xl font-semibold text-ink">Most viewed cards</h2>
          <div className="mt-4 space-y-3">
            {analytics.mostViewedCards.length > 0 ? (
              analytics.mostViewedCards.map((card) => (
                <div
                  key={card.card_id}
                  className="flex items-center justify-between gap-4 rounded-[1.15rem] bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{card.card_name}</p>
                    <p className="text-sm text-stone">{card.card_code}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-ink">{card.count}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone">No product views tracked yet.</p>
            )}
          </div>
        </div>

        <div className="card-shell rounded-[1.75rem] p-5">
          <h2 className="font-heading text-2xl font-semibold text-ink">Most claimed cards</h2>
          <div className="mt-4 space-y-3">
            {analytics.mostClaimedCards.length > 0 ? (
              analytics.mostClaimedCards.map((card) => (
                <div
                  key={card.card_id}
                  className="flex items-center justify-between gap-4 rounded-[1.15rem] bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{card.card_name}</p>
                    <p className="text-sm text-stone">{card.card_code}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-ink">{card.count}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone">No claim clicks tracked yet.</p>
            )}
          </div>
        </div>

        <div className="card-shell rounded-[1.75rem] p-5">
          <h2 className="font-heading text-2xl font-semibold text-ink">Top search terms</h2>
          <div className="mt-4 space-y-3">
            {analytics.topSearchTerms.length > 0 ? (
              analytics.topSearchTerms.map((term) => (
                <div
                  key={term.term}
                  className="flex items-center justify-between gap-4 rounded-[1.15rem] bg-slate-50 px-4 py-3"
                >
                  <p className="truncate font-medium text-ink">{term.term}</p>
                  <p className="shrink-0 text-sm font-semibold text-ink">{term.count}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone">No search terms tracked yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="card-shell rounded-[1.75rem] p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-semibold text-ink">Event totals</h2>
          <p className="text-sm text-stone">{analytics.totalEvents} total events stored</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries(analytics.funnel).map(([eventName, count]) => (
            <div key={eventName} className="rounded-[1.15rem] bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-stone">{eventName}</p>
              <p className="mt-2 text-xl font-semibold text-ink">{count}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
