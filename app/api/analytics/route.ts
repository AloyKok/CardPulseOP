import { NextResponse } from "next/server";

import {
  isAnalyticsEventName,
  isMissingAnalyticsTableError,
  isMissingServiceRoleKeyError,
  normalizeSearchTerm,
  sanitizeAnalyticsMetadata,
  type AnalyticsEventPayload,
} from "@/lib/analytics";
import { createAdminClient } from "@/utils/supabase/server";

const ANALYTICS_DEDUPE_WINDOW_MS = 1500;
const recentAnalyticsRequests = new Map<string, number>();

function isAllowedOrigin(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  if (originHeader) {
    return originHeader === requestOrigin;
  }

  if (refererHeader) {
    return refererHeader.startsWith(requestOrigin);
  }

  return false;
}

function getRequestFingerprint(payload: Partial<AnalyticsEventPayload>) {
  return JSON.stringify({
    event_name: payload.event_name,
    card_id: typeof payload.card_id === "number" ? payload.card_id : null,
    session_id: typeof payload.session_id === "string" ? payload.session_id.trim().slice(0, 120) : "",
    search_term: normalizeSearchTerm(payload.search_term),
    metadata: sanitizeAnalyticsMetadata(payload.metadata),
  });
}

function isDuplicateAnalyticsRequest(payload: Partial<AnalyticsEventPayload>) {
  const now = Date.now();
  const fingerprint = getRequestFingerprint(payload);
  const previous = recentAnalyticsRequests.get(fingerprint) ?? 0;

  for (const [key, value] of recentAnalyticsRequests) {
    if (now - value > ANALYTICS_DEDUPE_WINDOW_MS * 4) {
      recentAnalyticsRequests.delete(key);
    }
  }

  if (now - previous < ANALYTICS_DEDUPE_WINDOW_MS) {
    return true;
  }

  recentAnalyticsRequests.set(fingerprint, now);
  return false;
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let payload: Partial<AnalyticsEventPayload> | null = null;

  try {
    payload = (await request.json()) as Partial<AnalyticsEventPayload>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!payload?.event_name || !isAnalyticsEventName(payload.event_name)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const sessionId = typeof payload.session_id === "string" ? payload.session_id.trim().slice(0, 120) : "";

  if (!sessionId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (isDuplicateAnalyticsRequest(payload)) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  let supabase;

  try {
    supabase = createAdminClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (isMissingServiceRoleKeyError(message)) {
      return NextResponse.json({ ok: false, setupRequired: true }, { status: 202 });
    }

    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const { error } = await supabase.from("analytics_events").insert({
    event_name: payload.event_name,
    card_id: typeof payload.card_id === "number" ? payload.card_id : null,
    session_id: sessionId,
    search_term: normalizeSearchTerm(payload.search_term),
    metadata: sanitizeAnalyticsMetadata(payload.metadata),
  });

  if (error) {
    if (isMissingAnalyticsTableError(error.message)) {
      return NextResponse.json({ ok: false, setupRequired: true }, { status: 202 });
    }

    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
