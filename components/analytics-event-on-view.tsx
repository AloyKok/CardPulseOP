"use client";

import { useEffect, useMemo } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics-client";
import type { AnalyticsEventName } from "@/lib/analytics";

type AnalyticsEventOnViewProps = {
  eventName: AnalyticsEventName;
  cardId?: number | null;
  searchTerm?: string | null;
  metadata?: Record<string, unknown> | null;
};

export function AnalyticsEventOnView({
  eventName,
  cardId,
  searchTerm,
  metadata,
}: AnalyticsEventOnViewProps) {
  const metadataKey = useMemo(() => JSON.stringify(metadata ?? null), [metadata]);

  useEffect(() => {
    trackAnalyticsEvent({
      event_name: eventName,
      card_id: cardId ?? null,
      search_term: searchTerm ?? null,
      metadata,
    });
  }, [cardId, eventName, metadata, metadataKey, searchTerm]);

  return null;
}
