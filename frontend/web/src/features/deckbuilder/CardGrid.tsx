import type { CSSProperties } from 'react';

import type { CardDto } from '../../types/cards';
import type { DeckCard } from '../../types/decks';
import type { CardFilters } from './CardFilterSheet';
import { CardTile } from './CardTile';
import {
  cardMatchesLeaderColors,
  cardMatchesSelectedColors,
  getCardColors,
  isLeaderCard,
} from './utils/deckValidation';

interface CardGridProps {
  cards: CardDto[];
  filters: CardFilters;
  leaderColors: string[];
  cardsPerRow?: number;
  deckCards: DeckCard[];
  leaderCardId: string;
  selectedSetId: string;
  allSetsOption: string;
  onAddCard: (card: CardDto) => void;
  onSetLeader: (card: CardDto) => void;
  onPreviewCard: (card: CardDto) => void;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function clampCardsPerRow(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 8;
  }

  return Math.min(10, Math.max(7, Math.round(value)));
}

function getCardMinWidth(cardsPerRow: number): number {
  return Math.min(210, Math.max(116, Math.round(1180 / cardsPerRow)));
}

function normalizeArchetypeText(card: CardDto): string {
  return normalize(
    [card.sub_types, card.attribute, card.card_type, card.card_text]
      .filter(Boolean)
      .join(' '),
  );
}

function buildCardSearchText(card: CardDto): string {
  return normalize(
    [
      card.card_name,
      card.card_set_id,
      card.card_color,
      ...getCardColors(card.card_color),
      card.card_type,
      card.sub_types,
      card.attribute,
      card.card_text,
      card.rarity,
      card.set_id,
      card.set_name,
      card.card_cost,
      card.counter_amount,
      card.card_power,
      card.life,
    ]
      .filter((value) => value !== null && value !== undefined)
      .join(' '),
  );
}

function getCardCost(card: CardDto): number {
  return typeof card.card_cost === 'number' ? card.card_cost : Number.POSITIVE_INFINITY;
}

function getColorSortIndex(card: CardDto, leaderColors: string[]): number {
  const cardColors = getCardColors(card.card_color).map((color) => color.toLowerCase());
  const normalizedLeaderColors = leaderColors.map((color) => color.toLowerCase());
  const matchingIndex = normalizedLeaderColors.findIndex((leaderColor) =>
    cardColors.includes(leaderColor),
  );

  return matchingIndex === -1 ? Number.POSITIVE_INFINITY : matchingIndex;
}

function compareCards(left: CardDto, right: CardDto, leaderColors: string[], hasActiveLeader: boolean): number {
  if (!hasActiveLeader) {
    return (
      left.card_set_id.localeCompare(right.card_set_id, undefined, { numeric: true }) ||
      left.card_name.localeCompare(right.card_name, undefined, { numeric: true })
    );
  }

  return (
    getColorSortIndex(left, leaderColors) - getColorSortIndex(right, leaderColors) ||
    getCardCost(left) - getCardCost(right) ||
    left.card_set_id.localeCompare(right.card_set_id, undefined, { numeric: true }) ||
    left.card_name.localeCompare(right.card_name, undefined, { numeric: true })
  );
}

export function CardGrid({
  allSetsOption,
  cards,
  cardsPerRow,
  deckCards,
  filters,
  leaderCardId,
  leaderColors,
  onAddCard,
  onPreviewCard,
  onSetLeader,
  selectedSetId,
}: CardGridProps) {
  const safeCardsPerRow = clampCardsPerRow(cardsPerRow);
  const gridStyle = {
    '--card-grid-min': `${getCardMinWidth(safeCardsPerRow)}px`,
  } as CSSProperties;
  const deckQuantities = new Map(deckCards.map((deckCard) => [deckCard.cardId, deckCard.quantity]));
  const normalizedSearch = normalize(filters.searchText);
  const normalizedArchetype = normalize(filters.archetype);
  const hasActiveLeader = Boolean(leaderCardId);
  const visibleCards = cards.filter((card) => {
    const isLeader = isLeaderCard(card);
    const matchesSet = selectedSetId === allSetsOption || card.set_id === selectedSetId;
    const matchesLeaderColors =
      hasActiveLeader
        ? !isLeader &&
          (leaderColors.length === 0 || cardMatchesLeaderColors(card.card_color, leaderColors))
        : isLeader;
    const matchesText = !normalizedSearch || buildCardSearchText(card).includes(normalizedSearch);
    const matchesArchetype =
      !normalizedArchetype || normalizeArchetypeText(card).includes(normalizedArchetype);
    const matchesColor = cardMatchesSelectedColors(card.card_color, filters.selectedColors);
    const matchesType = !filters.cardType || card.card_type === filters.cardType;
    const matchesCost = !filters.cost || String(card.card_cost ?? '') === filters.cost;
    const matchesCounter =
      !filters.counter || String(card.counter_amount ?? '') === filters.counter;

    return (
      matchesSet &&
      matchesLeaderColors &&
      matchesText &&
      matchesArchetype &&
      matchesColor &&
      matchesType &&
      matchesCost &&
      matchesCounter
    );
  }).sort((left, right) => compareCards(left, right, leaderColors, hasActiveLeader));

  return (
    <>
      <div className="card-grid-count">
        {visibleCards.length} {hasActiveLeader ? 'playable cards' : 'leaders'}
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
