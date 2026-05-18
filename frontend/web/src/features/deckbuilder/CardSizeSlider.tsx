interface CardSizeSliderProps {
  cardsPerRow: number;
  onChange: (value: number) => void;
}

const minCardsPerRow = 7;
const maxCardsPerRow = 10;
const defaultCardsPerRow = 8;

function clampCardsPerRow(value: number): number {
  if (!Number.isFinite(value)) {
    return defaultCardsPerRow;
  }

  return Math.min(maxCardsPerRow, Math.max(minCardsPerRow, Math.round(value)));
}

export function CardSizeSlider({ cardsPerRow, onChange }: CardSizeSliderProps) {
  const safeCardsPerRow = clampCardsPerRow(cardsPerRow);

  return (
    <section className="card-size-slider" aria-label="Card grid size">
      <div className="card-size-slider-header">
        <strong>Cards per row</strong>
        <span>
          {safeCardsPerRow} {safeCardsPerRow === 1 ? 'card' : 'cards'}
        </span>
      </div>
      <input
        className="card-size-slider-control"
        max={maxCardsPerRow}
        min={minCardsPerRow}
        onChange={(event) => onChange(clampCardsPerRow(Number(event.target.value)))}
        step={1}
        type="range"
        value={safeCardsPerRow}
      />
    </section>
  );
}
