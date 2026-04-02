export type Card = {
  id: number;
  card_name: string;
  card_code: string;
  set_code: string;
  rarity: string;
  is_alt_art: number;
  character: string;
  language: string;
  condition: string;
  price_sgd: number;
  quantity: number;
  image_url: string;
  is_available: number;
  is_featured: number;
  created_at: string;
};

export type CardFilters = {
  query?: string;
  rarity?: string;
  set?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

export type CartItem = {
  id: number;
  card_name: string;
  card_code: string;
  set_code: string;
  rarity: string;
  is_alt_art: number;
  price_sgd: number;
  image_url: string;
  available_quantity: number;
  selected_quantity: number;
};

export type CartCardInput = Omit<CartItem, "selected_quantity">;
