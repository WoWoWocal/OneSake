export interface DeckCard {
  cardId: string;
  name: string;
  quantity: number;
  color?: string;
  type?: string;
  cost?: number | null;
  power?: number | null;
  counter?: number | null;
  attribute?: string;
  subTypes?: string;
  rarity?: string;
}

export interface Deck {
  id: string;
  name: string;
  leaderCardId: string;
  leaderName?: string;
  leaderColors?: string[];
  createdAt: string;
  updatedAt: string;
  cards: DeckCard[];
}
