import type { Deck } from '../../types/decks';
import { Button } from '../../components/ui/Button';
import { getTotalCards, validateDeck } from '../deckbuilder/utils/deckValidation';

interface MatchDeckSelectProps {
  decks: Deck[];
  selectedDeckId: string;
  embedded?: boolean;
  onSelectDeck: (deckId: string) => void;
  onOpenDeckbuilder?: () => void;
}

export function MatchDeckSelect({
  decks,
  embedded = false,
  onOpenDeckbuilder,
  onSelectDeck,
  selectedDeckId,
}: MatchDeckSelectProps) {
  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId) ?? null;
  const selectedValidation = selectedDeck ? validateDeck(selectedDeck) : null;
  const selectedTotalCards = selectedDeck ? getTotalCards(selectedDeck.cards) : 0;

  return (
    <section className={embedded ? 'match-deck-select match-deck-select--embedded' : 'panel match-deck-select'}>
      <div className="panel-title-row">
        <div>
          <h2>Deck</h2>
          <p>Pick the deck that will be registered when you join.</p>
        </div>
        <span>{decks.length}</span>
      </div>

      {decks.length === 0 ? (
        <div className="match-deck-select__empty">
          <strong>Create a deck in Deckbuilder first.</strong>
          <p>Saved decks appear here once they have a leader and main deck cards.</p>
          {onOpenDeckbuilder && (
            <Button onClick={onOpenDeckbuilder} variant="secondary">
              Go to Deckbuilder
            </Button>
          )}
        </div>
      ) : (
        <>
          {selectedDeck && selectedValidation && (
            <div
              className={`match-selected-deck-card ${
                selectedValidation.isValid ? 'is-valid' : 'is-invalid'
              }`}
            >
              <div>
                <span>Selected Deck</span>
                <strong>{selectedDeck.name}</strong>
                <small>{selectedDeck.leaderName || selectedDeck.leaderCardId || 'No leader selected'}</small>
              </div>
              <dl>
                <div>
                  <dt>Leader</dt>
                  <dd>{selectedDeck.leaderCardId || '-'}</dd>
                </div>
                <div>
                  <dt>Main Deck</dt>
                  <dd>{selectedTotalCards}/50</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{selectedValidation.isValid ? 'Valid' : 'Invalid'}</dd>
                </div>
              </dl>
              {!selectedValidation.isValid && (
                <ul className="match-deck-issues" aria-label="Deck validation issues">
                  {selectedValidation.errors.slice(0, 3).map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
              {selectedValidation.warnings.length > 0 && (
                <ul className="match-deck-issues match-deck-issues--warning" aria-label="Deck warnings">
                  {selectedValidation.warnings.slice(0, 2).map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

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
        </>
      )}
    </section>
  );
}
