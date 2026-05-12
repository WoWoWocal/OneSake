import type { CardDto } from '../../types/cards';
import type { CardFilters } from './CardFilterSheet';
import { CardTile } from './CardTile';

interface CardGridProps {
  cards: CardDto[];
  filters: CardFilters;
  onSelectCard: (card: CardDto) => void;
  onAddCard: (card: CardDto) => void;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function CardGrid({ cards, filters, onAddCard, onSelectCard }: CardGridProps) {
  const normalizedSearch = normalize(filters.searchText);
  const visibleCards = cards.filter((card) => {
    const matchesText =
      !normalizedSearch ||
      normalize(card.card_name).includes(normalizedSearch) ||
      normalize(card.card_set_id).includes(normalizedSearch);
    const matchesColor = !filters.color || card.card_color === filters.color;
    const matchesType = !filters.cardType || card.card_type === filters.cardType;
    const matchesCost = !filters.cost || String(card.card_cost ?? '') === filters.cost;
    const matchesCounter =
      !filters.counter || String(card.counter_amount ?? '') === filters.counter;

    return matchesText && matchesColor && matchesType && matchesCost && matchesCounter;
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
