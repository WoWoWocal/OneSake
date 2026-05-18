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
  return (
    <section className="card-search">
      <div>
        <h2>Filters</h2>
        {activeFilterCount > 0 && <p>{activeFilterCount} active</p>}
      </div>
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
        <Button onClick={onOpenFilters} variant="ghost">
          Open filters
        </Button>
        <button className="deckbuilder-sort-chip" type="button" aria-pressed="true">
          Sort by color & cost
        </button>
      </div>
    </section>
  );
}
