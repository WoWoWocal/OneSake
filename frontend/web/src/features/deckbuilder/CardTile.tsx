import type { CardDto } from '../../types/cards';
import { Button } from '../../components/ui/Button';

interface CardTileProps {
  card: CardDto;
  onSelect: (card: CardDto) => void;
  onAdd: (card: CardDto) => void;
}

export function CardTile({ card, onAdd, onSelect }: CardTileProps) {
  const actionLabel = card.card_type.toLowerCase() === 'leader' ? 'Set leader' : 'Add card';

  return (
    <article className="panel card-tile">
      <button className="card-tile__inspect" onClick={() => onSelect(card)} type="button">
        <div className="card-tile__image">
          {card.card_image ? (
            <img alt={`${card.card_name} card art`} loading="lazy" src={card.card_image} />
          ) : (
            card.card_type
          )}
        </div>
        <div className="card-tile__body">
          <span className="card-tile__id">{card.card_set_id}</span>
          <h2>{card.card_name}</h2>
          <p>
            {card.card_color || '-'} · {card.card_type || '-'}
          </p>
        </div>
      </button>
      <dl className="card-tile__meta">
        <div>
          <dt>Color</dt>
          <dd>{card.card_color || '-'}</dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>{card.card_cost ?? '-'}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{card.card_type || '-'}</dd>
        </div>
        <div>
          <dt>Power</dt>
          <dd>{card.card_power ?? '-'}</dd>
        </div>
        <div>
          <dt>Counter</dt>
          <dd>{card.counter_amount ?? '-'}</dd>
        </div>
      </dl>
      <Button fullWidth onClick={() => onAdd(card)} variant="secondary">
        {actionLabel}
      </Button>
    </article>
  );
}
