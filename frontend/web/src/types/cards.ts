export interface CardDto {
  inventory_price: number | null;
  market_price: number | null;
  card_name: string;
  set_name: string;
  card_text: string;
  set_id: string;
  rarity: string;
  card_set_id: string;
  card_color: string;
  card_type: string;
  life: number | null;
  card_cost: number | null;
  card_power: number | null;
  sub_types: string;
  counter_amount: number | null;
  attribute: string;
  date_scraped: string;
  card_image_id: string;
  card_image: string;
}
