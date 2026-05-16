import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { CardDto } from '../../types/cards';
import { isLeaderCard } from './utils/deckValidation';

interface CardInspectModalProps {
  card: CardDto | null;
  onAddCard: (card: CardDto) => void;
  onClose: () => void;
}

export function CardInspectModal({ card, onAddCard, onClose }: CardInspectModalProps) {
  const actionLabel = isLeaderCard(card) ? 'Set leader' : 'Add card';

  const handleAction = (): void => {
    if (!card) {
      return;
    }

    onAddCard(card);
    onClose();
  };

  return (
    <Modal
      className="card-inspect-modal"
      footer={
        card && (
          <Button fullWidth onClick={handleAction} variant="secondary">
            {actionLabel}
          </Button>
        )
      }
      onClose={onClose}
      open={Boolean(card)}
      title={card?.card_name ?? 'Card'}
    >
      {card && (
        <div className="card-inspect">
          <div className="card-inspect__image">
            {card.card_image ? (
              <img alt={`${card.card_name} card art`} src={card.card_image} />
            ) : (
              <span>{card.card_type || 'Card'}</span>
            )}
          </div>

          <div className="card-inspect__details">
            <div className="card-inspect__heading">
              <span className="card-tile__id">{card.card_set_id}</span>
              <h3>{card.card_name}</h3>
            </div>
            <dl className="card-inspect__meta">
              <div>
                <dt>Set</dt>
                <dd>{card.set_id || '-'}</dd>
              </div>
              <div>
                <dt>Color</dt>
                <dd>{card.card_color || '-'}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{card.card_type || '-'}</dd>
              </div>
              <div>
                <dt>Cost</dt>
                <dd>{card.card_cost ?? '-'}</dd>
              </div>
              <div>
                <dt>Power</dt>
                <dd>{card.card_power ?? '-'}</dd>
              </div>
              <div>
                <dt>Counter</dt>
                <dd>{card.counter_amount ?? '-'}</dd>
              </div>
              <div>
                <dt>Rarity</dt>
                <dd>{card.rarity || '-'}</dd>
              </div>
              <div>
                <dt>Attribute</dt>
                <dd>{card.attribute || '-'}</dd>
              </div>
            </dl>
            <section className="card-inspect__effect" aria-label="Card effect">
              <span>Effect</span>
              <p className="card-inspect__text">{card.card_text || 'No card text available.'}</p>
            </section>
          </div>
        </div>
      )}
    </Modal>
  );
}
