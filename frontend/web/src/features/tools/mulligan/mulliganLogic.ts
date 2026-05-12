import type { Deck } from '../../../types/decks';
import type {
  MulliganDeckCard,
  MulliganDrawResult,
  MulliganHandCard,
  MulliganHandMetrics,
} from './mulliganTypes';

export function buildFlatDeck(deck: Deck): MulliganDeckCard[] {
  return deck.cards.flatMap((card) =>
    Array.from({ length: Math.max(0, card.quantity) }, () => ({
      cardId: card.cardId,
      name: card.name,
      color: card.color,
      type: card.type,
      cost: card.cost,
      counter: card.counter,
    })),
  );
}

export function shuffleDeck<T>(cards: T[]): T[] {
  const shuffledCards = [...cards];

  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledCards[index], shuffledCards[swapIndex]] = [
      shuffledCards[swapIndex],
      shuffledCards[index],
    ];
  }

  return shuffledCards;
}

function groupHandCards(cards: MulliganDeckCard[]): MulliganHandCard[] {
  const groupedCards = new Map<string, MulliganHandCard>();

  cards.forEach((card) => {
    const existingCard = groupedCards.get(card.cardId);
    if (existingCard) {
      existingCard.quantity += 1;
      return;
    }

    groupedCards.set(card.cardId, {
      cardId: card.cardId,
      name: card.name,
      quantity: 1,
      color: card.color,
      type: card.type,
      cost: card.cost,
      counter: card.counter,
    });
  });

  return [...groupedCards.values()].sort((a, b) => a.cardId.localeCompare(b.cardId));
}

export function calculateHandMetrics(hand: MulliganHandCard[]): MulliganHandMetrics {
  const cardCount = hand.reduce((sum, card) => sum + card.quantity, 0);

  return {
    cardCount,
    uniqueCardIds: hand.length,
    cardsWithQuantity: hand,
    counter2000Count: hand.reduce(
      (sum, card) => sum + (card.counter === 2000 ? card.quantity : 0),
      0,
    ),
    eventCount: hand.reduce(
      (sum, card) =>
        sum + (card.type?.toLowerCase().includes('event') ? card.quantity : 0),
      0,
    ),
    lowCostCount: hand.reduce(
      (sum, card) =>
        sum + (typeof card.cost === 'number' && card.cost <= 3 ? card.quantity : 0),
      0,
    ),
    characterCount: hand.reduce(
      (sum, card) =>
        sum + (card.type?.toLowerCase().includes('character') ? card.quantity : 0),
      0,
    ),
  };
}

export function drawOpeningHand(deck: Deck, handSize = 5): MulliganDrawResult {
  const flatDeck = buildFlatDeck(deck);

  if (flatDeck.length < handSize) {
    return {
      hand: [],
      metrics: {
        cardCount: 0,
        uniqueCardIds: 0,
        cardsWithQuantity: [],
        counter2000Count: 0,
        eventCount: 0,
        lowCostCount: 0,
        characterCount: 0,
      },
      error: `Deck needs at least ${handSize} cards to draw an opening hand.`,
    };
  }

  const hand = groupHandCards(shuffleDeck(flatDeck).slice(0, handSize));

  return {
    hand,
    metrics: calculateHandMetrics(hand),
    error: '',
  };
}
