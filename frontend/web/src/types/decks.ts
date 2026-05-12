export interface DeckCard {
  cardId: string;
  name: string;
  quantity: number;
}

export interface Deck {
  id: string;
  name: string;
  leaderCardId: string;
  createdAt: string;
  updatedAt: string;
  cards: DeckCard[];
}
