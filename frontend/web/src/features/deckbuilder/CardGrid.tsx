import type { CSSProperties } from 'react';

import type { CardDto } from '../../types/cards';
import type { DeckCard } from '../../types/decks';
import type { CardFilters } from './CardFilterSheet';
import { CardTile } from './CardTile';
import {
  cardMatchesLeaderColors,
  cardMatchesSelectedColors,
  isLeaderCard,
} from './utils/deckValidation';

interface CardGridProps {
  cards: CardDto[];
  filters: CardFilters;
  leaderColors: string[];
  cardsPerRow?: number;
  deckCards: DeckCard[];
  leaderCardId: string;
  onAddCard: (card: CardDto) => void;
  onSetLeader: (card: CardDto) => void;
  onPreviewCard: (card: CardDto) => void;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function clampCardsPerRow(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 3;
  }

  return Math.min(10, Math.max(1, Math.round(value)));
}

function getCardMinWidth(cardsPerRow: number): number {
  return Math.min(210, Math.max(116, Math.round(1180 / cardsPerRow)));
}

export function CardGrid({
  cards,
  cardsPerRow,
  deckCards,
  filters,
  leaderCardId,
  leaderColors,
  onAddCard,
  onPreviewCard,
  onSetLeader,
}: CardGridProps) {
  const safeCardsPerRow = clampCardsPerRow(cardsPerRow);
  const gridStyle = {
    '--card-grid-min': `${getCardMinWidth(safeCardsPerRow)}px`,
  } as CSSProperties;
  const deckQuantities = new Map(deckCards.map((deckCard) => [deckCard.cardId, deckCard.quantity]));
  const normalizedSearch = normalize(filters.searchText);
  const hasActiveLeader = Boolean(leaderCardId);
  const visibleCards = cards.filter((card) => {
    const isLeader = isLeaderCard(card);
    const matchesLeaderColors =
      !hasActiveLeader ||
      (!isLeader && (leaderColors.length === 0 || cardMatchesLeaderColors(card.card_color, leaderColors)));
    const matchesText =
      !normalizedSearch ||
      normalize(card.card_name).includes(normalizedSearch) ||
      normalize(card.card_set_id).includes(normalizedSearch);
    const matchesColor = cardMatchesSelectedColors(card.card_color, filters.selectedColors);
    const matchesType = !filters.cardType || card.card_type === filters.cardType;
    const matchesCost = !filters.cost || String(card.card_cost ?? '') === filters.cost;
    const matchesCounter =
      !filters.counter || String(card.counter_amount ?? '') === filters.counter;

    return (
      matchesLeaderColors &&
      matchesText &&
      matchesColor &&
      matchesType &&
      matchesCost &&
      matchesCounter
    );
  });

  return (
    <>
      <div className="card-grid-count">
        {visibleCards.length} {hasActiveLeader ? 'playable cards' : 'cards'}
      </div>
      <section
        className="card-grid"
        aria-label="Cards"
        style={gridStyle}
      >
        {visibleCards.map((card) => (
          <CardTile
            key={`${card.card_set_id}-${card.card_image_id}`}
            card={card}
            isSelectedLeader={leaderCardId === card.card_set_id}
            onAddCard={onAddCard}
            onPreviewCard={onPreviewCard}
            onSetLeader={onSetLeader}
            quantity={deckQuantities.get(card.card_set_id) ?? 0}
          />
        ))}
        {visibleCards.length === 0 && (
          <div className="panel empty-state">
            No cards match these filters. Remove the leader or reset filters to see more cards.
          </div>
        )}
      </section>
    </>
  );
}
