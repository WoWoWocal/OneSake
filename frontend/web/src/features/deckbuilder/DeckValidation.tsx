import type { Deck } from '../../types/decks';

interface DeckValidationProps {
  deck: Deck;
}

export function DeckValidation({ deck }: DeckValidationProps) {
  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
  const copyErrors = deck.cards.filter((card) => card.quantity > 4);
  const validationErrors = [
    !deck.leaderCardId ? 'Leader is missing.' : '',
    totalCards !== 50 ? `Deck has ${totalCards}/50 cards.` : '',
    ...copyErrors.map((card) => `${card.name} has ${card.quantity}/4 copies.`),
  ].filter(Boolean);

  return (
    <section className="panel deck-panel">
      <h2>Validation</h2>
      <ul className="validation-list">
        {validationErrors.length === 0 ? (
          <li className="is-valid">Deck is valid.</li>
        ) : (
          validationErrors.map((validationError) => (
            <li key={validationError} className="is-pending">
              {validationError}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
