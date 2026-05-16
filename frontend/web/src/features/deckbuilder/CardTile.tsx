import type { CardDto } from '../../types/cards';
import { isLeaderCard } from './utils/deckValidation';

interface CardTileProps {
  card: CardDto;
  quantity: number;
  isSelectedLeader: boolean;
  onSelect: (card: CardDto) => void;
  onAddCard: (card: CardDto) => void;
  onRemoveCard: (cardId: string) => void;
  onSetLeader: (card: CardDto) => void;
  onRemoveLeader: () => void;
}

export function CardTile({
  card,
  isSelectedLeader,
  onAddCard,
  onRemoveCard,
  onRemoveLeader,
  onSelect,
  onSetLeader,
  quantity,
}: CardTileProps) {
  const isLeader = isLeaderCard(card);
  const maxQuantity = isLeader ? 1 : 4;
  const currentQuantity = isLeader ? (isSelectedLeader ? 1 : 0) : quantity;
  const canDecrease = currentQuantity > 0;
  const canIncrease = currentQuantity < maxQuantity;

  const decreaseQuantity = (): void => {
    if (!canDecrease) {
      return;
    }

    if (isLeader) {
      onRemoveLeader();
      return;
    }

    onRemoveCard(card.card_set_id);
  };

  const increaseQuantity = (): void => {
    if (!canIncrease) {
      return;
    }

    if (isLeader) {
      onSetLeader(card);
      return;
    }

    onAddCard(card);
  };

  return (
    <article
      className={[
        'panel',
        'card-tile',
        isLeader ? 'card-tile--leader' : '',
        isSelectedLeader ? 'card-tile--selected-leader' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLeader && <span className="card-tile__leader-badge">Leader</span>}
      <button
        aria-label={`View details for ${card.card_name}`}
        className="card-tile__inspect"
        onClick={() => onSelect(card)}
        type="button"
      >
        <div className="card-tile-image">
          {card.card_image ? (
            <img alt={`${card.card_name} card art`} loading="lazy" src={card.card_image} />
          ) : (
            <span>{card.card_type || 'Card'}</span>
          )}
        </div>
      </button>
      <div className="card-quantity-controls" aria-label={`${card.card_name} quantity`}>
        <button
          aria-label={isLeader ? `Remove ${card.card_name} as leader` : `Remove one ${card.card_name}`}
          className="card-quantity-button card-quantity-button--minus"
          disabled={!canDecrease}
          onClick={decreaseQuantity}
          type="button"
        >
          -
        </button>
        <strong className="card-quantity-value">
          {currentQuantity}/{maxQuantity}
        </strong>
        <button
          aria-label={isLeader ? `Set ${card.card_name} as leader` : `Add one ${card.card_name}`}
          className="card-quantity-button card-quantity-button--plus"
          disabled={!canIncrease}
          onClick={increaseQuantity}
          type="button"
        >
          +
        </button>
      </div>
    </article>
  );
}
