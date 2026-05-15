import type { ReactNode } from 'react';

import { Button } from './Button';

interface BottomSheetProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
}

export function BottomSheet({ children, footer, onClose, open, title }: BottomSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-sheet-backdrop" role="presentation">
      <section aria-label={title} aria-modal="true" className="ui-bottom-sheet" role="dialog">
        <header className="ui-dialog-header">
          <h2>{title}</h2>
          {onClose && (
            <Button aria-label="Close sheet" onClick={onClose} variant="ghost">
              Close
            </Button>
          )}
        </header>
        <div className="ui-dialog-body">{children}</div>
        {footer && <footer className="ui-dialog-footer">{footer}</footer>}
      </section>
    </div>
  );
}
