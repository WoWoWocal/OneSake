import type { Deck, DeckCard } from '../../../types/decks';

export interface DeckValidationResult {
  isValid: boolean;
  totalCards: number;
  errors: string[];
  warnings: string[];
}

const knownColors = ['Red', 'Green', 'Blue', 'Purple', 'Black', 'Yellow'];

export function isLeaderCardType(cardType: string | undefined): boolean {
  return Boolean(cardType?.toLowerCase().includes('leader'));
}

export function getCardColors(color: string | undefined): string[] {
  if (!color?.trim()) {
    return [];
  }

  const normalizedColor = color.toLowerCase();
  const matchedKnownColors = knownColors.filter((knownColor) =>
    normalizedColor.includes(knownColor.toLowerCase()),
  );

  if (matchedKnownColors.length > 0) {
    return matchedKnownColors;
  }

  return color
    .split(/[/,+&|]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatCardColors(colors: string[]): string {
  return colors.length > 0 ? colors.join(' / ') : '-';
}

export function cardMatchesLeaderColors(cardColor: string | undefined, leaderColors: string[]): boolean {
  if (leaderColors.length === 0) {
    return true;
  }

  const cardColors = getCardColors(cardColor);
  return cardColors.some((cardColorValue) =>
    leaderColors.some(
      (leaderColor) => cardColorValue.toLowerCase() === leaderColor.toLowerCase(),
    ),
  );
}

export function getTotalCards(cards: DeckCard[]): number {
  return cards.reduce((sum, card) => sum + card.quantity, 0);
}

export function validateDeck(deck: Deck): DeckValidationResult {
  const totalCards = getTotalCards(deck.cards);
  const errors: string[] = [];
  const warnings: string[] = [];
  const leaderColors = deck.leaderColors ?? [];

  if (!deck.leaderCardId) {
    errors.push('Exactly 1 leader must be selected.');
  } else if (leaderColors.length === 0) {
    warnings.push('Leader color data is missing. Color legality cannot be fully checked.');
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

    if (deck.leaderCardId && leaderColors.length > 0) {
      const cardColors = getCardColors(card.color);

      if (cardColors.length === 0) {
        warnings.push(`${card.name} has no color data and should be checked manually.`);
      } else if (!cardMatchesLeaderColors(card.color, leaderColors)) {
        errors.push(`${card.name} does not match the leader colors (${formatCardColors(leaderColors)}).`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    totalCards,
    errors,
    warnings,
  };
}
