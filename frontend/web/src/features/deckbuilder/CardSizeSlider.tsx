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
      <div className="card-size-slider__track">
        <input
          aria-label="Cards per row"
          className="card-size-slider-control"
          max={maxCardsPerRow}
          min={minCardsPerRow}
          onChange={(event) => onChange(clampCardsPerRow(Number(event.target.value)))}
          step={1}
          type="range"
          value={safeCardsPerRow}
        />
        <span className="card-size-slider__ticks" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
      </div>
    </section>
  );
}
