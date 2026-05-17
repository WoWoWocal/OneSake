import type { CardDto } from '../../types/cards';

interface CardHoverPreviewProps {
  card: CardDto | null;
  onOpenDetails: (card: CardDto) => void;
}

export function CardHoverPreview({ card, onOpenDetails }: CardHoverPreviewProps) {
  if (!card) {
    return (
      <aside className="panel deckbuilder-hover-preview deckbuilder-hover-preview--empty">
        <div className="deckbuilder-hover-preview__placeholder" aria-hidden="true" />
        <h2>Hover a card</h2>
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

      <div className="deckbuilder-hover-preview__body">
        <div className="deckbuilder-hover-preview__heading">
          <span>{card.card_set_id}</span>
          <h2>{card.card_name}</h2>
        </div>

        <dl className="deckbuilder-hover-preview__meta">
          <div>
            <dt>Color</dt>
            <dd>{card.card_color || '-'}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{card.card_type || '-'}</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>{card.card_cost ?? '-'}</dd>
          </div>
          <div>
            <dt>Power</dt>
            <dd>{card.card_power ?? '-'}</dd>
          </div>
          <div>
            <dt>Counter</dt>
            <dd>{card.counter_amount ?? '-'}</dd>
          </div>
          <div>
            <dt>Rarity</dt>
            <dd>{card.rarity || '-'}</dd>
          </div>
        </dl>

        <section className="deckbuilder-hover-preview__effect" aria-label="Card effect">
          <span>Effect</span>
          <p>{card.card_text || 'No card text available.'}</p>
        </section>

        <button
          className="deckbuilder-hover-preview__details"
          onClick={() => onOpenDetails(card)}
          type="button"
        >
          Details
        </button>
      </div>
    </aside>
  );
}
