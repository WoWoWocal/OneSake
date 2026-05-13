import type { Deck } from '../../types/decks';

interface DeckDrawerProps {
  deck: Deck;
  onIncreaseCard: (cardId: string) => void;
  onDecreaseCard: (cardId: string) => void;
  onRemoveCard: (cardId: string) => void;
}

function getDeckCardTags(deckCard: Deck['cards'][number]): string[] {
  return [
    deckCard.color,
    deckCard.type,
    typeof deckCard.cost === 'number' ? `Cost ${deckCard.cost}` : '',
    typeof deckCard.counter === 'number' && deckCard.counter > 0
      ? `Counter ${deckCard.counter}`
      : '',
  ].filter((tag): tag is string => Boolean(tag));
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
          {deck.cards.map((deckCard) => {
            const tags = getDeckCardTags(deckCard);

            return (
              <li key={deckCard.cardId}>
                <div className="deck-list__card">
                  <strong>{deckCard.name}</strong>
                  <span>{deckCard.cardId}</span>
                  {tags.length > 0 && (
                    <div className="tag-list">
                      {tags.map((tag) => (
                        <span key={tag} className="tag-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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
            );
          })}
        </ul>
      )}
    </section>
  );
}
