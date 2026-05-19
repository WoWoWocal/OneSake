import type { CSSProperties } from 'react';

interface DeckStackCardProps {
  cardId: string;
  image?: string;
  isEmpty?: boolean;
  isLeader?: boolean;
  name: string;
  onPreview?: () => void;
  onRemove?: () => void;
  quantity?: number;
}

function CardFace({
  cardId,
  image,
  name,
}: {
  cardId: string;
  image?: string;
  name: string;
}) {
  if (image) {
    return <img alt={`${name} card`} loading="lazy" src={image} />;
  }

  return (
    <span className="deckbuilder-deck-stack__placeholder">
      <strong>{name}</strong>
      {cardId && <small>{cardId}</small>}
    </span>
  );
}

function getLayerStyle(zIndex: number): CSSProperties {
  return {
    '--deck-stack-layer-z': zIndex,
  } as CSSProperties;
}

export function DeckStackCard({
  cardId,
  image,
  isEmpty = false,
  isLeader = false,
  name,
  onPreview,
  onRemove,
  quantity = 1,
}: DeckStackCardProps) {
  const safeQuantity = Math.max(1, quantity);
  const ghostCount = isLeader || isEmpty ? 0 : Math.min(Math.max(safeQuantity - 1, 0), 3);
  const frontLayerIndex = ghostCount;
  const className = [
    'deckbuilder-deck-stack',
    isLeader ? 'deckbuilder-deck-stack--leader' : '',
    isEmpty ? 'deckbuilder-deck-stack--empty-leader' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const content = (
    <span className="deckbuilder-deck-stack__layers">
      {Array.from({ length: ghostCount }, (_, index) => (
        <span
          aria-hidden="true"
          className={`deckbuilder-deck-stack__layer deckbuilder-deck-stack__layer--ghost deckbuilder-deck-stack__layer--index-${index}`}
          key={index}
          style={getLayerStyle(index + 1)}
        >
          <CardFace cardId={cardId} image={image} name={name} />
        </span>
      ))}
      <span
        className={`deckbuilder-deck-stack__layer deckbuilder-deck-stack__layer--front deckbuilder-deck-stack__layer--index-${frontLayerIndex}`}
        style={getLayerStyle(10)}
      >
        <CardFace cardId={cardId} image={image} name={name} />
        {!isEmpty && (
          <strong
            className={`deckbuilder-deck-stack__quantity ${
              safeQuantity === 4
                ? 'deckbuilder-deck-stack__quantity--max'
                : 'deckbuilder-deck-stack__quantity--partial'
            }`}
          >
            {safeQuantity}
          </strong>
        )}
      </span>
    </span>
  );

  if (isLeader || isEmpty) {
    return (
      <div
        aria-label={isLeader ? `Selected leader ${name}` : 'No leader selected'}
        className={className}
        onFocus={onPreview}
        onMouseEnter={onPreview}
        tabIndex={onPreview && !isEmpty ? 0 : undefined}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      aria-label={`Remove one copy of ${name}`}
      className={className}
      onClick={onRemove}
      onFocus={onPreview}
      onMouseEnter={onPreview}
      title={`Remove one ${name}`}
      type="button"
    >
      {content}
    </button>
  );
}
