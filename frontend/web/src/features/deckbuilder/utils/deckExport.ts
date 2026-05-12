import type { Deck } from '../../../types/decks';

export function createDeckExportString(deck: Deck): string {
  const sortedCards = [...deck.cards].sort((a, b) => a.cardId.localeCompare(b.cardId));
  const deckLines = sortedCards.map((card) => `${card.quantity}x ${card.cardId}`);

  return ['Leader:', deck.leaderCardId || '-', '', 'Deck:', ...deckLines].join('\n');
}
