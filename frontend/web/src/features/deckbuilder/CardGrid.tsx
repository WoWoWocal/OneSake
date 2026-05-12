import type { CardDto } from '../../types/cards';
import { CardTile } from './CardTile';

interface CardGridProps {
  cards: CardDto[];
  searchText: string;
  onSelectCard: (card: CardDto) => void;
  onAddCard: (card: CardDto) => void;
}

export function CardGrid({ cards, onAddCard, onSelectCard, searchText }: CardGridProps) {
  const normalizedSearch = searchText.trim().toLowerCase();
  const visibleCards = cards.filter((card) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      card.card_name.toLowerCase().includes(normalizedSearch) ||
      card.card_set_id.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
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
        <div className="panel empty-state">No cards match this search.</div>
      )}
    </section>
  );
}
