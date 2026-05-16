import type { ReactNode } from 'react';

import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  onClose: () => void;
}

export function Modal({ children, className = '', footer, onClose, open, title }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-overlay" role="presentation">
      <section
        aria-label={title}
        aria-modal="true"
        className={['ui-modal', className].filter(Boolean).join(' ')}
        role="dialog"
      >
        <header className="ui-dialog-header">
          <h2>{title}</h2>
          <Button aria-label="Close modal" onClick={onClose} variant="ghost">
            Close
          </Button>
        </header>
        <div className="ui-dialog-body">{children}</div>
        {footer && <footer className="ui-dialog-footer">{footer}</footer>}
      </section>
    </div>
  );
}
