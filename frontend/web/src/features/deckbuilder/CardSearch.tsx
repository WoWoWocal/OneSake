import { Button } from '../../components/ui/Button';
import { formatCardColors } from './utils/deckValidation';

interface CardSearchProps {
  onOpenFilters: () => void;
  activeFilterCount: number;
  leaderColors: string[];
  leaderName?: string;
}

export function CardSearch({
  activeFilterCount,
  leaderColors,
  leaderName,
  onOpenFilters,
}: CardSearchProps) {
  const autoFilterActive = leaderColors.length > 0;

  return (
    <section className="panel card-search">
      <div>
        <h2>Filters</h2>
        {activeFilterCount > 0 && <p>{activeFilterCount} active</p>}
        {autoFilterActive ? (
          <p className="auto-filter-note">
            Leader active: {formatCardColors(leaderColors)}
            {leaderName ? ` / ${leaderName}` : ''}
            . Only playable cards are shown; leader cards are hidden.
          </p>
        ) : (
          <p className="auto-filter-note auto-filter-note--empty">
            Choose a leader to filter playable cards.
          </p>
        )}
      </div>
      <Button onClick={onOpenFilters} variant="ghost">
        Open filters
      </Button>
    </section>
  );
}
