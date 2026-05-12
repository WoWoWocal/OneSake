import type { Deck, DeckCard } from '../../../types/decks';

export interface DeckValidationResult {
  isValid: boolean;
  totalCards: number;
  errors: string[];
}

export function getTotalCards(cards: DeckCard[]): number {
  return cards.reduce((sum, card) => sum + card.quantity, 0);
}

export function validateDeck(deck: Deck): DeckValidationResult {
  const totalCards = getTotalCards(deck.cards);
  const errors: string[] = [];

  if (!deck.leaderCardId) {
    errors.push('Exactly 1 leader must be selected.');
  }

  if (totalCards !== 50) {
    errors.push(`Main Deck must contain exactly 50 cards (${totalCards}/50).`);
  }

  deck.cards.forEach((card) => {
    if (card.quantity <= 0) {
      errors.push(`${card.name} has an invalid quantity (${card.quantity}).`);
    }

    if (card.quantity > 4) {
      errors.push(`${card.name} has ${card.quantity}/4 copies.`);
    }
  });

  return {
    isValid: errors.length === 0,
    totalCards,
    errors,
  };
}
