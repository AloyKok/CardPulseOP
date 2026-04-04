"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import { RARITY_OPTIONS } from "@/lib/rarities";
import { normalizeSetLabel } from "@/lib/sets";
import { toBoolean } from "@/lib/utils";
import { createAdminClient } from "@/utils/supabase/server";

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
  const supabase = createAdminClient();
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
    const { error } = await supabase
      .from("cards")
      .update(payload)
      .eq("id", Number(id));

    if (error) {
      throw new Error(`Supabase card update failed: ${error.message}`);
    }
  } else {
    const { error } = await supabase.from("cards").insert({
      ...payload,
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Supabase card insert failed: ${error.message}`);
    }
  }

  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/admin");
  revalidatePath("/cart");
}

export async function deleteCardAction(formData: FormData) {
  const supabase = createAdminClient();
  const id = Number(formData.get("id"));

  const { error } = await supabase.from("cards").delete().eq("id", id);

  if (error) {
    throw new Error(`Supabase card delete failed: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/admin");
  revalidatePath("/cart");
}
