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
  const filterButtonLabel = activeFilterCount > 0 ? `Open filters (${activeFilterCount})` : 'Open filters';

  return (
    <section className="card-search">
      <div className="card-search__controls">
        <label className="field" htmlFor="deckbuilderSearch">
          Search
          <input
            id="deckbuilderSearch"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Name or card ID"
            value={searchText}
          />
        </label>
        <Button className="deckbuilder-filter-open-button" onClick={onOpenFilters} variant="ghost">
          {filterButtonLabel}
        </Button>
        <button className="deckbuilder-sort-chip" type="button" aria-pressed="true">
          Sort by color & cost
        </button>
      </div>
    </section>
  );
}
