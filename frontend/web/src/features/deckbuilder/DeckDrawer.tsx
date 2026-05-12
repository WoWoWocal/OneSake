import type { Deck } from '../../types/decks';

interface DeckDrawerProps {
  deck: Deck;
  onIncreaseCard: (cardId: string) => void;
  onDecreaseCard: (cardId: string) => void;
  onRemoveCard: (cardId: string) => void;
}

export function DeckDrawer({
  deck,
  onDecreaseCard,
  onIncreaseCard,
  onRemoveCard,
}: DeckDrawerProps) {
  return (
    <section className="panel deck-panel">
      <h2>Deck list</h2>
      {deck.cards.length === 0 ? (
        <p>No cards added yet.</p>
      ) : (
        <ul className="deck-list">
          {deck.cards.map((deckCard) => (
            <li key={deckCard.cardId}>
              <div className="deck-list__card">
                <strong>{deckCard.name}</strong>
                <span>{deckCard.cardId}</span>
              </div>
              <div className="deck-list__actions">
                <button
                  aria-label={`Remove one ${deckCard.name}`}
                  onClick={() => onDecreaseCard(deckCard.cardId)}
                  type="button"
                >
                  -
                </button>
                <strong>x{deckCard.quantity}</strong>
                <button
                  aria-label={`Add one ${deckCard.name}`}
                  onClick={() => onIncreaseCard(deckCard.cardId)}
                  type="button"
                >
                  +
                </button>
                <button
                  aria-label={`Remove ${deckCard.name} from deck`}
                  className="deck-list__remove"
                  onClick={() => onRemoveCard(deckCard.cardId)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
