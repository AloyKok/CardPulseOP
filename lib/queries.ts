import { CARD_TYPE_OPTIONS, normalizeCardType } from "@/lib/card-types";
import { sortByLatestListed } from "@/lib/freshness";
import { RARITY_OPTIONS } from "@/lib/rarities";
import { ALL_SET_OPTIONS, normalizeSetLabel } from "@/lib/sets";
import type { Card, CardFilters } from "@/lib/types";
import { createPublicClient } from "@/utils/supabase/server";

export type PaginatedCardsResult = {
  cards: Card[];
  totalCount: number;
  totalPages: number;
  page: number;
  perPage: number;
};

function mapCard(row: Card): Card {
  const quantity = Number(row.quantity);

  return {
    ...row,
    id: Number(row.id),
    card_type: normalizeCardType(String(row.card_type ?? "")),
    is_alt_art: Number(row.is_alt_art),
    price_sgd: Number(row.price_sgd),
    quantity,
    is_available: quantity > 0 ? 1 : 0,
    is_featured: Number(row.is_featured),
    updated_at: String(row.updated_at ?? row.created_at),
  };
}

function ensureNoError(error: { message: string } | null, action: string) {
  if (error) {
    throw new Error(`Supabase ${action} failed: ${error.message}`);
  }
}

function sanitizeQueryTerm(value: string) {
  return value.replace(/[,%()]/g, " ").trim();
}

export async function getFeaturedCards(limit = 4): Promise<Card[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("is_featured", 1)
    .order("created_at", { ascending: false })
    .limit(limit);

  ensureNoError(error, "featured card fetch");
  return (data ?? []).map((row) => mapCard(row as Card));
}

export async function getNewestCards(limit = 4): Promise<Card[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  ensureNoError(error, "newest card fetch");
  return sortByLatestListed((data ?? []).map((row) => mapCard(row as Card)));
}

export async function getBrowsePreview(limit = 6): Promise<Card[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("is_available", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  ensureNoError(error, "browse preview fetch");
  return (data ?? []).map((row) => mapCard(row as Card));
}

export async function getNewArrivalCards(limit = 8): Promise<Card[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .gt("quantity", 0)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  ensureNoError(error, "new arrival fetch");
  return sortByLatestListed((data ?? []).map((row) => mapCard(row as Card)));
}

export async function getInventoryCount() {
  const supabase = createPublicClient();
  const { count, error } = await supabase.from("cards").select("id", { count: "exact", head: true });

  ensureNoError(error, "inventory count");
  return count ?? 0;
}

export async function getFilterOptions() {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("cards").select("set_code, card_type");

  ensureNoError(error, "filter option fetch");

  const dbSets = (data ?? []).map((row) => normalizeSetLabel(String(row.set_code)));
  const dbTypes = (data ?? []).map((row) => normalizeCardType(String(row.card_type ?? "")));
  const sets = [...new Set([...ALL_SET_OPTIONS, ...dbSets])];
  const types = [...new Set([...CARD_TYPE_OPTIONS, ...dbTypes])];

  return { rarities: [...RARITY_OPTIONS], sets, types };
}

export async function getCards(
  filters: CardFilters = {},
  page = 1,
  perPage = 20,
): Promise<PaginatedCardsResult> {
  const supabase = createPublicClient();
  const safePage = Math.max(1, page);
  const safePerPage = Math.max(1, perPage);
  const from = (safePage - 1) * safePerPage;
  const to = from + safePerPage - 1;

  let query = supabase.from("cards").select("*", { count: "exact" });

  if (filters.query) {
    const term = sanitizeQueryTerm(filters.query);

    if (term) {
      query = query.or(`card_name.ilike.%${term}%,card_code.ilike.%${term}%`);
    }
  }

  if (filters.rarity) {
    query = query.eq("rarity", filters.rarity);
  }

  if (filters.aa === "1") {
    query = query.eq("is_alt_art", 1);
  }

  if (filters.type) {
    query = query.eq("card_type", normalizeCardType(filters.type));
  }

  if (filters.set) {
    query = query.eq("set_code", normalizeSetLabel(filters.set));
  }

  if (filters.minPrice) {
    const minPrice = Number(filters.minPrice);
    if (Number.isFinite(minPrice)) {
      query = query.gte("price_sgd", minPrice);
    }
  }

  if (filters.maxPrice) {
    const maxPrice = Number(filters.maxPrice);
    if (Number.isFinite(maxPrice)) {
      query = query.lte("price_sgd", maxPrice);
    }
  }

  query = query.order("is_available", { ascending: false });

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price_sgd", { ascending: true }).order("created_at", { ascending: false });
      break;
    case "price_desc":
      query = query.order("price_sgd", { ascending: false }).order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false }).order("id", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);
  ensureNoError(error, "card fetch");

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / safePerPage));

  return {
    cards: (data ?? []).map((row) => mapCard(row as Card)),
    totalCount,
    totalPages,
    page: Math.min(safePage, totalPages),
    perPage: safePerPage,
  };
}

export async function getCardById(id: number): Promise<Card | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("cards").select("*").eq("id", id).maybeSingle();

  ensureNoError(error, "card fetch by id");
  return data ? mapCard(data as Card) : null;
}

export async function getRelatedCardsBySet(
  setCode: string | null | undefined,
  currentCardId: number,
  limit = 6,
): Promise<Card[]> {
  const normalizedSetCode = normalizeSetLabel(String(setCode ?? ""));

  if (!normalizedSetCode) {
    return [];
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("set_code", normalizedSetCode)
    .neq("id", currentCardId)
    .order("is_available", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  ensureNoError(error, "related card fetch");
  return sortByLatestListed((data ?? []).map((row) => mapCard(row as Card))).slice(0, limit);
}

export async function getAdminCards(): Promise<Card[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("cards").select("*").order("created_at", { ascending: false });

  ensureNoError(error, "admin card fetch");
  return (data ?? []).map((row) => mapCard(row as Card));
}

export async function getAdminCardsByQuery(queryTerm = ""): Promise<Card[]> {
  const supabase = createPublicClient();
  const term = sanitizeQueryTerm(queryTerm);

  let query = supabase.from("cards").select("*");

  if (term) {
    query = query.or(
      `card_name.ilike.%${term}%,card_code.ilike.%${term}%,set_code.ilike.%${term}%`,
    );
  }

  const { data, error } = await query
    .order("is_available", { ascending: false })
    .order("created_at", { ascending: false });

  ensureNoError(error, "admin card search");
  return (data ?? []).map((row) => mapCard(row as Card));
}
