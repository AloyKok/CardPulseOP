import { getDb } from "@/lib/db";
import { RARITY_OPTIONS } from "@/lib/rarities";
import { ALL_SET_OPTIONS, normalizeSetLabel } from "@/lib/sets";
import type { Card, CardFilters } from "@/lib/types";

function mapCard(row: Card) {
  return row;
}

export function getFeaturedCards(limit = 4): Card[] {
  const db = getDb();
  return db
    .prepare(
      `
      SELECT *
      FROM cards
      WHERE is_featured = 1
      ORDER BY datetime(created_at) DESC
      LIMIT ?
    `,
    )
    .all(limit)
    .map((row) => mapCard(row as Card));
}

export function getNewestCards(limit = 4): Card[] {
  const db = getDb();
  return db
    .prepare(
      `
      SELECT *
      FROM cards
      ORDER BY datetime(created_at) DESC
      LIMIT ?
    `,
    )
    .all(limit)
    .map((row) => mapCard(row as Card));
}

export function getBrowsePreview(limit = 6): Card[] {
  const db = getDb();
  return db
    .prepare(
      `
      SELECT *
      FROM cards
      ORDER BY is_available DESC, datetime(created_at) DESC
      LIMIT ?
    `,
    )
    .all(limit)
    .map((row) => mapCard(row as Card));
}

export function getInventoryCount() {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(*) as count FROM cards`).get() as { count: number };
  return row.count;
}

export function getFilterOptions() {
  const db = getDb();

  const rarities = [...RARITY_OPTIONS];

  const dbSets = db
    .prepare(`SELECT DISTINCT set_code FROM cards ORDER BY set_code ASC`)
    .all()
    .map((row) => normalizeSetLabel(String((row as { set_code: string }).set_code)));

  const sets = [...new Set([...ALL_SET_OPTIONS, ...dbSets])];

  return { rarities, sets };
}

export function getCards(filters: CardFilters = {}): Card[] {
  const db = getDb();
  const conditions: string[] = [];
  const values: Array<string | number> = [];
  let orderBy = "is_available DESC, datetime(created_at) DESC";

  if (filters.query) {
    conditions.push("(LOWER(card_name) LIKE ? OR LOWER(card_code) LIKE ?)");
    const term = `%${filters.query.toLowerCase()}%`;
    values.push(term, term);
  }

  if (filters.rarity) {
    conditions.push("rarity = ?");
    values.push(filters.rarity);
  }

  if (filters.set) {
    conditions.push("set_code = ?");
    values.push(normalizeSetLabel(filters.set));
  }

  if (filters.minPrice) {
    conditions.push("price_sgd >= ?");
    values.push(Number(filters.minPrice));
  }

  if (filters.maxPrice) {
    conditions.push("price_sgd <= ?");
    values.push(Number(filters.maxPrice));
  }

  switch (filters.sort) {
    case "price_asc":
      orderBy = "is_available DESC, price_sgd ASC, datetime(created_at) DESC";
      break;
    case "price_desc":
      orderBy = "is_available DESC, price_sgd DESC, datetime(created_at) DESC";
      break;
    case "name_asc":
      orderBy = "is_available DESC, card_name COLLATE NOCASE ASC";
      break;
    default:
      orderBy = "is_available DESC, datetime(created_at) DESC";
      break;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return db
    .prepare(
      `
      SELECT *
      FROM cards
      ${whereClause}
      ORDER BY ${orderBy}
    `,
    )
    .all(...values)
    .map((row) => mapCard(row as Card));
}

export function getCardById(id: number): Card | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM cards WHERE id = ?`).get(id) as Card | undefined;
  return row ? mapCard(row) : null;
}

export function getAdminCards(): Card[] {
  const db = getDb();
  return db
    .prepare(
      `
      SELECT *
      FROM cards
      ORDER BY datetime(created_at) DESC
    `,
    )
    .all()
    .map((row) => mapCard(row as Card));
}
