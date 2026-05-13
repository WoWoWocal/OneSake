import type { Deck } from '../../../types/decks';
import type {
  ProbabilityDeckCard,
  ProbabilityResult,
  ProbabilitySimulationInput,
} from './probabilityTypes';

const maxSimulations = 100000;

export function buildProbabilityDeck(deck: Deck): ProbabilityDeckCard[] {
  return deck.cards.flatMap((card) =>
    Array.from({ length: Math.max(0, card.quantity) }, () => ({
      cardId: card.cardId,
      name: card.name,
    })),
  );
}

function normalizeInput(input: ProbabilitySimulationInput): ProbabilitySimulationInput {
  const targetCardIds = [...new Set(input.targetCardIds.map((cardId) => cardId.trim()))].filter(
    Boolean,
  );

  return {
    targetCardIds,
    minimumHits: Math.max(1, Math.floor(input.minimumHits || 1)),
    handSize: Math.max(1, Math.floor(input.handSize || 5)),
    simulations: Math.min(maxSimulations, Math.max(1, Math.floor(input.simulations || 10000))),
    presetName: input.presetName,
  };
}

function drawHand(cards: ProbabilityDeckCard[], handSize: number): ProbabilityDeckCard[] {
  const availableCards = [...cards];
  const hand: ProbabilityDeckCard[] = [];
  const cardsToDraw = Math.min(handSize, availableCards.length);

  for (let index = 0; index < cardsToDraw; index += 1) {
    const drawIndex = Math.floor(Math.random() * availableCards.length);
    const [drawnCard] = availableCards.splice(drawIndex, 1);
    hand.push(drawnCard);
  }

  return hand;
}

export function runProbabilitySimulation(
  deck: Deck,
  input: ProbabilitySimulationInput,
): ProbabilityResult {
  const normalizedInput = normalizeInput(input);
  const flatDeck = buildProbabilityDeck(deck);
  const targetCardIds = new Set(normalizedInput.targetCardIds);
  let hits = 0;

  for (let index = 0; index < normalizedInput.simulations; index += 1) {
    const hand = drawHand(flatDeck, normalizedInput.handSize);
    const hitCount = hand.filter((card) => targetCardIds.has(card.cardId)).length;

    if (hitCount >= normalizedInput.minimumHits) {
      hits += 1;
    }
  }

  return {
    probabilityPercent: (hits / normalizedInput.simulations) * 100,
    hits,
    simulations: normalizedInput.simulations,
    targetCardIds: normalizedInput.targetCardIds,
    minimumHits: normalizedInput.minimumHits,
    handSize: normalizedInput.handSize,
    presetName: normalizedInput.presetName,
  };
}

export { maxSimulations };
