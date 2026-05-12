import type { Deck, DeckCard } from '../../../types/decks';

const currentDeckStorageKey = 'onesake.deckbuilder.currentDeck';
const deckLibraryStorageKey = 'onesake.deckbuilder.decks';

function nowIso(): string {
  return new Date().toISOString();
}

function createDeckId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `deck-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createNewDeck(name = 'New Deck'): Deck {
  const now = nowIso();

  return {
    id: createDeckId(),
    name,
    leaderCardId: '',
    createdAt: now,
    updatedAt: now,
    cards: [],
  };
}

export const emptyDeck: Deck = createNewDeck();

function isDeckCard(value: Partial<DeckCard>): value is DeckCard {
  return (
    typeof value.cardId === 'string' &&
    typeof value.name === 'string' &&
    typeof value.quantity === 'number' &&
    Number.isFinite(value.quantity)
  );
}

export function sanitizeDeck(deck: Partial<Deck>): Deck {
  const now = nowIso();
  const cards = Array.isArray(deck.cards)
    ? deck.cards.filter((card): card is DeckCard => isDeckCard(card))
    : [];

  return {
    id: typeof deck.id === 'string' && deck.id.trim() ? deck.id : createDeckId(),
    name: typeof deck.name === 'string' && deck.name.trim() ? deck.name : 'New Deck',
    leaderCardId: typeof deck.leaderCardId === 'string' ? deck.leaderCardId : '',
    createdAt: typeof deck.createdAt === 'string' && deck.createdAt ? deck.createdAt : now,
    updatedAt: typeof deck.updatedAt === 'string' && deck.updatedAt ? deck.updatedAt : now,
    cards,
  };
}

export function touchDeck(deck: Deck): Deck {
  return {
    ...deck,
    updatedAt: nowIso(),
  };
}

export function loadStoredDeck(): Deck {
  try {
    const storedDeck = window.localStorage.getItem(currentDeckStorageKey);
    if (!storedDeck) {
      const storedDecks = loadStoredDecks();
      return storedDecks[0] ?? createNewDeck();
    }

    return sanitizeDeck(JSON.parse(storedDeck) as Partial<Deck>);
  } catch {
    return createNewDeck();
  }
}

export function saveStoredDeck(deck: Deck): void {
  try {
    window.localStorage.setItem(currentDeckStorageKey, JSON.stringify(deck));
  } catch {
    // Draft persistence is optional; deck editing should keep working without storage.
  }
}

export function loadStoredDecks(): Deck[] {
  try {
    const storedDecks = window.localStorage.getItem(deckLibraryStorageKey);
    if (!storedDecks) {
      return [];
    }

    const parsedDecks = JSON.parse(storedDecks);
    if (!Array.isArray(parsedDecks)) {
      return [];
    }

    return parsedDecks.map((deck) => sanitizeDeck(deck as Partial<Deck>));
  } catch {
    return [];
  }
}

export function saveStoredDecks(decks: Deck[]): void {
  try {
    window.localStorage.setItem(deckLibraryStorageKey, JSON.stringify(decks.map(sanitizeDeck)));
  } catch {
    // Library persistence is optional; current editing should keep working without storage.
  }
}

export function upsertStoredDeck(deck: Deck): Deck[] {
  const storedDecks = loadStoredDecks();
  const deckToSave = touchDeck(sanitizeDeck(deck));
  const exists = storedDecks.some((storedDeck) => storedDeck.id === deckToSave.id);
  const nextDecks = exists
    ? storedDecks.map((storedDeck) => (storedDeck.id === deckToSave.id ? deckToSave : storedDeck))
    : [deckToSave, ...storedDecks];

  saveStoredDecks(nextDecks);
  saveStoredDeck(deckToSave);
  return nextDecks;
}

export function deleteStoredDeck(deckId: string): Deck[] {
  const nextDecks = loadStoredDecks().filter((deck) => deck.id !== deckId);
  saveStoredDecks(nextDecks);
  return nextDecks;
}

export function duplicateStoredDeck(deckId: string): Deck[] {
  const storedDecks = loadStoredDecks();
  const sourceDeck = storedDecks.find((deck) => deck.id === deckId);
  if (!sourceDeck) {
    return storedDecks;
  }

  const now = nowIso();
  const duplicatedDeck: Deck = {
    ...sourceDeck,
    id: createDeckId(),
    name: `${sourceDeck.name} Copy`,
    createdAt: now,
    updatedAt: now,
    cards: sourceDeck.cards.map((card) => ({ ...card })),
  };
  const nextDecks = [duplicatedDeck, ...storedDecks];

  saveStoredDecks(nextDecks);
  saveStoredDeck(duplicatedDeck);
  return nextDecks;
}
