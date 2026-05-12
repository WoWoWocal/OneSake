export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel: string;
}

export function Tabs({ activeId, ariaLabel, items, onChange }: TabsProps) {
  return (
    <div aria-label={ariaLabel} className="ui-tabs" role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          aria-selected={item.id === activeId}
          className="ui-tab"
          disabled={item.disabled}
          onClick={() => onChange(item.id)}
          role="tab"
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
