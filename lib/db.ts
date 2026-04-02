import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import { RARITY_OPTIONS } from "@/lib/rarities";
import { seedCards } from "@/lib/seed-data";
import { normalizeSetLabel } from "@/lib/sets";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "cardpulse.db");

type DatabaseInstance = Database.Database;

declare global {
  var __cardPulseDb: DatabaseInstance | undefined;
}

function initialize(db: DatabaseInstance) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_name TEXT NOT NULL,
      card_code TEXT NOT NULL,
      set_code TEXT NOT NULL,
      rarity TEXT NOT NULL,
      is_alt_art INTEGER NOT NULL DEFAULT 0,
      character TEXT NOT NULL,
      language TEXT NOT NULL,
      condition TEXT NOT NULL,
      price_sgd REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL,
      is_available INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const columns = db.prepare(`PRAGMA table_info(cards)`).all() as Array<{ name: string }>;
  const hasAltArtColumn = columns.some((column) => column.name === "is_alt_art");

  if (!hasAltArtColumn) {
    db.exec(`ALTER TABLE cards ADD COLUMN is_alt_art INTEGER NOT NULL DEFAULT 0`);
  }

  const rarityRows = db
    .prepare(`SELECT id, rarity, is_alt_art FROM cards`)
    .all() as Array<{ id: number; rarity: string; is_alt_art: number }>;

  if (rarityRows.length > 0) {
    const updateRarity = db.prepare(`UPDATE cards SET rarity = ?, is_alt_art = ? WHERE id = ?`);
    const normalizeRarity = db.transaction((rows: Array<{ id: number; rarity: string; is_alt_art: number }>) => {
      for (const row of rows) {
        let nextRarity = row.rarity.trim();
        let nextAltArt = row.is_alt_art;

        if (nextRarity === "AA") {
          nextRarity = "SP";
          nextAltArt = 1;
        }

        if (nextRarity === "UC") {
          nextRarity = "U";
        }

        if (!RARITY_OPTIONS.includes(nextRarity as (typeof RARITY_OPTIONS)[number])) {
          nextRarity = "R";
        }

        if (nextRarity !== row.rarity || nextAltArt !== row.is_alt_art) {
          updateRarity.run(nextRarity, nextAltArt, row.id);
        }
      }
    });

    normalizeRarity(rarityRows);
  }

  const existingSetRows = db
    .prepare(`SELECT id, set_code FROM cards`)
    .all() as Array<{ id: number; set_code: string }>;

  if (existingSetRows.length > 0) {
    const updateSet = db.prepare(`UPDATE cards SET set_code = ? WHERE id = ?`);
    const normalizeSets = db.transaction((rows: Array<{ id: number; set_code: string }>) => {
      for (const row of rows) {
        const normalized = normalizeSetLabel(row.set_code);
        if (normalized !== row.set_code) {
          updateSet.run(normalized, row.id);
        }
      }
    });

    normalizeSets(existingSetRows);
  }

  const total = db.prepare("SELECT COUNT(*) as count FROM cards").get() as { count: number };

  if (total.count === 0) {
    const insert = db.prepare(`
      INSERT INTO cards (
        card_name,
        card_code,
        set_code,
        rarity,
        is_alt_art,
        character,
        language,
        condition,
        price_sgd,
        quantity,
        image_url,
        is_available,
        is_featured,
        created_at
      ) VALUES (
        @card_name,
        @card_code,
        @set_code,
        @rarity,
        @is_alt_art,
        @character,
        @language,
        @condition,
        @price_sgd,
        @quantity,
        @image_url,
        @is_available,
        @is_featured,
        @created_at
      );
    `);

    const transaction = db.transaction(() => {
      for (const card of seedCards) {
        insert.run(card);
      }
    });

    transaction();
  }
}

export function getDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!global.__cardPulseDb) {
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initialize(db);
    global.__cardPulseDb = db;
  }

  return global.__cardPulseDb;
}

export { DB_PATH };
