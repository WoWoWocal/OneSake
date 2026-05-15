import { Button } from '../../components/ui/Button';
import type { Deck } from '../../types/decks';
import { getTotalCards, validateDeck } from '../deckbuilder/utils/deckValidation';

interface SavedDeckSelectProps {
  decks: Deck[];
  selectedDeckId: string;
  onSelectDeck: (deckId: string) => void;
  onOpenDeckbuilder?: () => void;
}

export function SavedDeckSelect({
  decks,
  onOpenDeckbuilder,
  onSelectDeck,
  selectedDeckId,
}: SavedDeckSelectProps) {
  if (decks.length === 0) {
    return (
      <section className="panel tools-panel saved-deck-select saved-deck-select--empty">
        <span className="tools-kicker">Deck Library</span>
        <h2>No saved decks yet</h2>
        <p>Create and save a deck in the Deckbuilder first.</p>
        {onOpenDeckbuilder && (
          <Button onClick={onOpenDeckbuilder} variant="secondary">
            Open Deckbuilder
          </Button>
        )}
      </section>
    );
  }

  return (
    <section className="panel tools-panel saved-deck-select">
      <div className="saved-deck-select__header">
        <div>
          <span className="tools-kicker">Deck Library</span>
          <h2>Choose Deck</h2>
        </div>
        <strong>{decks.length} saved</strong>
      </div>

      <div className="saved-deck-list" role="radiogroup" aria-label="Saved decks for tools">
        {decks.map((deck) => {
          const totalCards = getTotalCards(deck.cards);
          const validation = validateDeck(deck);
          const isSelected = deck.id === selectedDeckId;

          return (
            <button
              key={deck.id}
              aria-checked={isSelected}
              className={`saved-deck-option ${isSelected ? 'is-selected' : ''} ${
                validation.isValid ? 'is-valid' : 'is-invalid'
              }`}
              onClick={() => onSelectDeck(deck.id)}
              role="radio"
              type="button"
            >
              <span>
                <strong>{deck.name}</strong>
                <small>{deck.leaderName || deck.leaderCardId || 'No leader'}</small>
              </span>
              <span>
                <strong>{totalCards}/50</strong>
                <small>{validation.isValid ? 'Valid' : 'Invalid'}</small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
