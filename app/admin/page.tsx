import { deleteCardAction, upsertCardAction } from "@/app/admin/actions";
import Link from "next/link";

import { AdminToastBridge } from "@/components/admin-toast-bridge";
import { AdminSelect } from "@/components/admin-select";
import { CARD_TYPE_OPTIONS } from "@/lib/card-types";
import { getAdminCardsByQuery } from "@/lib/queries";
import { RARITY_OPTIONS } from "@/lib/rarities";
import { SET_GROUPS, normalizeSetLabel } from "@/lib/sets";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function CardFormFields({
  defaults,
  redirectTo,
}: {
  defaults?: {
    id?: number;
    card_name?: string;
    card_code?: string;
    set_code?: string;
    card_type?: string;
    rarity?: string;
    is_alt_art?: number;
    character?: string;
    language?: string;
    condition?: string;
    price_sgd?: number;
    quantity?: number;
    image_url?: string;
    is_featured?: number;
  };
  redirectTo: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      <input type="hidden" name="current_image_url" value={defaults?.image_url ?? ""} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-stone">Card Name</label>
        <input name="card_name" defaultValue={defaults?.card_name} className="field" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-stone">Card Code</label>
        <input name="card_code" defaultValue={defaults?.card_code} className="field" required />
      </div>
      <div>
        <AdminSelect
          name="set_code"
          label="Set"
          value={normalizeSetLabel(defaults?.set_code ?? SET_GROUPS[0].options[0])}
          groups={SET_GROUPS}
        />
      </div>
      <div>
        <AdminSelect
          name="card_type"
          label="Card Type"
          value={defaults?.card_type ?? CARD_TYPE_OPTIONS[0]}
          options={CARD_TYPE_OPTIONS}
        />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <AdminSelect
          name="rarity"
          label="Rarity"
          value={defaults?.rarity ?? "R"}
          options={RARITY_OPTIONS}
        />
        <div>
          <span className="mb-2 block text-sm font-medium text-stone">AA</span>
          <label className="flex min-h-[56px] items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-ink">
            <input
              name="is_alt_art"
              type="checkbox"
              defaultChecked={Boolean(defaults?.is_alt_art ?? 0)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Alt Art
          </label>
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-stone">Character</label>
        <input name="character" defaultValue={defaults?.character} className="field" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-stone">Language</label>
        <input name="language" defaultValue={defaults?.language} className="field" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-stone">Condition</label>
        <input name="condition" defaultValue={defaults?.condition} className="field" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-stone">Price (SGD)</label>
        <input
          name="price_sgd"
          type="number"
          min="0"
          step="1"
          defaultValue={defaults?.price_sgd}
          className="field"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-stone">Quantity</label>
        <input
          name="quantity"
          type="number"
          min="0"
          step="1"
          defaultValue={defaults?.quantity}
          className="field"
          required
        />
      </div>
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-stone">Upload Image</label>
        <input
          name="image_file"
          type="file"
          accept="image/*"
          className="field file:mr-4 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
        />
        <p className="mt-2 text-xs text-stone">
          {defaults?.id
            ? "Upload a new image only if you want to replace the current one."
            : "Upload is required for new cards."}
        </p>
      </div>
      <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-ink">
        <input
          name="is_featured"
          type="checkbox"
          defaultChecked={Boolean(defaults?.is_featured ?? 0)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Featured
      </label>
    </div>
  );
}

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const query = (getSearchValue(params.query) ?? "").trim();
  const cards = await getAdminCardsByQuery(query);
  const redirectTo = query ? `/admin?query=${encodeURIComponent(query)}` : "/admin";

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

      <section className="card-shell rounded-[2rem] p-6">
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-semibold">Add a new card</h2>
          <p className="text-sm text-stone">
            Upload the card image, then fill in the rest of the inventory details.
          </p>
        </div>
        <form action={upsertCardAction} className="space-y-5">
          <CardFormFields redirectTo="/admin" />
          <button type="submit" className="btn-primary">
            Save card
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Current inventory</h2>
              <p className="text-sm text-stone">
                {query ? `${cards.length} matching cards` : `${cards.length} total cards`}
              </p>
            </div>
            <form action="/admin" className="flex w-full max-w-xl items-center gap-3">
              <input
                type="search"
                name="query"
                defaultValue={query}
                placeholder="Search by card name, code, or set"
                className="field min-h-[48px] flex-1"
              />
              <button type="submit" className="btn-primary shrink-0">
                Search
              </button>
              {query ? (
                <a
                  href="/admin"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-ink transition hover:bg-white"
                >
                  Clear
                </a>
              ) : null}
            </form>
          </div>
        </div>
        <div className="space-y-4">
          {cards.map((card) => (
            <details key={card.id} className="card-shell rounded-[1.75rem]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="font-heading text-xl font-semibold text-ink">{card.card_name}</p>
                  <p className="text-sm text-stone">
                    {card.card_code} · {card.card_type} · {card.set_code} · {formatCurrency(card.price_sgd)}
                  </p>
                </div>
                <div className="text-right text-sm text-stone">
                  <p>{card.quantity > 0 ? "Available" : "Sold Out"}</p>
                  <p>Added {formatDate(card.created_at)}</p>
                </div>
              </summary>
              <div className="grid gap-5 border-t border-slate-200 p-5 lg:grid-cols-[220px_1fr]">
                <img
                  src={card.image_url}
                  alt={card.card_name}
                  className="aspect-[4/5] w-full rounded-[1.25rem] object-cover"
                />
                <div className="space-y-5">
                  <form action={upsertCardAction} className="space-y-5">
                    <CardFormFields defaults={card} redirectTo={redirectTo} />
                    <button type="submit" className="btn-primary">
                      Update card
                    </button>
                  </form>
                  <form action={deleteCardAction}>
                    <input type="hidden" name="id" value={card.id} />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete card
                    </button>
                  </form>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
