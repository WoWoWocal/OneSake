import type { Deck } from '../../types/decks';
import { getTotalCards } from './utils/deckValidation';

interface DeckSummaryProps {
  deck: Deck;
  onClearDeck: () => void;
  onDeckNameChange: (name: string) => void;
  onRemoveLeader: () => void;
}

export function DeckSummary({
  deck,
  onClearDeck,
  onDeckNameChange,
  onRemoveLeader,
}: DeckSummaryProps) {
  const totalCards = getTotalCards(deck.cards);
  const uniqueCards = deck.cards.length;

  return (
    <section className="panel deck-panel">
      <label className="field" htmlFor="deckName">
        Deck name
        <input
          id="deckName"
          maxLength={40}
          onChange={(event) => onDeckNameChange(event.target.value)}
          value={deck.name}
        />
      </label>
      <div className="kv-grid">
        <span>Leader</span>
        <strong>{deck.leaderCardId || '-'}</strong>
        <span>Main Deck</span>
        <strong>{totalCards}/50</strong>
        <span>Unique</span>
        <strong>{uniqueCards}</strong>
      </div>
      <div className="deck-actions">
        <button disabled={!deck.leaderCardId} onClick={onRemoveLeader} type="button">
          Remove leader
        </button>
        <button disabled={!deck.leaderCardId && deck.cards.length === 0} onClick={onClearDeck} type="button">
          Clear deck
        </button>
      </div>
    </section>
  );
}
