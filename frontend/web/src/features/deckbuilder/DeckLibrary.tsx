import { Button } from '../../components/ui/Button';
import type { Deck } from '../../types/decks';
import { getTotalCards } from './utils/deckValidation';

interface DeckLibraryProps {
  decks: Deck[];
  activeDeckId: string;
  onCreateDeck: () => void;
  onDeleteDeck: (deckId: string) => void;
  onDuplicateDeck: (deckId: string) => void;
  onLoadDeck: (deck: Deck) => void;
  onSaveDeck: () => void;
}

function formatUpdatedAt(updatedAt: string): string {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleString();
}

export function DeckLibrary({
  activeDeckId,
  decks,
  onCreateDeck,
  onDeleteDeck,
  onDuplicateDeck,
  onLoadDeck,
  onSaveDeck,
}: DeckLibraryProps) {
  return (
    <section className="panel deck-panel deck-library">
      <div className="deck-library__header">
        <h2>Deck Library</h2>
        <div className="deck-library__actions">
          <Button onClick={onCreateDeck} variant="ghost">
            New Deck
          </Button>
          <Button onClick={onSaveDeck}>Save Deck</Button>
        </div>
      </div>

      {decks.length > 0 && (
        <ul className="deck-library__list">
          {decks.map((deck) => (
            <li key={deck.id} className={deck.id === activeDeckId ? 'is-active' : ''}>
              <div className="deck-library__deck">
                <strong>{deck.name}</strong>
                <span>{deck.leaderCardId || 'No leader'}</span>
                <span>
                  {getTotalCards(deck.cards)}/50 cards / Updated {formatUpdatedAt(deck.updatedAt)}
                </span>
              </div>
              <div className="deck-library__deck-actions">
                <Button onClick={() => onLoadDeck(deck)} variant="ghost">
                  Load
                </Button>
                <Button onClick={() => onDuplicateDeck(deck.id)} variant="ghost">
                  Duplicate
                </Button>
                <Button onClick={() => onDeleteDeck(deck.id)} variant="danger">
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
