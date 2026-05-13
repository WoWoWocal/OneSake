import { Button } from '../../components/ui/Button';
import type { CardDto } from '../../types/cards';
import { isLeaderCardType } from './utils/deckValidation';

interface CardTileProps {
  card: CardDto;
  onSelect: (card: CardDto) => void;
  onAdd: (card: CardDto) => void;
}

export function CardTile({ card, onAdd, onSelect }: CardTileProps) {
  const actionLabel = isLeaderCardType(card.card_type) ? 'Set Leader' : 'Add Card';

  return (
    <article className="panel card-tile">
      <button className="card-tile__inspect" onClick={() => onSelect(card)} type="button">
        <div className="card-tile-image">
          {card.card_image ? (
            <img alt={`${card.card_name} card art`} loading="lazy" src={card.card_image} />
          ) : (
            <span>{card.card_type || 'Card'}</span>
          )}
        </div>
      </button>
      <div className="card-tile-actions">
        <Button className="card-action-button" fullWidth onClick={() => onAdd(card)} variant="secondary">
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}
