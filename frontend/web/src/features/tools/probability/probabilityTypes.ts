export interface ProbabilityDeckCard {
  cardId: string;
  name: string;
}

export interface ProbabilitySimulationInput {
  targetCardId: string;
  minimumHits: number;
  handSize: number;
  simulations: number;
}

export interface ProbabilityResult {
  probabilityPercent: number;
  hits: number;
  simulations: number;
  targetCardId: string;
  minimumHits: number;
  handSize: number;
}
