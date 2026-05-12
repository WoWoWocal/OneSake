interface CardSearchProps {
  searchText: string;
  onSearchTextChange: (value: string) => void;
}

export function CardSearch({ onSearchTextChange, searchText }: CardSearchProps) {
  return (
    <section className="panel card-search">
      <label htmlFor="cardSearch">Card search</label>
      <input
        id="cardSearch"
        onChange={(event) => onSearchTextChange(event.target.value)}
        placeholder="Search by name or card id"
        value={searchText}
      />
    </section>
  );
}
