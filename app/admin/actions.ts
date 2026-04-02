"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import { getDb } from "@/lib/db";
import { RARITY_OPTIONS } from "@/lib/rarities";
import { normalizeSetLabel } from "@/lib/sets";
import { toBoolean } from "@/lib/utils";

async function saveUploadedFile(file: File) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const extension = file.name.split(".").pop() || "jpg";
  const safeName = `${crypto.randomUUID()}.${extension}`;
  const destination = path.join(uploadDir, safeName);
  const bytes = await file.arrayBuffer();

  await fs.writeFile(destination, Buffer.from(bytes));

  return `/uploads/${safeName}`;
}

function normalizeNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function upsertCardAction(formData: FormData) {
  const db = getDb();
  const id = formData.get("id");
  const upload = formData.get("image_file");
  const currentImageUrl = String(formData.get("current_image_url") || "");
  const imageUrlInput = String(formData.get("image_url") || "").trim();

  let imageUrl = imageUrlInput || currentImageUrl;

  if (upload instanceof File && upload.size > 0) {
    imageUrl = await saveUploadedFile(upload);
  }

  if (!imageUrl) {
    throw new Error("Image URL or upload is required.");
  }

  const quantity = normalizeNumber(formData.get("quantity"));
  const requestedAvailability = toBoolean(formData.get("is_available"));
  const isAvailable = requestedAvailability && quantity > 0 ? 1 : 0;
  const isFeatured = toBoolean(formData.get("is_featured")) ? 1 : 0;
  const rarityInput = String(formData.get("rarity") || "").trim();
  const rarity = RARITY_OPTIONS.includes(rarityInput as (typeof RARITY_OPTIONS)[number])
    ? rarityInput
    : "R";
  const isAltArt = toBoolean(formData.get("is_alt_art")) ? 1 : 0;

  const payload = {
    card_name: String(formData.get("card_name") || "").trim(),
    card_code: String(formData.get("card_code") || "").trim(),
    set_code: normalizeSetLabel(String(formData.get("set_code") || "").trim()),
    rarity,
    is_alt_art: isAltArt,
    character: String(formData.get("character") || "").trim(),
    language: String(formData.get("language") || "").trim(),
    condition: String(formData.get("condition") || "").trim(),
    price_sgd: normalizeNumber(formData.get("price_sgd")),
    quantity,
    image_url: imageUrl,
    is_available: isAvailable,
    is_featured: isFeatured,
  };

  if (id) {
    db.prepare(
      `
      UPDATE cards
      SET
        card_name = @card_name,
        card_code = @card_code,
        set_code = @set_code,
        rarity = @rarity,
        is_alt_art = @is_alt_art,
        character = @character,
        language = @language,
        condition = @condition,
        price_sgd = @price_sgd,
        quantity = @quantity,
        image_url = @image_url,
        is_available = @is_available,
        is_featured = @is_featured
      WHERE id = @id
    `,
    ).run({ ...payload, id: Number(id) });
  } else {
    db.prepare(
      `
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
      )
    `,
    ).run({ ...payload, created_at: new Date().toISOString() });
  }

  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/admin");
}

export async function deleteCardAction(formData: FormData) {
  const db = getDb();
  const id = Number(formData.get("id"));

  db.prepare(`DELETE FROM cards WHERE id = ?`).run(id);

  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/admin");
}
