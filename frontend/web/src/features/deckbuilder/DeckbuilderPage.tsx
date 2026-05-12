import { useEffect, useState } from 'react';

import { getCardsBySetId } from '../../api/cardsApi';
import { Drawer } from '../../components/ui/Drawer';
import type { CardDto } from '../../types/cards';
import type { Deck, DeckCard } from '../../types/decks';
import { CardGrid } from './CardGrid';
import { CardInspectModal } from './CardInspectModal';
import { CardSearch } from './CardSearch';
import { DeckDrawer } from './DeckDrawer';
import { DeckSummary } from './DeckSummary';
import { DeckValidation } from './DeckValidation';

const availableSets = ['OP01', 'OP02', 'OP03', 'ST01'];
const deckStorageKey = 'onesake.deckbuilder.currentDeck';

const emptyDeck: Deck = {
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
    Number.isFinite(value.quantity) &&
    value.quantity > 0
  );
}

function sanitizeDeck(deck: Partial<Deck>): Deck {
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

function loadStoredDeck(): Deck {
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

function saveStoredDeck(deck: Deck): void {
  try {
    window.localStorage.setItem(deckStorageKey, JSON.stringify(deck));
  } catch {
    // Draft persistence is optional; deck editing should keep working without storage.
  }
}

export function DeckbuilderPage() {
  const [selectedSetId, setSelectedSetId] = useState(availableSets[0]);
  const [searchText, setSearchText] = useState('');
  const [cards, setCards] = useState<CardDto[]>([]);
  const [deck, setDeck] = useState<Deck>(() => loadStoredDeck());
  const [selectedCard, setSelectedCard] = useState<CardDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deckOpen, setDeckOpen] = useState(false);

  useEffect(() => {
    saveStoredDeck(deck);
  }, [deck]);

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

  const addCardToDeck = (card: CardDto): void => {
    if (card.card_type.toLowerCase() === 'leader') {
      setDeck((currentDeck) => ({
        ...currentDeck,
        leaderCardId: card.card_set_id,
      }));
      return;
    }

    setDeck((currentDeck) => {
      const existingCard = currentDeck.cards.find((deckCard) => deckCard.cardId === card.card_set_id);

      if (existingCard) {
        return {
          ...currentDeck,
          cards: currentDeck.cards.map((deckCard) =>
            deckCard.cardId === card.card_set_id
              ? { ...deckCard, quantity: deckCard.quantity + 1 }
              : deckCard,
          ),
        };
      }

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
    setDeck((currentDeck) => ({
      ...currentDeck,
      cards: currentDeck.cards.map((deckCard) =>
        deckCard.cardId === cardId ? { ...deckCard, quantity: deckCard.quantity + 1 } : deckCard,
      ),
    }));
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

  return (
    <section className="deckbuilder-page">
      <header className="panel header-panel deckbuilder-header">
        <div>
          <h1>Deckbuilder</h1>
          <p>Browse real cards by set and inspect card details.</p>
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
                setSearchText('');
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

          <CardSearch searchText={searchText} onSearchTextChange={setSearchText} />
          {loading && <div className="panel status-panel">Loading cards from {selectedSetId}...</div>}
          {error && <div className="panel status-panel status-panel--error">{error}</div>}
          {!loading && !error && (
            <CardGrid
              cards={cards}
              onAddCard={addCardToDeck}
              onSelectCard={setSelectedCard}
              searchText={searchText}
            />
          )}
        </main>

        <aside className="deck-sidebar">
          <DeckSummary deck={deck} />
          <DeckValidation deck={deck} />
          <DeckDrawer
            deck={deck}
            onDecreaseCard={decreaseDeckCard}
            onIncreaseCard={increaseDeckCard}
          />
        </aside>
      </div>

      <Drawer onClose={() => setDeckOpen(false)} open={deckOpen} title="Deck">
        <DeckSummary deck={deck} />
        <DeckValidation deck={deck} />
        <DeckDrawer deck={deck} onDecreaseCard={decreaseDeckCard} onIncreaseCard={increaseDeckCard} />
      </Drawer>

      <CardInspectModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </section>
  );
}
