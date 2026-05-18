import type { Deck } from '../../types/decks';
import { Button } from '../../components/ui/Button';
import { validateDeck } from '../deckbuilder/utils/deckValidation';

interface MatchDeckSelectProps {
  decks: Deck[];
  selectedDeckId: string;
  embedded?: boolean;
  onSelectDeck: (deckId: string) => void;
  onOpenDeckbuilder?: () => void;
}

function deriveSetLabel(deck: Deck | null): string {
  const cardId = deck?.leaderCardId || deck?.cards.find((card) => card.cardId)?.cardId || '';
  const match = cardId.match(/^[A-Z]{2}\d{2}/i);

  return match ? match[0].toUpperCase() : 'Set -';
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
  const selectedSetLabel = deriveSetLabel(selectedDeck);

  return (
    <section className={embedded ? 'match-deck-select match-deck-select--embedded' : 'panel match-deck-select'}>
      <div className="panel-title-row">
        <div>
          <h2>Deck</h2>
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="match-deck-select__empty">
          <strong>No saved decks.</strong>
          {onOpenDeckbuilder && (
            <Button onClick={onOpenDeckbuilder} variant="secondary">
              Go to Deckbuilder
            </Button>
          )}
        </div>
      ) : (
        <>
          {selectedDeck ? (
            <div
              className={`match-selected-deck-card ${
                selectedValidation?.isValid ? 'is-valid' : 'is-invalid'
              }`}
            >
              <div className="match-leader-card-preview" aria-label="Selected leader card">
                <span>{selectedDeck.leaderCardId || 'Leader'}</span>
                <strong>{selectedDeck.leaderName || 'Leader Card'}</strong>
              </div>
              <div className="match-selected-deck-card__details">
                <div>
                  <span>Deckname</span>
                  <strong>{selectedDeck.name}</strong>
                </div>
                <div>
                  <span>Set</span>
                  <strong>{selectedSetLabel}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="match-deck-select__empty">
              <strong>No deck selected.</strong>
            </div>
          )}

          <div className="match-deck-list" role="radiogroup" aria-label="Saved decks">
            {decks.map((deck) => {
              const validation = validateDeck(deck);
              const setLabel = deriveSetLabel(deck);
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
                    <small>{setLabel}</small>
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
