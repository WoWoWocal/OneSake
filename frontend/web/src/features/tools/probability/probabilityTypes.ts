export interface ProbabilityDeckCard {
  cardId: string;
  name: string;
}

export interface ProbabilityPreset {
  name: string;
  handSize: number;
  minimumHits: number;
}

export interface ProbabilitySimulationInput {
  targetCardIds: string[];
  minimumHits: number;
  handSize: number;
  simulations: number;
  presetName?: string;
}

export interface ProbabilityResult {
  probabilityPercent: number;
  hits: number;
  simulations: number;
  targetCardIds: string[];
  minimumHits: number;
  handSize: number;
  presetName?: string;
}
