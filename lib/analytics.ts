export const ANALYTICS_EVENT_NAMES = [
  "browse_viewed",
  "search_performed",
  "filter_applied",
  "sort_changed",
  "product_viewed",
  "related_product_clicked",
  "add_to_cart",
  "claim_clicked",
  "telegram_checkout_clicked",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export type AnalyticsEventPayload = {
  event_name: AnalyticsEventName;
  card_id?: number | null;
  session_id: string;
  search_term?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AnalyticsEventRow = {
  id: number;
  event_name: AnalyticsEventName;
  card_id: number | null;
  session_id: string;
  search_term: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENT_NAMES as readonly string[]).includes(value);
}

export function normalizeSearchTerm(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().slice(0, 120);
  return normalized ? normalized : null;
}

export function sanitizeAnalyticsMetadata(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  try {
    const parsed = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function isMissingAnalyticsTableError(message: string | null | undefined) {
  if (!message) {
    return false;
  }

  return message.includes("public.analytics_events");
}

export function isMissingServiceRoleKeyError(message: string | null | undefined) {
  if (!message) {
    return false;
  }

  return message.includes("SUPABASE_SERVICE_ROLE_KEY");
}
