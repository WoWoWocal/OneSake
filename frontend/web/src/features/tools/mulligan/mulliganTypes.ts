export interface MulliganDeckCard {
  cardId: string;
  name: string;
}

export interface MulliganHandCard {
  cardId: string;
  name: string;
  quantity: number;
}

export interface MulliganHandMetrics {
  cardCount: number;
  uniqueCardIds: number;
  cardsWithQuantity: MulliganHandCard[];
}

export interface MulliganDrawResult {
  hand: MulliganHandCard[];
  metrics: MulliganHandMetrics;
  error: string;
}

export interface MulliganSessionStats {
  handsDrawn: number;
  keeps: number;
  mulligans: number;
}
