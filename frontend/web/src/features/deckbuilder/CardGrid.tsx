import type { CardDto } from '../../types/cards';
import type { CardFilters } from './CardFilterSheet';
import { CardTile } from './CardTile';
import {
  cardMatchesLeaderColors,
  cardMatchesSelectedColors,
  isLeaderCardType,
} from './utils/deckValidation';

interface CardGridProps {
  cards: CardDto[];
  filters: CardFilters;
  leaderColors: string[];
  onSelectCard: (card: CardDto) => void;
  onAddCard: (card: CardDto) => void;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function CardGrid({ cards, filters, leaderColors, onAddCard, onSelectCard }: CardGridProps) {
  const normalizedSearch = normalize(filters.searchText);
  const visibleCards = cards.filter((card) => {
    const matchesLeaderColors =
      leaderColors.length === 0 ||
      isLeaderCardType(card.card_type) ||
      cardMatchesLeaderColors(card.card_color, leaderColors);
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
      <div className="card-grid-count">{visibleCards.length} cards</div>
      <section className="card-grid" aria-label="Cards">
        {visibleCards.map((card) => (
          <CardTile
            key={`${card.card_set_id}-${card.card_image_id}`}
            card={card}
            onAdd={onAddCard}
            onSelect={onSelectCard}
          />
        ))}
        {visibleCards.length === 0 && (
          <div className="panel empty-state">No cards match these filters.</div>
        )}
      </section>
    </>
  );
}
