import type { BoardSlotDefinition } from './boardTypes';

interface BoardSlotProps {
  slot: BoardSlotDefinition;
  count?: number;
  active?: boolean;
  filled?: boolean;
}

function toSlotClassName(kind: BoardSlotDefinition['kind']): string {
  return kind.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export function BoardSlot({ active = false, count, filled = false, slot }: BoardSlotProps) {
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
      {hasCount && <strong className="board-slot__count">{count}</strong>}
      {!hasCount && filled && <strong className="board-slot__count">Ready</strong>}
    </div>
  );
}
