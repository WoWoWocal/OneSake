import { useEffect, useMemo, useState } from 'react';

import { getCardsBySetId } from '../../api/cardsApi';
import { Drawer } from '../../components/ui/Drawer';
import type { CardDto } from '../../types/cards';
import type { Deck } from '../../types/decks';
import { CardFilterSheet, type CardFilters } from './CardFilterSheet';
import { CardGrid } from './CardGrid';
import { CardInspectModal } from './CardInspectModal';
import { CardSearch } from './CardSearch';
import { DeckDrawer } from './DeckDrawer';
import { DeckExport } from './DeckExport';
import { DeckSummary } from './DeckSummary';
import { DeckValidation } from './DeckValidation';
import { emptyDeck, loadStoredDeck, saveStoredDeck } from './utils/deckStorage';
import { validateDeck } from './utils/deckValidation';

const availableSets = ['OP-01', 'OP-02', 'OP-03', 'ST-01'];

const emptyFilters: CardFilters = {
  searchText: '',
  color: '',
  cardType: '',
  cost: '',
  counter: '',
};

function uniqueValues(cards: CardDto[], readValue: (card: CardDto) => string): string[] {
  return [...new Set(cards.map(readValue).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
}

export function DeckbuilderPage() {
  const [selectedSetId, setSelectedSetId] = useState(availableSets[0]);
  const [filters, setFilters] = useState<CardFilters>(emptyFilters);
  const [cards, setCards] = useState<CardDto[]>([]);
  const [deck, setDeck] = useState<Deck>(() => loadStoredDeck());
  const [selectedCard, setSelectedCard] = useState<CardDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deckNotice, setDeckNotice] = useState('');
  const [deckOpen, setDeckOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const validation = useMemo(() => validateDeck(deck), [deck]);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const filterOptions = useMemo(
    () => ({
      colors: uniqueValues(cards, (card) => card.card_color),
      cardTypes: uniqueValues(cards, (card) => card.card_type),
      costs: uniqueValues(cards, (card) => String(card.card_cost ?? '')),
      counters: uniqueValues(cards, (card) => String(card.counter_amount ?? '')),
    }),
    [cards],
  );

  useEffect(() => {
    saveStoredDeck(deck);
  }, [deck]);

  useEffect(() => {
    if (!deckNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setDeckNotice(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [deckNotice]);

  useEffect(() => {
    let ignoreResult = false;

    const loadCards = async (): Promise<void> => {
      setLoading(true);
      setError('');

      try {
        const loadedCards = await getCardsBySetId(selectedSetId);
        if (!ignoreResult) {
          setCards(loadedCards);
        }
      } catch (loadError) {
        if (!ignoreResult) {
          const message =
            loadError instanceof Error ? loadError.message : 'Cards could not be loaded.';
          setCards([]);
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

  const showDeckNotice = (message: string): void => {
    setDeckNotice(message);
  };

  const addCardToDeck = (card: CardDto): void => {
    if (card.card_type.toLowerCase() === 'leader') {
      setDeck((currentDeck) => ({
        ...currentDeck,
        leaderCardId: card.card_set_id,
      }));
      showDeckNotice(`${card.card_name} set as leader.`);
      return;
    }

    setDeck((currentDeck) => {
      const existingCard = currentDeck.cards.find((deckCard) => deckCard.cardId === card.card_set_id);

      if (existingCard) {
        if (existingCard.quantity >= 4) {
          showDeckNotice(`${existingCard.name} already has 4 copies.`);
          return currentDeck;
        }

        showDeckNotice(`${existingCard.name} increased to ${existingCard.quantity + 1}.`);
        return {
          ...currentDeck,
          cards: currentDeck.cards.map((deckCard) =>
            deckCard.cardId === card.card_set_id
              ? { ...deckCard, quantity: deckCard.quantity + 1 }
              : deckCard,
          ),
        };
      }

      showDeckNotice(`${card.card_name} added.`);
      return {
        ...currentDeck,
        cards: [
          ...currentDeck.cards,
          {
            cardId: card.card_set_id,
            name: card.card_name,
            quantity: 1,
          },
        ],
      };
    });
  };

  const increaseDeckCard = (cardId: string): void => {
    setDeck((currentDeck) => {
      const card = currentDeck.cards.find((deckCard) => deckCard.cardId === cardId);
      if (!card) {
        return currentDeck;
      }

      if (card.quantity >= 4) {
        showDeckNotice(`${card.name} already has 4 copies.`);
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
    setDeck((currentDeck) => ({
      ...currentDeck,
      cards: currentDeck.cards
        .map((deckCard) =>
          deckCard.cardId === cardId ? { ...deckCard, quantity: deckCard.quantity - 1 } : deckCard,
        )
        .filter((deckCard) => deckCard.quantity > 0),
    }));
  };

  const removeDeckCard = (cardId: string): void => {
    setDeck((currentDeck) => ({
      ...currentDeck,
      cards: currentDeck.cards.filter((deckCard) => deckCard.cardId !== cardId),
    }));
  };

  const renameDeck = (name: string): void => {
    setDeck((currentDeck) => ({
      ...currentDeck,
      name,
    }));
  };

  const clearDeck = (): void => {
    setDeck({
      ...emptyDeck,
      name: deck.name,
    });
    showDeckNotice('Deck cleared.');
  };

  const removeLeader = (): void => {
    setDeck((currentDeck) => ({
      ...currentDeck,
      leaderCardId: '',
    }));
  };

  const resetFilters = (): void => {
    setFilters(emptyFilters);
  };

  return (
    <section className="deckbuilder-page">
      <header className="panel header-panel deckbuilder-header">
        <div>
          <h1>Deckbuilder</h1>
          <p>Browse real cards, build a local deck and export a valid list.</p>
        </div>
        <button className="deck-toggle" onClick={() => setDeckOpen(true)} type="button">
          Deck
        </button>
      </header>

      <div className="deckbuilder-layout">
        <main className="deckbuilder-main">
          <section className="panel set-picker">
            <label htmlFor="setPicker">Set</label>
            <select
              id="setPicker"
              onChange={(event) => {
                setSelectedSetId(event.target.value);
                resetFilters();
              }}
              value={selectedSetId}
            >
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
          />
          {deckNotice && <div className="panel status-panel">{deckNotice}</div>}
          {loading && <div className="panel status-panel">Loading cards from {selectedSetId}...</div>}
          {error && <div className="panel status-panel status-panel--error">{error}</div>}
          {!loading && !error && (
            <CardGrid
              cards={cards}
              filters={filters}
              onAddCard={addCardToDeck}
              onSelectCard={setSelectedCard}
            />
          )}
        </main>

        <aside className="deck-sidebar">
          <DeckSummary
            deck={deck}
            onClearDeck={clearDeck}
            onDeckNameChange={renameDeck}
            onRemoveLeader={removeLeader}
          />
          <DeckValidation validation={validation} />
          <DeckDrawer
            deck={deck}
            onDecreaseCard={decreaseDeckCard}
            onIncreaseCard={increaseDeckCard}
            onRemoveCard={removeDeckCard}
          />
          <DeckExport deck={deck} validation={validation} />
        </aside>
      </div>

      <Drawer onClose={() => setDeckOpen(false)} open={deckOpen} title="Deck">
        <DeckSummary
          deck={deck}
          onClearDeck={clearDeck}
          onDeckNameChange={renameDeck}
          onRemoveLeader={removeLeader}
        />
        <DeckValidation validation={validation} />
        <DeckDrawer
          deck={deck}
          onDecreaseCard={decreaseDeckCard}
          onIncreaseCard={increaseDeckCard}
          onRemoveCard={removeDeckCard}
        />
        <DeckExport deck={deck} validation={validation} />
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

      <CardInspectModal
        card={selectedCard}
        onAddCard={addCardToDeck}
        onClose={() => setSelectedCard(null)}
      />
    </section>
  );
}
