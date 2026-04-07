"use client";

import {
  normalizeSearchTerm,
  sanitizeAnalyticsMetadata,
  type AnalyticsEventName,
  type AnalyticsEventPayload,
} from "@/lib/analytics";

const SESSION_STORAGE_KEY = "cardpulse-analytics-session:v1";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DEDUPE_WINDOW_MS = 900;

const recentEventMap = new Map<string, number>();

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `cp_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const now = Date.now();

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw) as { id?: string; expires_at?: number };

      if (parsed.id && parsed.expires_at && parsed.expires_at > now) {
        return parsed.id;
      }
    }
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  const nextSession = {
    id: createSessionId(),
    expires_at: now + SESSION_TTL_MS,
  };

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  return nextSession.id;
}

function getEventFingerprint(payload: Omit<AnalyticsEventPayload, "session_id">) {
  return JSON.stringify({
    event_name: payload.event_name,
    card_id: payload.card_id ?? null,
    search_term: normalizeSearchTerm(payload.search_term),
    metadata: sanitizeAnalyticsMetadata(payload.metadata),
  });
}

export function trackAnalyticsEvent(
  event: Omit<AnalyticsEventPayload, "session_id"> & { event_name: AnalyticsEventName },
) {
  if (typeof window === "undefined") {
    return;
  }

  const now = Date.now();
  const fingerprint = getEventFingerprint(event);
  const lastTrackedAt = recentEventMap.get(fingerprint) ?? 0;

  if (now - lastTrackedAt < DEDUPE_WINDOW_MS) {
    return;
  }

  recentEventMap.set(fingerprint, now);

  const payload: AnalyticsEventPayload = {
    event_name: event.event_name,
    card_id: typeof event.card_id === "number" ? event.card_id : null,
    session_id: getAnalyticsSessionId(),
    search_term: normalizeSearchTerm(event.search_term),
    metadata: sanitizeAnalyticsMetadata(event.metadata),
  };

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const beacon = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics", beacon);
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
