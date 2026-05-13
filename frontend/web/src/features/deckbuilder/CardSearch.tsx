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
        <p>{activeFilterCount > 0 ? `${activeFilterCount} active` : 'Search and narrow cards'}</p>
        {autoFilterActive && (
          <p className="auto-filter-note">
            Auto-filter active: {formatCardColors(leaderColors)}
            {leaderName ? ` / ${leaderName}` : ''}
          </p>
        )}
      </div>
      <Button onClick={onOpenFilters} variant="ghost">
        Open filters
      </Button>
    </section>
  );
}
