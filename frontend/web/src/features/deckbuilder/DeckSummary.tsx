import type { Deck } from '../../types/decks';

interface DeckSummaryProps {
  deck: Deck;
}

export function DeckSummary({ deck }: DeckSummaryProps) {
  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
  const uniqueCards = deck.cards.length;

  return (
    <section className="panel deck-panel">
      <h2>{deck.name}</h2>
      <div className="kv-grid">
        <span>Leader</span>
        <strong>{deck.leaderCardId || '-'}</strong>
        <span>Cards</span>
        <strong>{totalCards}</strong>
        <span>Unique</span>
        <strong>{uniqueCards}</strong>
      </div>
    </section>
  );
}
