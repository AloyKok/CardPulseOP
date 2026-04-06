export const RARITY_OPTIONS = ["C", "U", "R", "SR", "SEC", "SP", "P"] as const;

export function formatRarityLabel(rarity: string, isAltArt: number | boolean) {
  return isAltArt ? `${rarity} ★` : rarity;
}
