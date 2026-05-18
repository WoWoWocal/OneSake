import type { Deck } from '../../types/decks';
import { Button } from '../../components/ui/Button';
import { validateDeck } from '../deckbuilder/utils/deckValidation';

type DeckWithLeaderImage = Deck & {
  leaderCard?: {
    card_image?: string;
    cardImage?: string;
    image?: string;
  };
  leaderCardImage?: string;
  leaderImage?: string;
};

interface MatchDeckSelectProps {
  decks: Deck[];
  selectedDeckId: string;
  embedded?: boolean;
  onSelectDeck: (deckId: string) => void;
  onOpenDeckbuilder?: () => void;
}

function getLeaderImage(deck: Deck): string {
  const enrichedDeck = deck as DeckWithLeaderImage;

  return (
    enrichedDeck.leaderImage ||
    enrichedDeck.leaderCardImage ||
    enrichedDeck.leaderCard?.card_image ||
    enrichedDeck.leaderCard?.cardImage ||
    enrichedDeck.leaderCard?.image ||
    ''
  );
}

export function MatchDeckSelect({
  decks,
  embedded = false,
  onOpenDeckbuilder,
  onSelectDeck,
  selectedDeckId,
}: MatchDeckSelectProps) {
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
        <div className="match-deck-list" role="radiogroup" aria-label="Saved decks">
          {decks.map((deck) => {
            const validation = validateDeck(deck);
            const isSelected = deck.id === selectedDeckId;
            const leaderImage = getLeaderImage(deck);

            return (
              <button
                key={deck.id}
                aria-checked={isSelected}
                aria-label={`Select deck ${deck.name}`}
                className={`match-deck-option ${isSelected ? 'is-selected' : ''} ${
                  validation.isValid ? 'is-valid' : 'is-invalid'
                }`}
                onClick={() => onSelectDeck(deck.id)}
                role="radio"
                type="button"
              >
                <span className="match-deck-option__leader" aria-hidden="true">
                  {leaderImage ? (
                    <img alt="" src={leaderImage} />
                  ) : (
                    <span className="match-deck-option__leader-placeholder">
                      <span>Leader</span>
                      <strong>{deck.leaderCardId || deck.leaderName || '-'}</strong>
                    </span>
                  )}
                </span>
                <strong className="match-deck-option__name">{deck.name}</strong>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
