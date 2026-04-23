"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";

import { deleteCardAction, upsertCardAction } from "@/app/admin/actions";
import { AdminSelect } from "@/components/admin-select";
import { useToast } from "@/components/toast-provider";
import { CARD_TYPE_OPTIONS } from "@/lib/card-types";
import { RARITY_OPTIONS } from "@/lib/rarities";
import { SET_GROUPS, normalizeSetLabel } from "@/lib/sets";
import type { Card } from "@/lib/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

type CardFormFieldsProps = {
  defaults?: Partial<Card>;
  formKey?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function cardMatchesQuery(card: Card, query: string) {
  const term = query.trim().toLowerCase();

  if (!term) {
    return true;
  }

  return [card.card_name, card.card_code, card.set_code, card.card_type, card.rarity].some((value) =>
    value.toLowerCase().includes(term),
  );
}

function sortInventoryCards(cards: Card[]) {
  return [...cards].sort((a, b) => {
    if (a.is_available !== b.is_available) {
      return b.is_available - a.is_available;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function CardFormFields({ defaults, formKey }: CardFormFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      <input type="hidden" name="current_image_url" value={defaults?.image_url ?? ""} />

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
          key={`${formKey ?? defaults?.id ?? "new"}-set`}
          name="set_code"
          label="Set"
          value={normalizeSetLabel(defaults?.set_code ?? SET_GROUPS[0].options[0])}
          groups={SET_GROUPS}
        />
      </div>
      <div>
        <AdminSelect
          key={`${formKey ?? defaults?.id ?? "new"}-type`}
          name="card_type"
          label="Card Type"
          value={defaults?.card_type ?? CARD_TYPE_OPTIONS[0]}
          options={CARD_TYPE_OPTIONS}
        />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <AdminSelect
          key={`${formKey ?? defaults?.id ?? "new"}-rarity`}
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
          required={!defaults?.id}
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

export function AdminInventoryManager({
  initialCards,
  initialQuery = "",
}: {
  initialCards: Card[];
  initialQuery?: string;
}) {
  const { showToast } = useToast();
  const addFormRef = useRef<HTMLFormElement | null>(null);
  const [cards, setCards] = useState(() => sortInventoryCards(initialCards));
  const [query, setQuery] = useState(initialQuery);
  const [addFormKey, setAddFormKey] = useState(0);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const visibleCards = useMemo(
    () => cards.filter((card) => cardMatchesQuery(card, query)),
    [cards, query],
  );

  async function handleUpsert(event: FormEvent<HTMLFormElement>, mode: "create" | "update") {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const id = String(formData.get("id") || "");
    const key = mode === "create" ? "create" : `update-${id}`;

    setPendingKey(key);

    try {
      const result = await upsertCardAction(formData);

      setCards((current) => {
        const next =
          result.mode === "created"
            ? [result.card, ...current]
            : current.map((card) => (card.id === result.card.id ? result.card : card));

        return sortInventoryCards(next);
      });

      if (result.mode === "created") {
        addFormRef.current?.reset();
        setAddFormKey((current) => current + 1);
        showToast("Card added successfully.");
      } else {
        showToast("Card updated successfully.");
      }
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setPendingKey(null);
    }
  }

  async function handleDelete(event: FormEvent<HTMLFormElement>, card: Card) {
    event.preventDefault();

    if (!window.confirm(`Delete ${card.card_name} (${card.card_code})?`)) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setPendingKey(`delete-${card.id}`);

    try {
      const result = await deleteCardAction(formData);
      setCards((current) => current.filter((item) => item.id !== result.id));
      showToast("Card deleted successfully.");
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <>
      <section className="card-shell rounded-[2rem] p-6">
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-semibold">Add a new card</h2>
          <p className="text-sm text-stone">
            Upload the card image, then fill in the rest of the inventory details.
          </p>
        </div>
        <form
          key={addFormKey}
          ref={addFormRef}
          onSubmit={(event) => handleUpsert(event, "create")}
          className="space-y-5"
        >
          <CardFormFields formKey={`new-${addFormKey}`} />
          <button type="submit" className="btn-primary" disabled={pendingKey === "create"}>
            {pendingKey === "create" ? "Saving..." : "Save card"}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Current inventory</h2>
              <p className="text-sm text-stone">
                {query ? `${visibleCards.length} matching cards` : `${cards.length} total cards`}
              </p>
            </div>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="flex w-full max-w-xl items-center gap-3"
            >
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by card name, code, set, type, or rarity"
                className="field min-h-[48px] flex-1"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-ink transition hover:bg-white"
                >
                  Clear
                </button>
              ) : null}
            </form>
          </div>
        </div>
        <div className="space-y-4">
          {visibleCards.map((card) => (
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
                  <p>Updated {formatDate(card.updated_at)}</p>
                </div>
              </summary>
              <div className="grid gap-5 border-t border-slate-200 p-5 lg:grid-cols-[220px_1fr]">
                <img
                  src={card.image_url}
                  alt={card.card_name}
                  className="aspect-[4/5] w-full rounded-[1.25rem] object-cover"
                />
                <div className="space-y-5">
                  <form onSubmit={(event) => handleUpsert(event, "update")} className="space-y-5">
                    <CardFormFields defaults={card} />
                    <p className="text-sm text-stone">
                      Last updated {formatDateTime(card.updated_at)}
                    </p>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={pendingKey === `update-${card.id}`}
                    >
                      {pendingKey === `update-${card.id}` ? "Updating..." : "Update card"}
                    </button>
                  </form>
                  <form onSubmit={(event) => handleDelete(event, card)}>
                    <input type="hidden" name="id" value={card.id} />
                    <button
                      type="submit"
                      disabled={pendingKey === `delete-${card.id}`}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingKey === `delete-${card.id}` ? "Deleting..." : "Delete card"}
                    </button>
                  </form>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
