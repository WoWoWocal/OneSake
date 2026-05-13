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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDeckCard(value: unknown): value is DeckCard {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.cardId === 'string' &&
    typeof value.name === 'string' &&
    typeof value.quantity === 'number' &&
    Number.isFinite(value.quantity)
  );
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function optionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const strings = value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
  return strings.length > 0 ? strings : undefined;
}

function optionalNumber(value: unknown): number | null | undefined {
  if (value === null) {
    return null;
  }

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function sanitizeDeckCard(card: Partial<DeckCard>): DeckCard | null {
  if (!isDeckCard(card)) {
    return null;
  }

  return {
    cardId: card.cardId,
    name: card.name,
    quantity: card.quantity,
    color: optionalString(card.color),
    type: optionalString(card.type),
    cost: optionalNumber(card.cost),
    power: optionalNumber(card.power),
    counter: optionalNumber(card.counter),
    attribute: optionalString(card.attribute),
    subTypes: optionalString(card.subTypes),
    rarity: optionalString(card.rarity),
  };
}

export function sanitizeDeck(deck: Partial<Deck> | null | undefined): Deck {
  const safeDeck = isRecord(deck) ? deck : {};
  const now = nowIso();
  const cards = Array.isArray(safeDeck.cards)
    ? safeDeck.cards.filter((card): card is DeckCard => isDeckCard(card))
    : [];

  return {
    id: typeof safeDeck.id === 'string' && safeDeck.id.trim() ? safeDeck.id : createDeckId(),
    name: typeof safeDeck.name === 'string' && safeDeck.name.trim() ? safeDeck.name : 'New Deck',
    leaderCardId: typeof safeDeck.leaderCardId === 'string' ? safeDeck.leaderCardId : '',
    leaderName: optionalString(safeDeck.leaderName),
    leaderColors: optionalStringArray(safeDeck.leaderColors),
    createdAt:
      typeof safeDeck.createdAt === 'string' && safeDeck.createdAt ? safeDeck.createdAt : now,
    updatedAt:
      typeof safeDeck.updatedAt === 'string' && safeDeck.updatedAt ? safeDeck.updatedAt : now,
    cards: cards
      .map((card) => sanitizeDeckCard(card))
      .filter((card): card is DeckCard => Boolean(card)),
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
