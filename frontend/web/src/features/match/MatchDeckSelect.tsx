import type { Deck } from '../../types/decks';
import { getTotalCards, validateDeck } from '../deckbuilder/utils/deckValidation';

interface MatchDeckSelectProps {
  decks: Deck[];
  selectedDeckId: string;
  onSelectDeck: (deckId: string) => void;
}

export function MatchDeckSelect({ decks, onSelectDeck, selectedDeckId }: MatchDeckSelectProps) {
  return (
    <section className="panel match-deck-select">
      <div className="panel-title-row">
        <h2>Match Deck</h2>
        <span>{decks.length}</span>
      </div>

      {decks.length === 0 ? (
        <p className="match-deck-select__empty">
          Create and save a deck in the Deckbuilder first.
        </p>
      ) : (
        <div className="match-deck-list" role="radiogroup" aria-label="Saved decks">
          {decks.map((deck) => {
            const validation = validateDeck(deck);
            const totalCards = getTotalCards(deck.cards);
            const isSelected = deck.id === selectedDeckId;

            return (
              <button
                key={deck.id}
                aria-checked={isSelected}
                className={`match-deck-option ${isSelected ? 'is-selected' : ''} ${
                  validation.isValid ? 'is-valid' : 'is-invalid'
                }`}
                onClick={() => onSelectDeck(deck.id)}
                role="radio"
                type="button"
              >
                <span>
                  <strong>{deck.name}</strong>
                  <small>{deck.leaderCardId || 'No leader'}</small>
                </span>
                <span>
                  <strong>{totalCards}/50</strong>
                  <small>{validation.isValid ? 'Valid' : 'Invalid'}</small>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
