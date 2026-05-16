import { Button } from '../../components/ui/Button';
import { playableColors } from './utils/deckValidation';

interface ColorPaletteFilterProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

function getColorClass(color: string): string {
  return color.toLowerCase();
}

export function ColorPaletteFilter({ onChange, selectedColors }: ColorPaletteFilterProps) {
  const toggleColor = (color: string): void => {
    if (selectedColors.includes(color)) {
      onChange(selectedColors.filter((selectedColor) => selectedColor !== color));
      return;
    }

    onChange([...selectedColors, color]);
  };

  return (
    <section className="color-palette-filter" aria-label="Color filter">
      <div className="color-palette-filter__header">
        <div>
          <strong>Colors</strong>
          {selectedColors.length > 0 && <span>{selectedColors.join(' / ')}</span>}
        </div>
        {selectedColors.length > 0 && (
          <Button onClick={() => onChange([])} variant="ghost">
            Clear colors
          </Button>
        )}
      </div>
      <div className="color-palette-filter__buttons">
        {playableColors.map((color) => {
          const isActive = selectedColors.includes(color);

          return (
            <button
              aria-pressed={isActive}
              className={`color-filter-button color-filter-button--${getColorClass(color)} ${
                isActive ? 'color-filter-button--active' : ''
              }`}
              key={color}
              onClick={() => toggleColor(color)}
              type="button"
            >
              <span aria-hidden="true" />
              {color}
            </button>
          );
        })}
      </div>
    </section>
  );
}
