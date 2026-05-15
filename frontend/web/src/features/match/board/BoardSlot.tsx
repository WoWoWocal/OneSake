import type { CardInstanceDto } from '../../../types/realtime';
import type { BoardSlotDefinition } from './boardTypes';
import { MatchCardView } from './MatchCardView';

interface BoardSlotProps {
  slot: BoardSlotDefinition;
  count?: number;
  active?: boolean;
  card?: CardInstanceDto;
  filled?: boolean;
  onInspectCard?: (card: CardInstanceDto) => void;
}

function toSlotClassName(kind: BoardSlotDefinition['kind']): string {
  return kind.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export function BoardSlot({
  active = false,
  card,
  count,
  filled = false,
  onInspectCard,
  slot,
}: BoardSlotProps) {
  const hasCount = typeof count === 'number';

  return (
    <div
      aria-label={`${slot.side} ${slot.label}`}
      className={[
        'board-slot',
        `board-slot--${toSlotClassName(slot.kind)}`,
        `board-slot--${slot.side}`,
        filled ? 'board-slot--filled' : '',
        active ? 'board-slot--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        width: `${slot.width}%`,
        height: `${slot.height}%`,
      }}
    >
      <span className="board-slot__label">{slot.label}</span>
      {card ? (
        <MatchCardView
          ariaLabel={`Inspect ${card.name} (${card.cardId})`}
          card={card}
          clickable={Boolean(onInspectCard)}
          onClick={() => onInspectCard?.(card)}
          size="slot"
        />
      ) : (
        <>
          {hasCount && (
            <span className={`board-slot-stack board-slot-stack--${toSlotClassName(slot.kind)}`}>
              <span className="board-slot-stack__cards" aria-hidden="true" />
              <strong className="board-slot__count">{count}</strong>
              <small>{slot.label}</small>
            </span>
          )}
          {!hasCount && filled && <strong className="board-slot__count">Ready</strong>}
        </>
      )}
      <span className="board-slot__debug">{slot.id}</span>
    </div>
  );
}
