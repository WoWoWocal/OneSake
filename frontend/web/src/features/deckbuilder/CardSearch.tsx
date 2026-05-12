import { Button } from '../../components/ui/Button';

interface CardSearchProps {
  onOpenFilters: () => void;
  activeFilterCount: number;
}

export function CardSearch({ activeFilterCount, onOpenFilters }: CardSearchProps) {
  return (
    <section className="panel card-search">
      <div>
        <h2>Filters</h2>
        <p>{activeFilterCount > 0 ? `${activeFilterCount} active` : 'Search and narrow cards'}</p>
      </div>
      <Button onClick={onOpenFilters} variant="ghost">
        Open filters
      </Button>
    </section>
  );
}
