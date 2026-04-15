import { formatDateTime } from "@/lib/utils";
import type { Card } from "@/lib/types";
import { createAdminClient } from "@/utils/supabase/server";

const STALE_DAYS = 7;
const STALE_MS = STALE_DAYS * 24 * 60 * 60 * 1000;

type QuantitySetCommand = {
  type: "set";
  code: string;
  quantity: number;
};

type CheckCardCommand = {
  type: "check-card";
  code: string;
};

type CheckUpdatesCommand = {
  type: "check-updates";
};

export type ParsedAdminCommand =
  | QuantitySetCommand
  | CheckCardCommand
  | CheckUpdatesCommand;

export type CommandExecutionResult = {
  ok: boolean;
  lines: string[];
};

function mapCard(row: Card): Card {
  const quantity = Number(row.quantity);

  return {
    ...row,
    id: Number(row.id),
    is_alt_art: Number(row.is_alt_art),
    price_sgd: Number(row.price_sgd),
    quantity,
    is_available: quantity > 0 ? 1 : 0,
    is_featured: Number(row.is_featured),
    updated_at: String(row.updated_at ?? row.created_at),
  };
}

function createErrorResult(message: string): CommandExecutionResult {
  return { ok: false, lines: [message] };
}

function formatAvailability(quantity: number) {
  return quantity > 0 ? "Available" : "Sold Out";
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function parseTimestamp(value: string | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getCardLastTouchedMs(card: Card) {
  const createdAt = parseTimestamp(card.created_at);
  const updatedAt = parseTimestamp(card.updated_at);

  if (createdAt === null && updatedAt === null) {
    return Date.now();
  }

  if (createdAt === null) {
    return updatedAt as number;
  }

  if (updatedAt === null) {
    return createdAt;
  }

  return Math.max(createdAt, updatedAt);
}

function getCardLastTouchedLabel(card: Card) {
  const lastTouchedMs = getCardLastTouchedMs(card);
  return formatDateTime(new Date(lastTouchedMs).toISOString());
}

export function parseAdminCommand(input: string): ParsedAdminCommand {
  const value = input.trim();

  if (!value) {
    throw new Error("Type a command first.");
  }

  if (/^check\s+updates$/i.test(value)) {
    return { type: "check-updates" };
  }

  const quantityMatch = value.match(/^([A-Z0-9-]+)\s+(\d+)$/i);

  if (quantityMatch) {
    const code = normalizeCode(quantityMatch[1]);
    const quantityToken = quantityMatch[2];
    const numericValue = Number(quantityToken);

    if (!Number.isInteger(numericValue)) {
      throw new Error("Quantity commands must use whole numbers.");
    }

    if (numericValue < 0) {
      throw new Error("Set quantity commands must not use negative stock.");
    }

    return { type: "set", code, quantity: numericValue };
  }

  const cardCodeMatch = value.match(/^([A-Z0-9-]+)$/i);

  if (cardCodeMatch) {
    return { type: "check-card", code: normalizeCode(cardCodeMatch[1]) };
  }

  throw new Error('Use "CODE" or "CODE 24", for example EB01-051 or EB01-051 24.');
}

async function findCardsByCode(code: string): Promise<Card[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .ilike("card_code", code)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Command lookup failed: ${error.message}`);
  }

  return (data ?? []).map((row) => mapCard(row as Card));
}

function resolveSingleCard(cards: Card[], code: string): Card | CommandExecutionResult {
  if (cards.length === 0) {
    return createErrorResult(`No card found for code ${code}.`);
  }

  if (cards.length > 1) {
    return createErrorResult(
      `Multiple cards match ${code}: ${cards
        .map((card) => `${card.card_name} (${card.card_code})`)
        .join(", ")}.`,
    );
  }

  return cards[0];
}

async function updateCardQuantity(card: Card, nextQuantity: number): Promise<Card> {
  const supabase = createAdminClient();
  const updatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("cards")
    .update({
      quantity: nextQuantity,
      is_available: nextQuantity > 0 ? 1 : 0,
      updated_at: updatedAt,
    })
    .eq("id", card.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Quantity update failed: ${error.message}`);
  }

  return mapCard(data as Card);
}

async function executeCheckUpdatesCommand(): Promise<CommandExecutionResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("updated_at", { ascending: true })
    .limit(500);

  if (error) {
    throw new Error(`Stale inventory check failed: ${error.message}`);
  }

  const now = Date.now();
  const cutoffMs = now - STALE_MS;
  const cards = (data ?? [])
    .map((row) => mapCard(row as Card))
    .map((card) => ({
      card,
      lastTouchedMs: getCardLastTouchedMs(card),
    }))
    .filter(({ lastTouchedMs }) => lastTouchedMs < cutoffMs)
    .sort((a, b) => a.lastTouchedMs - b.lastTouchedMs)
    .slice(0, 25);

  if (cards.length === 0) {
    return { ok: true, lines: [`No cards are older than ${STALE_DAYS} days.`] };
  }

  return {
    ok: true,
    lines: [
      `Found ${cards.length} cards older than ${STALE_DAYS} days:`,
      ...cards.map(({ card, lastTouchedMs }) => {
        const days = Math.max(1, Math.floor((now - lastTouchedMs) / (24 * 60 * 60 * 1000)));
        return `${card.card_code} · ${card.card_name} · ${days} day${days === 1 ? "" : "s"} since listed/updated`;
      }),
    ],
  };
}

async function executeCheckCardCommand(command: CheckCardCommand): Promise<CommandExecutionResult> {
  const cardOrError = resolveSingleCard(await findCardsByCode(command.code), command.code);

  if ("ok" in cardOrError) {
    return cardOrError;
  }

  const card = cardOrError;

  return {
    ok: true,
    lines: [
      `${card.card_name} (${card.card_code})`,
      `Quantity: ${card.quantity}`,
      `Availability: ${formatAvailability(card.quantity)}`,
      `Last listed/updated: ${getCardLastTouchedLabel(card)}`,
    ],
  };
}

async function executeQuantityCommand(command: QuantitySetCommand): Promise<CommandExecutionResult> {
  const cardOrError = resolveSingleCard(await findCardsByCode(command.code), command.code);

  if ("ok" in cardOrError) {
    return cardOrError;
  }

  const card = cardOrError;
  const nextQuantity = command.quantity;

  if (nextQuantity < 0) {
    return createErrorResult(
      `Cannot reduce ${card.card_code} below 0. Current quantity is ${card.quantity}.`,
    );
  }

  const updatedCard = await updateCardQuantity(card, nextQuantity);

  return {
    ok: true,
    lines: [
      `${updatedCard.card_name} (${updatedCard.card_code}) updated.`,
      `Quantity: ${card.quantity} → ${updatedCard.quantity}`,
      `Availability: ${formatAvailability(updatedCard.quantity)}`,
      `Updated: ${formatDateTime(updatedCard.updated_at)}`,
    ],
  };
}

export async function executeAdminCommand(input: string): Promise<CommandExecutionResult> {
  let command: ParsedAdminCommand;

  try {
    command = parseAdminCommand(input);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error.message : "Invalid command.");
  }

  try {
    switch (command.type) {
      case "check-updates":
        return await executeCheckUpdatesCommand();
      case "check-card":
        return await executeCheckCardCommand(command);
      case "set":
        return await executeQuantityCommand(command);
      default:
        return createErrorResult("Unsupported command.");
    }
  } catch (error) {
    return createErrorResult(error instanceof Error ? error.message : "Command failed.");
  }
}
