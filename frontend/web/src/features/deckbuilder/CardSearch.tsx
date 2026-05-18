import { Button } from '../../components/ui/Button';

interface CardSearchProps {
  onOpenFilters: () => void;
  onSearchChange: (searchText: string) => void;
  activeFilterCount: number;
  searchText: string;
}

export function CardSearch({
  activeFilterCount,
  onSearchChange,
  onOpenFilters,
  searchText,
}: CardSearchProps) {
  const filterButtonLabel =
    activeFilterCount > 0 ? `Filters (${activeFilterCount} active)` : 'Filters';

  return (
    <section className="card-search">
      <div className="card-search__controls">
        <div className="field">
          <input
            aria-label="Search cards"
            id="deckbuilderSearch"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Name or card ID"
            value={searchText}
          />
        </div>
        <Button
          aria-label={filterButtonLabel}
          className="deckbuilder-filter-open-button"
          onClick={onOpenFilters}
          variant="ghost"
        >
          FILTERS
        </Button>
      </div>
    </section>
  );
}
