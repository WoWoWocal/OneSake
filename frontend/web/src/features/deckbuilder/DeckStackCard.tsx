interface DeckStackCardProps {
  cardId: string;
  image?: string;
  isEmpty?: boolean;
  isLeader?: boolean;
  name: string;
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

export function DeckStackCard({
  cardId,
  image,
  isEmpty = false,
  isLeader = false,
  name,
  onRemove,
  quantity = 1,
}: DeckStackCardProps) {
  const safeQuantity = Math.max(1, quantity);
  const ghostCount = isLeader || isEmpty ? 0 : Math.min(Math.max(safeQuantity - 1, 0), 3);
  const className = [
    'deckbuilder-deck-stack',
    isLeader ? 'deckbuilder-deck-stack--leader' : '',
    isEmpty ? 'deckbuilder-deck-stack--empty-leader' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      {isLeader && <span className="deckbuilder-deck-stack__label">Leader</span>}
      {Array.from({ length: ghostCount }, (_, index) => (
        <span
          aria-hidden="true"
          className={`deckbuilder-deck-stack__ghost deckbuilder-deck-stack__ghost--${index + 1}`}
          key={index}
        >
          <CardFace cardId={cardId} image={image} name={name} />
        </span>
      ))}
      <span className="deckbuilder-deck-stack__card">
        <CardFace cardId={cardId} image={image} name={name} />
      </span>
      {!isEmpty && <strong className="deckbuilder-deck-stack__quantity">{safeQuantity}</strong>}
    </>
  );

  if (isLeader || isEmpty) {
    return (
      <div
        aria-label={isLeader ? `Selected leader ${name}` : 'No leader selected'}
        className={className}
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
      title={`Remove one ${name}`}
      type="button"
    >
      {content}
    </button>
  );
}
