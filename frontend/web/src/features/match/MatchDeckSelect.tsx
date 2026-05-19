import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { getCardsById } from '../../api/cardsApi';
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
  headerAction?: ReactNode;
  title?: string;
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
  headerAction,
  onOpenDeckbuilder,
  onSelectDeck,
  selectedDeckId,
  title = 'Deck',
}: MatchDeckSelectProps) {
  const [leaderImagesById, setLeaderImagesById] = useState<Record<string, string>>({});
  const leaderCardIds = useMemo(
    () => [...new Set(decks.map((deck) => deck.leaderCardId).filter(Boolean))],
    [decks],
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadLeaderImages(): Promise<void> {
      const imageEntries = await Promise.all(
        leaderCardIds.map(async (leaderCardId) => {
          try {
            const cards = await getCardsById(leaderCardId);
            const leaderCard =
              cards.find((card) => card.card_set_id === leaderCardId) ?? cards[0] ?? null;

            return [leaderCardId, leaderCard?.card_image ?? ''] as const;
          } catch {
            return [leaderCardId, ''] as const;
          }
        }),
      );

      if (isCancelled) {
        return;
      }

      setLeaderImagesById(Object.fromEntries(imageEntries));
    }

    void loadLeaderImages();

    return () => {
      isCancelled = true;
    };
  }, [leaderCardIds]);

  return (
    <section className={embedded ? 'match-deck-select match-deck-select--embedded' : 'panel match-deck-select'}>
      <div className="panel-title-row">
        <div>
          <h2>{title}</h2>
        </div>
        {headerAction}
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
            const leaderImage = leaderImagesById[deck.leaderCardId] || getLeaderImage(deck);

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
