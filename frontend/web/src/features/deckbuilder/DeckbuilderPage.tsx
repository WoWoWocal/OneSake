import { useEffect, useMemo, useState } from 'react';

import { getCardsBySetId } from '../../api/cardsApi';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import type { CardDto } from '../../types/cards';
import type { Deck, DeckCard } from '../../types/decks';
import { CardFilterSheet, type CardFilters } from './CardFilterSheet';
import { CardGrid } from './CardGrid';
import { CardHoverPreview } from './CardHoverPreview';
import { CardSearch } from './CardSearch';
import { CardSizeSlider } from './CardSizeSlider';
import { ColorPaletteFilter } from './ColorPaletteFilter';
import { DeckDrawer } from './DeckDrawer';
import { DeckLibrary } from './DeckLibrary';
import { DeckSummary } from './DeckSummary';
import {
  createNewDeck,
  deleteStoredDeck,
  duplicateStoredDeck,
  loadStoredDeck,
  loadStoredDecks,
  saveStoredDeck,
  saveStoredDecks,
  touchDeck,
  upsertStoredDeck,
} from './utils/deckStorage';
import {
  cardMatchesLeaderColors,
  getCardColors,
  getTotalCards,
  isLeaderCard,
} from './utils/deckValidation';


const availableSets = [
  'OP-01',
  'OP-02',
  'OP-03',
  'OP-04',
  'OP-05',
  'OP-06',
  'OP-07',
  'OP-08',
  'OP-09',
  'OP-10',
  'OP-11',
  'OP-12',
  'OP-13',

  'ST-01',
  'ST-02',
  'ST-03',
  'ST-04',
  'ST-05',
  'ST-06',
  'ST-07',
  'ST-08',
  'ST-09',
  'ST-10',
  'ST-11',
  'ST-12',
  'ST-13',
  'ST-14',
  'ST-15',
  'ST-16',
  'ST-17',
  'ST-18',
  'ST-19',
  'ST-20',
  'ST-21',
  'ST-22',
  'ST-23',
  'ST-24',
  'ST-25',
  'ST-26',
  'ST-27',
  'ST-28',
];
const cardsPerRowStorageKey = 'onesake.deckbuilder.cardsPerRow';
const defaultCardsPerRow = 8;
const allSetsOption = 'ALL_SETS';

function clampCardsPerRow(value: number): number {
  if (!Number.isFinite(value)) {
    return defaultCardsPerRow;
  }

  return Math.min(10, Math.max(7, Math.round(value)));
}

const emptyFilters: CardFilters = {
  searchText: '',
  archetype: '',
  selectedColors: [],
  cardType: '',
  cost: '',
  counter: '',
};

function uniqueValues(cards: CardDto[], readValue: (card: CardDto) => string): string[] {
  return [...new Set(cards.map(readValue).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
}

function optionalCardText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function loadCardsPerRow(): number {
  try {
    const storedValue = window.localStorage.getItem(cardsPerRowStorageKey);
    return storedValue ? clampCardsPerRow(Number(storedValue)) : defaultCardsPerRow;
  } catch {
    return defaultCardsPerRow;
  }
}

function saveCardsPerRow(cardsPerRow: number): void {
  try {
    window.localStorage.setItem(cardsPerRowStorageKey, String(clampCardsPerRow(cardsPerRow)));
  } catch {
    // The grid size preference is optional; deckbuilding should work without storage.
  }
}

function createDeckCard(card: CardDto, quantity: number): DeckCard {
  return {
    cardId: card.card_set_id,
    name: card.card_name,
    quantity,
    color: optionalCardText(card.card_color),
    type: optionalCardText(card.card_type),
    cost: card.card_cost,
    power: card.card_power,
    counter: card.counter_amount,
    attribute: optionalCardText(card.attribute),
    subTypes: optionalCardText(card.sub_types),
    rarity: optionalCardText(card.rarity),
  };
}

function areStringArraysEqual(left: string[] | undefined, right: string[] | undefined): boolean {
  const leftValues = left ?? [];
  const rightValues = right ?? [];

  return (
    leftValues.length === rightValues.length &&
    leftValues.every((value, index) => value === rightValues[index])
  );
}

function compareCardsForDeckbuilder(left: CardDto, right: CardDto): number {
  const leftIsLeader = isLeaderCard(left);
  const rightIsLeader = isLeaderCard(right);

  if (leftIsLeader !== rightIsLeader) {
    return leftIsLeader ? -1 : 1;
  }

  return (
    left.card_set_id.localeCompare(right.card_set_id, undefined, { numeric: true }) ||
    left.card_name.localeCompare(right.card_name, undefined, { numeric: true })
  );
}

function needsDeckCardHydration(deckCard: DeckCard): boolean {
  return (
    deckCard.color === undefined &&
    deckCard.type === undefined &&
    deckCard.cost === undefined &&
    deckCard.power === undefined &&
    deckCard.counter === undefined &&
    deckCard.attribute === undefined &&
    deckCard.subTypes === undefined &&
    deckCard.rarity === undefined
  );
}

function hydrateDeckWithCards(deckToHydrate: Deck, loadedCards: CardDto[]): Deck {
  if (loadedCards.length === 0) {
    return deckToHydrate;
  }

  const loadedCardsById = new Map(loadedCards.map((card) => [card.card_set_id, card]));
  let changed = false;
  const leaderCard = loadedCardsById.get(deckToHydrate.leaderCardId);
  let leaderName = deckToHydrate.leaderName;
  let leaderColors = deckToHydrate.leaderColors;

  if (leaderCard) {
    const nextLeaderColors = getCardColors(leaderCard.card_color);

    if (
      deckToHydrate.leaderName !== leaderCard.card_name ||
      !areStringArraysEqual(deckToHydrate.leaderColors, nextLeaderColors)
    ) {
      leaderName = leaderCard.card_name;
      leaderColors = nextLeaderColors;
      changed = true;
    }
  }

  const hydratedCards = deckToHydrate.cards.map((deckCard) => {
    const loadedCard = loadedCardsById.get(deckCard.cardId);
    if (!loadedCard) {
      return deckCard;
    }

    if (!needsDeckCardHydration(deckCard)) {
      return deckCard;
    }

    const hydratedCard = createDeckCard(loadedCard, deckCard.quantity);
    changed = true;
    return hydratedCard;
  });

  return changed ? { ...deckToHydrate, leaderName, leaderColors, cards: hydratedCards } : deckToHydrate;
}

function dedupeCards(cardsToDedupe: CardDto[]): CardDto[] {
  const cardsById = new Map<string, CardDto>();

  cardsToDedupe.forEach((card) => {
    if (!cardsById.has(card.card_set_id)) {
      cardsById.set(card.card_set_id, card);
    }
  });

  return [...cardsById.values()];
}

export function DeckbuilderPage() {
  const [selectedSetId, setSelectedSetId] = useState(allSetsOption);
  const [filters, setFilters] = useState<CardFilters>(emptyFilters);
  const [setCards, setSetCards] = useState<CardDto[]>([]);
  const [allSetCards, setAllSetCards] = useState<CardDto[]>([]);
  const [deck, setDeck] = useState<Deck>(() => loadStoredDeck());
  const [savedDecks, setSavedDecks] = useState<Deck[]>(() => loadStoredDecks());
  const [previewCard, setPreviewCard] = useState<CardDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deckNotice, setDeckNotice] = useState('');
  const [deckOpen, setDeckOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cardsPerRow, setCardsPerRow] = useState(loadCardsPerRow);

  const hasActiveLeader = Boolean(deck.leaderCardId);
  const shouldUseAllSetCards = selectedSetId === allSetsOption || hasActiveLeader;
  const cardPool = shouldUseAllSetCards && allSetCards.length > 0 ? allSetCards : setCards;
  const sortedCards = useMemo(() => [...cardPool].sort(compareCardsForDeckbuilder), [cardPool]);
  const loadedCardsById = useMemo(
    () => new Map([...setCards, ...allSetCards].map((card) => [card.card_set_id, card])),
    [allSetCards, setCards],
  );
  const activeLeaderColors = useMemo(() => deck.leaderColors ?? [], [deck.leaderColors]);
  const leaderPreviewCard = useMemo(
    () => loadedCardsById.get(deck.leaderCardId) ?? null,
    [deck.leaderCardId, loadedCardsById],
  );
  const totalDeckCards = getTotalCards(deck.cards);
  const isDeckSaved = savedDecks.some(
    (savedDeck) => savedDeck.id === deck.id && savedDeck.updatedAt === deck.updatedAt,
  );
  const activeFilterCount =
    (filters.searchText ? 1 : 0) +
    (filters.archetype ? 1 : 0) +
    filters.selectedColors.length +
    (filters.cardType ? 1 : 0) +
    (filters.cost ? 1 : 0) +
    (filters.counter ? 1 : 0);
  const filterOptions = useMemo(
    () => ({
      cardTypes: uniqueValues(sortedCards, (card) => card.card_type),
      costs: uniqueValues(sortedCards, (card) => String(card.card_cost ?? '')),
      counters: uniqueValues(sortedCards, (card) => String(card.counter_amount ?? '')).filter(
        (counter) => counter !== '4000' && counter !== '5000',
      ),
    }),
    [sortedCards],
  );

  useEffect(() => {
    saveStoredDeck(deck);
  }, [deck]);

  useEffect(() => {
    saveCardsPerRow(cardsPerRow);
  }, [cardsPerRow]);

  useEffect(() => {
    const cardsForHydration = dedupeCards([...setCards, ...allSetCards]);
    if (cardsForHydration.length === 0) {
      return;
    }

    setDeck((currentDeck) => hydrateDeckWithCards(currentDeck, cardsForHydration));

    const storedDecks = loadStoredDecks();
    let changed = false;
    const hydratedDecks = storedDecks.map((storedDeck) => {
      const hydratedDeck = hydrateDeckWithCards(storedDeck, cardsForHydration);
      if (hydratedDeck !== storedDeck) {
        changed = true;
      }

      return hydratedDeck;
    });

    if (changed) {
      saveStoredDecks(hydratedDecks);
      setSavedDecks(hydratedDecks);
    }
  }, [allSetCards, setCards]);

  useEffect(() => {
    if (!deckNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setDeckNotice(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [deckNotice]);

  useEffect(() => {
    if (selectedSetId === allSetsOption) {
      setSetCards([]);
      return undefined;
    }

    let ignoreResult = false;

    const loadCards = async (): Promise<void> => {
      setLoading(true);
      setError('');

      try {
        const loadedCards = await getCardsBySetId(selectedSetId);
        if (!ignoreResult) {
          setSetCards(loadedCards);
        }
      } catch (loadError) {
        if (!ignoreResult) {
          const message =
            loadError instanceof Error ? loadError.message : 'Cards could not be loaded.';
          setSetCards([]);
          setError(message);
        }
      } finally {
        if (!ignoreResult) {
          setLoading(false);
        }
      }
    };

    void loadCards();

    return () => {
      ignoreResult = true;
    };
  }, [selectedSetId]);

  useEffect(() => {
    if (!shouldUseAllSetCards || allSetCards.length > 0) {
      return undefined;
    }

    let ignoreResult = false;

    const loadAllSetCards = async (): Promise<void> => {
      setLoading(true);
      setError('');

      try {
        const loadedSetCards = await Promise.all(
          availableSets.map((setId) => getCardsBySetId(setId)),
        );
        if (!ignoreResult) {
          setAllSetCards(dedupeCards(loadedSetCards.flat()));
        }
      } catch (loadError) {
        if (!ignoreResult) {
          const message =
            loadError instanceof Error ? loadError.message : 'Playable cards could not be loaded.';
          setError(message);
        }
      } finally {
        if (!ignoreResult) {
          setLoading(false);
        }
      }
    };

    void loadAllSetCards();

    return () => {
      ignoreResult = true;
    };
  }, [allSetCards.length, shouldUseAllSetCards]);

  const showDeckNotice = (message: string): void => {
    setDeckNotice(message);
  };

  const updateDeck = (update: (currentDeck: Deck) => Deck): void => {
    setDeck((currentDeck) => touchDeck(update(currentDeck)));
  };

  const addCardToDeck = (card: CardDto): void => {
    if (isLeaderCard(card)) {
      updateDeck((currentDeck) => ({
        ...currentDeck,
        leaderCardId: card.card_set_id,
        leaderName: card.card_name,
        leaderColors: getCardColors(card.card_color),
      }));
      setSelectedSetId(allSetsOption);
      showDeckNotice(`${card.card_name} set as leader.`);
      return;
    }

    if (
      activeLeaderColors.length > 0 &&
      !cardMatchesLeaderColors(card.card_color, activeLeaderColors)
    ) {
      showDeckNotice(`${card.card_name} does not match the active leader colors.`);
      return;
    }

    updateDeck((currentDeck) => {
      const existingCard = currentDeck.cards.find((deckCard) => deckCard.cardId === card.card_set_id);

      if (existingCard) {
        if (existingCard.quantity >= 4) {
          return currentDeck;
        }

        return {
          ...currentDeck,
          cards: currentDeck.cards.map((deckCard) =>
            deckCard.cardId === card.card_set_id
              ? { ...createDeckCard(card, deckCard.quantity + 1), quantity: deckCard.quantity + 1 }
              : deckCard,
          ),
        };
      }

      return {
        ...currentDeck,
        cards: [
          ...currentDeck.cards,
          {
            ...createDeckCard(card, 1),
          },
        ],
      };
    });
  };

  const increaseDeckCard = (cardId: string): void => {
    updateDeck((currentDeck) => {
      const card = currentDeck.cards.find((deckCard) => deckCard.cardId === cardId);
      if (!card) {
        return currentDeck;
      }

      if (card.quantity >= 4) {
        return currentDeck;
      }

      return {
        ...currentDeck,
        cards: currentDeck.cards.map((deckCard) =>
          deckCard.cardId === cardId ? { ...deckCard, quantity: deckCard.quantity + 1 } : deckCard,
        ),
      };
    });
  };

  const decreaseDeckCard = (cardId: string): void => {
    updateDeck((currentDeck) => ({
      ...currentDeck,
      cards: currentDeck.cards
        .map((deckCard) =>
          deckCard.cardId === cardId ? { ...deckCard, quantity: deckCard.quantity - 1 } : deckCard,
        )
        .filter((deckCard) => deckCard.quantity > 0),
    }));
  };

  const removeDeckCard = (cardId: string): void => {
    updateDeck((currentDeck) => ({
      ...currentDeck,
      cards: currentDeck.cards.filter((deckCard) => deckCard.cardId !== cardId),
    }));
  };

  const renameDeck = (name: string): void => {
    updateDeck((currentDeck) => ({
      ...currentDeck,
      name,
    }));
  };

  const clearDeck = (): void => {
    setDeck(touchDeck({
      ...createNewDeck(),
      id: deck.id,
      createdAt: deck.createdAt,
      name: deck.name,
    }));
    showDeckNotice('Deck cleared.');
  };

  const removeLeader = (): void => {
    updateDeck((currentDeck) => ({
      ...currentDeck,
      leaderCardId: '',
      leaderName: undefined,
      leaderColors: undefined,
    }));
  };

  const resetFilters = (): void => {
    setFilters(emptyFilters);
  };

  const createDeck = (): void => {
    const newDeck = createNewDeck();
    setDeck(newDeck);
    showDeckNotice('New deck started.');
  };

  const saveDeck = (): void => {
    const nextDecks = upsertStoredDeck(deck);
    const savedDeck = nextDecks.find((storedDeck) => storedDeck.id === deck.id) ?? deck;
    setSavedDecks(nextDecks);
    setDeck(savedDeck);
    showDeckNotice(`${savedDeck.name} saved.`);
  };

  const loadDeck = (deckToLoad: Deck): void => {
    setDeck(deckToLoad);
    showDeckNotice(`${deckToLoad.name} loaded.`);
  };

  const duplicateDeck = (deckId: string): void => {
    const nextDecks = duplicateStoredDeck(deckId);
    setSavedDecks(nextDecks);
    if (nextDecks[0]) {
      setDeck(nextDecks[0]);
      showDeckNotice(`${nextDecks[0].name} created.`);
    }
  };

  const deleteDeck = (deckId: string): void => {
    const nextDecks = deleteStoredDeck(deckId);
    setSavedDecks(nextDecks);

    if (deck.id === deckId) {
      const newDeck = createNewDeck();
      setDeck(newDeck);
      saveStoredDeck(newDeck);
      showDeckNotice('Deleted deck. New deck started.');
      return;
    }

    showDeckNotice('Deck deleted.');
  };

  return (
    <section className="deckbuilder-page">
      <div className="deckbuilder-layout">
        <main className="deckbuilder-main">
          <section className="deckbuilder-topline" aria-label="Deck overview">
            <section className="panel deckbuilder-compact-card deckbuilder-compact-card--deck">
              <div className="deckbuilder-compact-card__header">
                <h2>Deck List</h2>
                <strong>{totalDeckCards}/50</strong>
              </div>
              <label className="field" htmlFor="deckNameCompact">
                Deck name
                <input
                  id="deckNameCompact"
                  maxLength={40}
                  onChange={(event) => renameDeck(event.target.value)}
                  value={deck.name}
                />
              </label>
              <div className="deckbuilder-compact-actions">
                <Button disabled={!deck.leaderCardId} onClick={removeLeader} variant="ghost">
                  Change leader
                </Button>
                <Button
                  disabled={!deck.leaderCardId && deck.cards.length === 0}
                  onClick={clearDeck}
                  variant="ghost"
                >
                  Clear deck
                </Button>
                <Button onClick={saveDeck}>Save Deck</Button>
                <Button onClick={() => setDeckOpen(true)} variant="ghost">
                  Deck Library
                </Button>
              </div>

              <div className="deckbuilder-deck-stacks" aria-label="Cards in current deck">
                {deck.leaderCardId ? (
                  <div className="deckbuilder-deck-stack deckbuilder-deck-stack--leader">
                    <span className="deckbuilder-deck-stack__label">Leader</span>
                    <span className="deckbuilder-deck-stack__card">
                      {leaderPreviewCard?.card_image ? (
                        <img
                          alt={`${leaderPreviewCard.card_name} leader card`}
                          loading="lazy"
                          src={leaderPreviewCard.card_image}
                        />
                      ) : (
                        <span className="deckbuilder-deck-stack__placeholder">
                          <strong>{deck.leaderName || deck.leaderCardId}</strong>
                          <small>{deck.leaderCardId}</small>
                        </span>
                      )}
                    </span>
                    <strong className="deckbuilder-deck-stack__quantity">1</strong>
                  </div>
                ) : (
                  <div className="deckbuilder-deck-stack deckbuilder-deck-stack--empty-leader">
                    <span className="deckbuilder-deck-stack__placeholder">
                      <strong>Leader</strong>
                    </span>
                  </div>
                )}
                {deck.cards.map((deckCard) => {
                  const cardImage = loadedCardsById.get(deckCard.cardId)?.card_image;

                  return (
                    <button
                      aria-label={`Remove one copy of ${deckCard.name}`}
                      className={`deckbuilder-deck-stack deckbuilder-deck-stack--${Math.min(
                        deckCard.quantity,
                        4,
                      )}`}
                      key={deckCard.cardId}
                      onClick={() => decreaseDeckCard(deckCard.cardId)}
                      title={`Remove one ${deckCard.name}`}
                      type="button"
                    >
                      <span className="deckbuilder-deck-stack__ghost" aria-hidden="true">
                        {cardImage && <img alt="" loading="lazy" src={cardImage} />}
                      </span>
                      <span className="deckbuilder-deck-stack__ghost" aria-hidden="true">
                        {cardImage && <img alt="" loading="lazy" src={cardImage} />}
                      </span>
                      <span className="deckbuilder-deck-stack__ghost" aria-hidden="true">
                        {cardImage && <img alt="" loading="lazy" src={cardImage} />}
                      </span>
                      <span className="deckbuilder-deck-stack__card">
                        {cardImage ? (
                          <img alt={`${deckCard.name} card`} loading="lazy" src={cardImage} />
                        ) : (
                          <span className="deckbuilder-deck-stack__placeholder">
                            <strong>{deckCard.name}</strong>
                            <small>{deckCard.cardId}</small>
                          </span>
                        )}
                      </span>
                      <strong className="deckbuilder-deck-stack__quantity">
                        {deckCard.quantity}
                      </strong>
                    </button>
                  );
                })}
              </div>
            </section>
          </section>

          <div className="deckbuilder-toolbar" aria-label="Deckbuilder filters">
            <section className="set-picker">
              <label htmlFor="setPicker">{hasActiveLeader ? 'Card pool' : 'Leader set'}</label>
              <select
                id="setPicker"
                onChange={(event) => {
                  setSelectedSetId(event.target.value);
                  resetFilters();
                }}
                value={selectedSetId}
              >
                <option value={allSetsOption}>All sets</option>
                {availableSets.map((setId) => (
                  <option key={setId} value={setId}>
                    {setId}
                  </option>
                ))}
              </select>
            </section>

            <CardSearch
              activeFilterCount={activeFilterCount}
              onOpenFilters={() => setFiltersOpen(true)}
              onSearchChange={(searchText) => setFilters((currentFilters) => ({
                ...currentFilters,
                searchText,
              }))}
              searchText={filters.searchText}
            />

            <div className="deckbuilder-filter-panel">
              <ColorPaletteFilter
                onChange={(selectedColors) => setFilters((currentFilters) => ({
                  ...currentFilters,
                  selectedColors,
                }))}
                selectedColors={filters.selectedColors}
              />
              <CardSizeSlider cardsPerRow={cardsPerRow} onChange={setCardsPerRow} />
            </div>
          </div>

          {deckNotice && <div className="panel status-panel">{deckNotice}</div>}
          {loading && <div className="panel status-panel">Loading cards...</div>}
          {error && <div className="panel status-panel status-panel--error">{error}</div>}
          {!loading && !error && (
            <section className="deckbuilder-card-browser">
              <div className="deckbuilder-card-grid-area">
                <CardGrid
                  cards={sortedCards}
                  cardsPerRow={cardsPerRow}
                  deckCards={deck.cards}
                  filters={filters}
                  leaderCardId={deck.leaderCardId}
                  leaderColors={activeLeaderColors}
                  selectedSetId={selectedSetId}
                  allSetsOption={allSetsOption}
                  onAddCard={addCardToDeck}
                  onPreviewCard={setPreviewCard}
                  onSetLeader={addCardToDeck}
                />
              </div>
              <CardHoverPreview card={previewCard} />
            </section>
          )}
        </main>
      </div>

      <Drawer onClose={() => setDeckOpen(false)} open={deckOpen} title="Deck">
        <DeckLibrary
          activeDeckId={deck.id}
          decks={savedDecks}
          onCreateDeck={createDeck}
          onDeleteDeck={deleteDeck}
          onDuplicateDeck={duplicateDeck}
          onLoadDeck={loadDeck}
        />
        <DeckSummary
          deck={deck}
          isSaved={isDeckSaved}
          onClearDeck={clearDeck}
          onDeckNameChange={renameDeck}
          onRemoveLeader={removeLeader}
        />
        <DeckDrawer
          deck={deck}
          onDecreaseCard={decreaseDeckCard}
          onIncreaseCard={increaseDeckCard}
          onRemoveCard={removeDeckCard}
        />
      </Drawer>

      <CardFilterSheet
        filters={filters}
        onApply={() => setFiltersOpen(false)}
        onChange={setFilters}
        onClose={() => setFiltersOpen(false)}
        onReset={resetFilters}
        open={filtersOpen}
        options={filterOptions}
      />

    </section>
  );
}
