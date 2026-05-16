import type { Deck, DeckCard } from '../../../types/decks';

export interface DeckValidationResult {
  isValid: boolean;
  totalCards: number;
  errors: string[];
  warnings: string[];
}

export const playableColors = ['Red', 'Green', 'Blue', 'Purple', 'Black', 'Yellow'];

export function isLeaderCardType(cardType: string | undefined): boolean {
  return Boolean(cardType?.toLowerCase().includes('leader'));
}

interface CardTypeLike {
  card_type?: string;
  type?: string;
  category?: string;
  cardType?: string;
  family?: string;
}

export function isLeaderCard(card: CardTypeLike | null | undefined): boolean {
  if (!card) {
    return false;
  }

  return [card.card_type, card.type, card.category, card.cardType, card.family].some(
    (value) => typeof value === 'string' && isLeaderCardType(value),
  );
}

function formatUnknownColor(color: string): string {
  const normalizedColor = color.trim().toLowerCase();
  return normalizedColor
    ? `${normalizedColor.charAt(0).toUpperCase()}${normalizedColor.slice(1)}`
    : '';
}

export function getCardColors(color: unknown): string[] {
  if (Array.isArray(color)) {
    return color.flatMap((colorValue) => getCardColors(colorValue));
  }

  if (typeof color !== 'string' || !color.trim()) {
    return [];
  }

  const normalizedColor = color.toLowerCase();
  const matchedKnownColors = playableColors.filter((knownColor) =>
    normalizedColor.includes(knownColor.toLowerCase()),
  );

  if (matchedKnownColors.length > 0) {
    return matchedKnownColors;
  }

  return color
    .split(/[/,+&|]/)
    .map(formatUnknownColor)
    .filter(Boolean);
}

export function formatCardColors(colors: string[]): string {
  return colors.length > 0 ? colors.join(' / ') : '-';
}

export function cardMatchesLeaderColors(cardColor: unknown, leaderColors: string[]): boolean {
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

export function cardMatchesSelectedColors(cardColor: unknown, selectedColors: string[]): boolean {
  if (selectedColors.length === 0) {
    return true;
  }

  const cardColors = getCardColors(cardColor);
  return cardColors.some((cardColorValue) =>
    selectedColors.some(
      (selectedColor) => cardColorValue.toLowerCase() === selectedColor.toLowerCase(),
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
