"use server";

import { revalidatePath } from "next/cache";

import { CARD_TYPE_OPTIONS, normalizeCardType } from "@/lib/card-types";
import { RARITY_OPTIONS } from "@/lib/rarities";
import { normalizeSetLabel } from "@/lib/sets";
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

export async function upsertCardAction(formData: FormData) {
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
