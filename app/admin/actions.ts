"use server";

import { revalidatePath } from "next/cache";

import { executeAdminCommand } from "@/lib/admin-commands";
import { CARD_TYPE_OPTIONS, normalizeCardType } from "@/lib/card-types";
import { RARITY_OPTIONS } from "@/lib/rarities";
import { normalizeSetLabel } from "@/lib/sets";
import type { Card } from "@/lib/types";
import { toBoolean } from "@/lib/utils";
import { createAdminClient } from "@/utils/supabase/server";

const CARD_IMAGE_BUCKET = "card-images";

async function saveUploadedFile(file: File) {
  const supabase = createAdminClient();

  const { error: bucketError } = await supabase.storage.createBucket(CARD_IMAGE_BUCKET, {
    public: true,
    allowedMimeTypes: ["image/*"],
    fileSizeLimit: "10MB",
  });

  if (bucketError && !bucketError.message.toLowerCase().includes("already")) {
    throw new Error(`Supabase storage bucket setup failed: ${bucketError.message}`);
  }

  const extension = file.name.split(".").pop() || "jpg";
  const safeName = `cards/${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  const contentType = file.type || "image/jpeg";

  const { error: uploadError } = await supabase.storage
    .from(CARD_IMAGE_BUCKET)
    .upload(safeName, Buffer.from(bytes), {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Supabase image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(CARD_IMAGE_BUCKET).getPublicUrl(safeName);
  return data.publicUrl;
}

function normalizeNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

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

export type UpsertCardActionResult = {
  card: Card;
  mode: "created" | "updated";
};

export async function upsertCardAction(formData: FormData): Promise<UpsertCardActionResult> {
  const supabase = createAdminClient();
  const id = formData.get("id");
  const upload = formData.get("image_file");
  const currentImageUrl = String(formData.get("current_image_url") || "");
  let imageUrl = currentImageUrl;

  if (upload instanceof File && upload.size > 0) {
    imageUrl = await saveUploadedFile(upload);
  }

  if (!imageUrl) {
    throw new Error("Image upload is required.");
  }

  const quantity = normalizeNumber(formData.get("quantity"));
  const isAvailable = quantity > 0 ? 1 : 0;
  const isFeatured = toBoolean(formData.get("is_featured")) ? 1 : 0;
  const rarityInput = String(formData.get("rarity") || "").trim();
  const rarity = RARITY_OPTIONS.includes(rarityInput as (typeof RARITY_OPTIONS)[number])
    ? rarityInput
    : "R";
  const cardTypeInput = String(formData.get("card_type") || "").trim();
  const cardType = CARD_TYPE_OPTIONS.includes(cardTypeInput as (typeof CARD_TYPE_OPTIONS)[number])
    ? cardTypeInput
    : normalizeCardType(cardTypeInput);
  const isAltArt = toBoolean(formData.get("is_alt_art")) ? 1 : 0;

  const payload = {
    card_name: String(formData.get("card_name") || "").trim(),
    card_code: String(formData.get("card_code") || "").trim(),
    set_code: normalizeSetLabel(String(formData.get("set_code") || "").trim()),
    card_type: cardType,
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
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { data, error } = await supabase
      .from("cards")
      .update(payload)
      .eq("id", Number(id))
      .select("*")
      .single();

    if (error) {
      throw new Error(`Supabase card update failed: ${error.message}`);
    }

    revalidatePath("/");
    revalidatePath("/browse");
    revalidatePath("/admin");
    revalidatePath("/cart");

    return { card: mapCard(data as Card), mode: "updated" };
  } else {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("cards")
      .insert({
        ...payload,
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Supabase card insert failed: ${error.message}`);
    }

    revalidatePath("/");
    revalidatePath("/browse");
    revalidatePath("/admin");
    revalidatePath("/cart");

    return { card: mapCard(data as Card), mode: "created" };
  }
}

export type AdminCommandActionState = {
  nonce: number;
  command: string;
  ok: boolean;
  lines: string[];
};

export async function executeAdminCommandAction(
  _previousState: AdminCommandActionState,
  formData: FormData,
): Promise<AdminCommandActionState> {
  const command = String(formData.get("command") || "").trim();
  const result = await executeAdminCommand(command);

  revalidatePath("/admin");
  revalidatePath("/browse");
  revalidatePath("/cards/[id]");

  return {
    nonce: Date.now(),
    command,
    ok: result.ok,
    lines: result.lines,
  };
}

export async function deleteCardAction(formData: FormData): Promise<{ id: number }> {
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

  return { id };
}
