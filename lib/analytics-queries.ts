import {
  isMissingAnalyticsTableError,
  isMissingServiceRoleKeyError,
  type AnalyticsEventRow,
  type AnalyticsEventName,
} from "@/lib/analytics";
import { createAdminClient } from "@/utils/supabase/server";

type CardMetric = {
  card_id: number;
  card_name: string;
  card_code: string;
  count: number;
};

type SearchMetric = {
  term: string;
  count: number;
};

export type AnalyticsDashboard = {
  isConfigured: boolean;
  funnel: Record<AnalyticsEventName, number>;
  mostViewedCards: CardMetric[];
  mostClaimedCards: CardMetric[];
  topSearchTerms: SearchMetric[];
  totalEvents: number;
};

function ensureNoError(error: { message: string } | null, action: string) {
  if (error) {
    throw new Error(`Supabase ${action} failed: ${error.message}`);
  }
}

function createEmptyDashboard(isConfigured = true): AnalyticsDashboard {
  return {
    isConfigured,
    funnel: {
      browse_viewed: 0,
      search_performed: 0,
      filter_applied: 0,
      sort_changed: 0,
      product_viewed: 0,
      related_product_clicked: 0,
      add_to_cart: 0,
      claim_clicked: 0,
      telegram_checkout_clicked: 0,
    },
    mostViewedCards: [],
    mostClaimedCards: [],
    topSearchTerms: [],
    totalEvents: 0,
  };
}

function incrementCounter(map: Map<number, number>, id: number | null) {
  if (typeof id !== "number") {
    return;
  }

  map.set(id, (map.get(id) ?? 0) + 1);
}

function buildCardMetrics(
  counts: Map<number, number>,
  cardsById: Map<number, { card_name: string; card_code: string }>,
  limit = 5,
) {
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || right[0] - left[0])
    .slice(0, limit)
    .map(([cardId, count]) => ({
      card_id: cardId,
      card_name: cardsById.get(cardId)?.card_name ?? `Card #${cardId}`,
      card_code: cardsById.get(cardId)?.card_code ?? "Unknown",
      count,
    }));
}

export async function getAnalyticsDashboard(limit = 5): Promise<AnalyticsDashboard> {
  let supabase;

  try {
    supabase = createAdminClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (isMissingServiceRoleKeyError(message)) {
      return createEmptyDashboard(false);
    }

    throw error;
  }

  const { data, error } = await supabase
    .from("analytics_events")
    .select("id, event_name, card_id, session_id, search_term, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (isMissingAnalyticsTableError(error?.message)) {
    return createEmptyDashboard(false);
  }

  ensureNoError(error, "analytics fetch");

  const events = (data ?? []) as AnalyticsEventRow[];
  const dashboard = createEmptyDashboard(true);
  const funnel = dashboard.funnel;

  const viewedCounts = new Map<number, number>();
  const claimedCounts = new Map<number, number>();
  const searchCounts = new Map<string, number>();

  for (const event of events) {
    funnel[event.event_name] += 1;

    if (event.event_name === "product_viewed") {
      incrementCounter(viewedCounts, event.card_id);
    }

    if (event.event_name === "claim_clicked") {
      incrementCounter(claimedCounts, event.card_id);
    }

    if (event.event_name === "search_performed" && event.search_term) {
      searchCounts.set(event.search_term, (searchCounts.get(event.search_term) ?? 0) + 1);
    }
  }

  const cardIds = [...new Set([...viewedCounts.keys(), ...claimedCounts.keys()])];
  const cardsById = new Map<number, { card_name: string; card_code: string }>();

  if (cardIds.length > 0) {
    const { data: cards, error: cardsError } = await supabase
      .from("cards")
      .select("id, card_name, card_code")
      .in("id", cardIds);

    ensureNoError(cardsError, "analytics card fetch");

    for (const card of cards ?? []) {
      cardsById.set(Number(card.id), {
        card_name: String(card.card_name),
        card_code: String(card.card_code),
      });
    }
  }

  const topSearchTerms = [...searchCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([term, count]) => ({ term, count }));

  return {
    isConfigured: true,
    funnel,
    mostViewedCards: buildCardMetrics(viewedCounts, cardsById, limit),
    mostClaimedCards: buildCardMetrics(claimedCounts, cardsById, limit),
    topSearchTerms,
    totalEvents: events.length,
  };
}
