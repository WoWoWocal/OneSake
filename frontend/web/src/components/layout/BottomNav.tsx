export type AppSection = 'match' | 'deckbuilder' | 'tools' | 'profile';

interface BottomNavItem {
  id: AppSection;
  label: string;
}

const NAV_ITEMS: BottomNavItem[] = [
  { id: 'match', label: 'Match' },
  { id: 'deckbuilder', label: 'Deckbuilder' },
  { id: 'tools', label: 'Tools' },
  { id: 'profile', label: 'Profile' },
];

interface BottomNavProps {
  activeSection: AppSection;
  onChange: (section: AppSection) => void;
}

export function BottomNav({ activeSection, onChange }: BottomNavProps) {
  return (
    <nav aria-label="Main navigation" className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          aria-current={item.id === activeSection ? 'page' : undefined}
          className="bottom-nav__item"
          onClick={() => onChange(item.id)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
