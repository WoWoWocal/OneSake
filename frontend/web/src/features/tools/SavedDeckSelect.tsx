import type { Deck } from '../../types/decks';
import { getTotalCards } from '../deckbuilder/utils/deckValidation';

interface SavedDeckSelectProps {
  decks: Deck[];
  selectedDeckId: string;
  onSelectDeck: (deckId: string) => void;
}

export function SavedDeckSelect({ decks, onSelectDeck, selectedDeckId }: SavedDeckSelectProps) {
  if (decks.length === 0) {
    return (
      <section className="panel tools-panel">
        <h2>Saved Decks</h2>
        <p>No saved decks yet. Save a deck in the Deckbuilder first.</p>
      </section>
    );
  }

  return (
    <section className="panel tools-panel">
      <label className="field" htmlFor="savedDeckSelect">
        Saved Deck
        <select
          id="savedDeckSelect"
          onChange={(event) => onSelectDeck(event.target.value)}
          value={selectedDeckId}
        >
          {decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name} ({getTotalCards(deck.cards)}/50)
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
