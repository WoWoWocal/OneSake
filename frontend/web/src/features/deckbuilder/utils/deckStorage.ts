import type { Deck, DeckCard } from '../../../types/decks';

const deckStorageKey = 'onesake.deckbuilder.currentDeck';

export const emptyDeck: Deck = {
  id: 'new-deck',
  name: 'New Deck',
  leaderCardId: '',
  cards: [],
};

function isDeckCard(value: Partial<DeckCard>): value is DeckCard {
  return (
    typeof value.cardId === 'string' &&
    typeof value.name === 'string' &&
    typeof value.quantity === 'number' &&
    Number.isFinite(value.quantity)
  );
}

export function sanitizeDeck(deck: Partial<Deck>): Deck {
  const cards = Array.isArray(deck.cards)
    ? deck.cards.filter((card): card is DeckCard => isDeckCard(card))
    : [];

  return {
    id: typeof deck.id === 'string' && deck.id.trim() ? deck.id : emptyDeck.id,
    name: typeof deck.name === 'string' && deck.name.trim() ? deck.name : emptyDeck.name,
    leaderCardId: typeof deck.leaderCardId === 'string' ? deck.leaderCardId : '',
    cards,
  };
}

export function loadStoredDeck(): Deck {
  try {
    const storedDeck = window.localStorage.getItem(deckStorageKey);
    if (!storedDeck) {
      return emptyDeck;
    }

    return sanitizeDeck(JSON.parse(storedDeck) as Partial<Deck>);
  } catch {
    return emptyDeck;
  }
}

export function saveStoredDeck(deck: Deck): void {
  try {
    window.localStorage.setItem(deckStorageKey, JSON.stringify(deck));
  } catch {
    // Draft persistence is optional; deck editing should keep working without storage.
  }
}
