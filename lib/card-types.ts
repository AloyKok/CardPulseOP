export const CARD_TYPE_OPTIONS = ["Character", "Leader", "Event", "Stage", "Don"] as const;

export function normalizeCardType(value: string) {
  const normalized = value.trim().toLowerCase();

  return (
    CARD_TYPE_OPTIONS.find((option) => option.toLowerCase() === normalized) ?? CARD_TYPE_OPTIONS[0]
  );
}
