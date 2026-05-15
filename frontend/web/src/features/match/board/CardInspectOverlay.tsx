import { useEffect } from 'react';

import type { CardInstanceDto } from '../../../types/realtime';
import { MatchCardView } from './MatchCardView';

interface CardInspectOverlayProps {
  card: CardInstanceDto | null;
  onClose: () => void;
}

export function CardInspectOverlay({ card, onClose }: CardInspectOverlayProps) {
  useEffect(() => {
    if (!card) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [card, onClose]);

  if (!card) {
    return null;
  }

  return (
    <div className="card-inspect-overlay" role="presentation" onMouseDown={onClose}>
      <section
        aria-label={`${card.name} card details`}
        aria-modal="true"
        className="card-inspect-overlay__dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="card-inspect-overlay__header">
          <div>
            <span>Card Inspect</span>
            <h2>{card.name}</h2>
          </div>
          <button aria-label="Close card inspect" onClick={onClose} type="button">
            Close
          </button>
        </header>
        <MatchCardView card={card} size="inspect" />
        <dl className="card-inspect-overlay__meta">
          <div>
            <dt>Card ID</dt>
            <dd>{card.cardId}</dd>
          </div>
          <div>
            <dt>Instance</dt>
            <dd>{card.instanceId}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
