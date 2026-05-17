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
  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId) ?? decks[0] ?? null;

  if (decks.length === 0) {
    return (
      <section className="panel tools-panel saved-deck-select saved-deck-select--empty">
        <div className="saved-deck-select__header">
          <div>
            <span className="tools-kicker">Deck Library</span>
            <h2>No decks available</h2>
          </div>
          {onOpenDeckbuilder && (
            <button
              className="saved-deck-select__action"
              onClick={onOpenDeckbuilder}
              type="button"
            >
              Create one in Deckbuilder
            </button>
          )}
        </div>
      </section>
    );
  }

  const selectedDeckTotal = selectedDeck ? getTotalCards(selectedDeck.cards) : 0;
  const selectedDeckValidation = selectedDeck ? validateDeck(selectedDeck) : null;

  return (
    <section className="panel tools-panel saved-deck-select">
      <div className="saved-deck-select__header">
        <div>
          <span className="tools-kicker">Deck Library</span>
          <h2>{selectedDeck?.name ?? 'Choose Deck'}</h2>
        </div>
        <strong>{decks.length} saved</strong>
      </div>

      <div className="saved-deck-select__toolbar">
        <label className="field" htmlFor="toolsSavedDeck">
          Deck
          <select
            id="toolsSavedDeck"
            onChange={(event) => onSelectDeck(event.target.value)}
            value={selectedDeck?.id ?? ''}
          >
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
              </option>
            ))}
          </select>
        </label>

        <dl className="saved-deck-select__stats">
          <div>
            <dt>Leader</dt>
            <dd>{selectedDeck?.leaderName || selectedDeck?.leaderCardId || 'No leader'}</dd>
          </div>
          <div>
            <dt>Main Deck</dt>
            <dd>{selectedDeckTotal}/50</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{selectedDeckValidation?.isValid ? 'Valid' : 'Invalid'}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
