export interface MulliganDeckCard {
  cardId: string;
  name: string;
  color?: string;
  type?: string;
  cost?: number | null;
  counter?: number | null;
}

export interface MulliganHandCard {
  cardId: string;
  name: string;
  quantity: number;
  color?: string;
  type?: string;
  cost?: number | null;
  counter?: number | null;
}

export interface MulliganHandMetrics {
  cardCount: number;
  uniqueCardIds: number;
  cardsWithQuantity: MulliganHandCard[];
  counter2000Count: number;
  eventCount: number;
  lowCostCount: number;
  characterCount: number;
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
