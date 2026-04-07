const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_MS = 72 * 60 * 60 * 1000;

export type FreshnessLabel = "New today" | "New" | null;

export function parseListedDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getFreshnessLabel(value: string | null | undefined, now = Date.now()): FreshnessLabel {
  const listedDate = parseListedDate(value);

  if (!listedDate) {
    return null;
  }

  const ageMs = now - listedDate.getTime();

  if (ageMs < 0) {
    return null;
  }

  if (ageMs <= ONE_DAY_MS) {
    return "New today";
  }

  if (ageMs <= THREE_DAYS_MS) {
    return "New";
  }

  return null;
}

export function getFreshnessContext(value: string | null | undefined) {
  const label = getFreshnessLabel(value);

  if (label === "New today") {
    return "Listed today";
  }

  if (label === "New") {
    return "Listed recently";
  }

  return null;
}

export function sortByLatestListed<T extends { created_at: string; id: number }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftTime = parseListedDate(left.created_at)?.getTime() ?? 0;
    const rightTime = parseListedDate(right.created_at)?.getTime() ?? 0;

    if (leftTime === rightTime) {
      return right.id - left.id;
    }

    return rightTime - leftTime;
  });
}
