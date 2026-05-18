import type { CardDto } from '../../types/cards';
import { isLeaderCard } from './utils/deckValidation';

interface CardTileProps {
  card: CardDto;
  quantity: number;
  isSelectedLeader: boolean;
  onAddCard: (card: CardDto) => void;
  onSetLeader: (card: CardDto) => void;
  onPreviewCard: (card: CardDto) => void;
}

export function CardTile({
  card,
  isSelectedLeader,
  onAddCard,
  onPreviewCard,
  onSetLeader,
  quantity,
}: CardTileProps) {
  const isLeader = isLeaderCard(card);
  const maxQuantity = isLeader ? 1 : 4;
  const currentQuantity = isLeader ? (isSelectedLeader ? 1 : 0) : quantity;
  const canAdd = currentQuantity < maxQuantity;
  const actionLabel = isLeader ? `Set ${card.card_name} as leader` : `Add ${card.card_name} to deck`;
  const disabledLabel = isLeader
    ? `${card.card_name} is already selected as leader`
    : `Maximum copies reached for ${card.card_name}`;
  const counterLabel = `${currentQuantity}/${maxQuantity}`;
  const tileTitle = canAdd ? actionLabel : disabledLabel;

  const addCard = (): void => {
    onPreviewCard(card);

    if (!canAdd) {
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
        !canAdd ? 'card-tile--maxed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => onPreviewCard(card)}
      title={tileTitle}
    >
      {isLeader && <span className="card-tile__leader-badge">Leader</span>}
      {!isLeader && <span className="card-tile__count-badge">{counterLabel}</span>}
      <button
        aria-label={canAdd ? actionLabel : `Cannot add ${card.card_name}`}
        className="card-tile__add"
        disabled={!canAdd}
        onClick={addCard}
        onFocus={() => onPreviewCard(card)}
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
    </article>
  );
}
