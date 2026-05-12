import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';

export interface CardFilters {
  searchText: string;
  color: string;
  cardType: string;
  cost: string;
  counter: string;
}

interface CardFilterOptions {
  colors: string[];
  cardTypes: string[];
  costs: string[];
  counters: string[];
}

interface CardFilterSheetProps {
  open: boolean;
  filters: CardFilters;
  options: CardFilterOptions;
  onChange: (filters: CardFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
}

function renderOptions(values: string[]) {
  return values.map((value) => (
    <option key={value} value={value}>
      {value}
    </option>
  ));
}

export function CardFilterSheet({
  filters,
  onApply,
  onChange,
  onClose,
  onReset,
  open,
  options,
}: CardFilterSheetProps) {
  return (
    <BottomSheet
      footer={
        <div className="filter-actions">
          <Button fullWidth onClick={onReset} variant="ghost">
            Reset
          </Button>
          <Button fullWidth onClick={onApply}>
            Apply
          </Button>
        </div>
      }
      onClose={onClose}
      open={open}
      title="Card filters"
    >
      <div className="filter-grid">
        <label className="field" htmlFor="cardSearch">
          Search
          <input
            id="cardSearch"
            onChange={(event) => onChange({ ...filters, searchText: event.target.value })}
            placeholder="Name or card ID"
            value={filters.searchText}
          />
        </label>

        <label className="field" htmlFor="cardColor">
          Color
          <select
            id="cardColor"
            onChange={(event) => onChange({ ...filters, color: event.target.value })}
            value={filters.color}
          >
            <option value="">Any color</option>
            {renderOptions(options.colors)}
          </select>
        </label>

        <label className="field" htmlFor="cardType">
          Type
          <select
            id="cardType"
            onChange={(event) => onChange({ ...filters, cardType: event.target.value })}
            value={filters.cardType}
          >
            <option value="">Any type</option>
            {renderOptions(options.cardTypes)}
          </select>
        </label>

        <label className="field" htmlFor="cardCost">
          Cost
          <select
            id="cardCost"
            onChange={(event) => onChange({ ...filters, cost: event.target.value })}
            value={filters.cost}
          >
            <option value="">Any cost</option>
            {renderOptions(options.costs)}
          </select>
        </label>

        <label className="field" htmlFor="cardCounter">
          Counter
          <select
            id="cardCounter"
            onChange={(event) => onChange({ ...filters, counter: event.target.value })}
            value={filters.counter}
          >
            <option value="">Any counter</option>
            {renderOptions(options.counters)}
          </select>
        </label>
      </div>
    </BottomSheet>
  );
}
