import type { ReactNode } from 'react';

import { Button } from './Button';

interface DrawerProps {
  open: boolean;
  title: string;
  children: ReactNode;
  side?: 'left' | 'right';
  onClose: () => void;
}

export function Drawer({ children, onClose, open, side = 'right', title }: DrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-overlay" role="presentation">
      <aside
        aria-modal="true"
        className={`ui-drawer ui-drawer--${side}`}
        role="dialog"
      >
        <header className="ui-dialog-header">
          <h2>{title}</h2>
          <Button aria-label="Close drawer" onClick={onClose} variant="ghost">
            Close
          </Button>
        </header>
        <div className="ui-dialog-body">{children}</div>
      </aside>
    </div>
  );
}
