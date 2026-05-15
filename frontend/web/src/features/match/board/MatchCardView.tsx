import type { CardInstanceDto } from '../../../types/realtime';

interface MatchCardViewProps {
  card: CardInstanceDto;
  size: 'slot' | 'hand' | 'inspect';
  ariaLabel?: string;
  clickable?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function MatchCardView({
  ariaLabel,
  card,
  clickable = false,
  disabled = false,
  onClick,
  size,
}: MatchCardViewProps) {
  const className = [
    'match-card-view',
    `match-card-view--${size}`,
    clickable ? 'match-card-view--clickable' : '',
    disabled ? 'match-card-view--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="match-card-view__frame" aria-hidden="true" />
      <span className="match-card-view__art" aria-hidden="true">
        <span>{card.cardId}</span>
      </span>
      <span className="match-card-view__body">
        <strong>{card.name}</strong>
        <small>{card.cardId}</small>
      </span>
    </>
  );

  if (clickable) {
    return (
      <button
        aria-label={ariaLabel ?? `${card.name} (${card.cardId})`}
        className={className}
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    );
  }

  return <span className={className}>{content}</span>;
}
