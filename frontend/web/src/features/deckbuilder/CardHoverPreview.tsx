import type { CardDto } from '../../types/cards';

interface CardHoverPreviewProps {
  card: CardDto | null;
}

export function CardHoverPreview({ card }: CardHoverPreviewProps) {
  if (!card) {
    return (
      <aside className="panel deckbuilder-hover-preview deckbuilder-hover-preview--empty">
        <div className="deckbuilder-hover-preview__placeholder" aria-hidden="true" />
      </aside>
    );
  }

  return (
    <aside className="panel deckbuilder-hover-preview" aria-label="Card preview">
      <div className="deckbuilder-hover-preview__image">
        {card.card_image ? (
          <img alt={`${card.card_name} card preview`} src={card.card_image} />
        ) : (
          <span>{card.card_type || 'Card'}</span>
        )}
      </div>
    </aside>
  );
}
