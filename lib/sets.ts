export const SET_GROUPS = [
  {
    label: "Main Sets",
    options: [
      "[OP-01] Romance Dawn",
      "[OP-02] Paramount War",
      "[OP-03] Pillars of Strength",
      "[OP-04] Kingdoms of Intrigue",
      "[OP-05] Awakening of the New Era",
      "[OP-06] Wings of the Captain",
      "[OP-07] 500 Years in the Future",
      "[OP-08] Two Legends",
      "[OP-09] Emperors in the New World",
      "[OP-10] Royal Blood",
      "[OP-11] A Fist of Divine Speed",
      "[OP12] Legacy of the Master",
      "[OP13] Carrying on His Will",
      "[OP14] The Azure Sea's Seven",
      "[OP-15] Adventure on Kami's Island",
    ],
  },
  {
    label: "Extra Booster Packs",
    options: [
      "[EB-01] Memorial Collection",
      "[EB-02] Anime 25th Collection",
      "[EB-03] Heroines Edition",
      "[EB-04] EGGHEAD CRISIS",
    ],
  },
  {
    label: "Premium Boosters & Special Sets",
    options: [
      "[PRB-01] ONE PIECE CARD THE BEST",
      "[PRB-02] ONE PIECE CARD THE BEST Vol.2",
      "Starter Decks",
      "Japanese 1st Anniversary Set",
      "Kumamoto Memorial Set (Special Promo)",
    ],
  },
] as const;

export const ALL_SET_OPTIONS = SET_GROUPS.flatMap((group) => group.options);

const setAliases = new Map<string, string>([
  ["Romance Dawn", "[OP-01] Romance Dawn"],
  ["Paramount War", "[OP-02] Paramount War"],
  ["Pillars of Strength", "[OP-03] Pillars of Strength"],
  ["Kingdoms of Intrigue", "[OP-04] Kingdoms of Intrigue"],
  ["Awakening of the New Era", "[OP-05] Awakening of the New Era"],
  ["Wings of the Captain", "[OP-06] Wings of the Captain"],
  ["500 Years in the Future", "[OP-07] 500 Years in the Future"],
  ["Two Legends", "[OP-08] Two Legends"],
  ["Emperors in the New World", "[OP-09] Emperors in the New World"],
  ["Royal Blood", "[OP-10] Royal Blood"],
  ["A Fist of Divine Speed", "[OP-11] A Fist of Divine Speed"],
  ["Legacy of the Master", "[OP12] Legacy of the Master"],
  ["Carrying on His Will", "[OP13] Carrying on His Will"],
  ["The Azure Sea's Seven", "[OP14] The Azure Sea's Seven"],
  ["Adventure on Kami's Island", "[OP-15] Adventure on Kami's Island"],
  ["Memorial Collection", "[EB-01] Memorial Collection"],
  ["Anime 25th Collection", "[EB-02] Anime 25th Collection"],
  ["Heroines Edition", "[EB-03] Heroines Edition"],
  ["EGGHEAD CRISIS", "[EB-04] EGGHEAD CRISIS"],
  ["ONE PIECE CARD THE BEST", "[PRB-01] ONE PIECE CARD THE BEST"],
  ["ONE PIECE CARD THE BEST Vol.2", "[PRB-02] ONE PIECE CARD THE BEST Vol.2"],
  ["Starter Decks", "Starter Decks"],
]);

for (const option of ALL_SET_OPTIONS) {
  setAliases.set(option, option);
}

export function normalizeSetLabel(value: string) {
  return setAliases.get(value.trim()) ?? value.trim();
}
