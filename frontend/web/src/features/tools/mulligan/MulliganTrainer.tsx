import { useState } from 'react';

import { Button } from '../../../components/ui/Button';
import type { Deck } from '../../../types/decks';
import { getTotalCards } from '../../deckbuilder/utils/deckValidation';
import { drawOpeningHand } from './mulliganLogic';
import type { MulliganDrawResult, MulliganSessionStats } from './mulliganTypes';

interface MulliganTrainerProps {
  deck: Deck | null;
}

const emptyStats: MulliganSessionStats = {
  handsDrawn: 0,
  keeps: 0,
  mulligans: 0,
};

function createEmptyDrawResult(): MulliganDrawResult {
  return {
    hand: [],
    metrics: {
      cardCount: 0,
      uniqueCardIds: 0,
      cardsWithQuantity: [],
    },
    error: '',
  };
}

function formatKeepRate(stats: MulliganSessionStats): string {
  const decisions = stats.keeps + stats.mulligans;
  if (decisions === 0) {
    return '0%';
  }

  return `${Math.round((stats.keeps / decisions) * 100)}%`;
}

export function MulliganTrainer({ deck }: MulliganTrainerProps) {
  const [drawResult, setDrawResult] = useState<MulliganDrawResult>(() => createEmptyDrawResult());
  const [stats, setStats] = useState<MulliganSessionStats>(emptyStats);

  const totalCards = deck ? getTotalCards(deck.cards) : 0;
  const canDraw = Boolean(deck && totalCards >= 5);

  const drawHand = (): void => {
    if (!deck) {
      return;
    }

    const nextDraw = drawOpeningHand(deck);
    setDrawResult(nextDraw);

    if (!nextDraw.error) {
      setStats((currentStats) => ({
        ...currentStats,
        handsDrawn: currentStats.handsDrawn + 1,
      }));
    }
  };

  const recordDecision = (decision: 'keep' | 'mulligan'): void => {
    setStats((currentStats) => ({
      ...currentStats,
      keeps: decision === 'keep' ? currentStats.keeps + 1 : currentStats.keeps,
      mulligans:
        decision === 'mulligan' ? currentStats.mulligans + 1 : currentStats.mulligans,
    }));
    drawHand();
  };

  const resetSession = (): void => {
    setDrawResult(createEmptyDrawResult());
    setStats(emptyStats);
  };

  if (!deck) {
    return (
      <section className="panel tools-panel mulligan-trainer">
        <h2>Mulligan Trainer</h2>
        <p>Select a saved deck to start training opening hands.</p>
      </section>
    );
  }

  return (
    <section className="panel tools-panel mulligan-trainer">
      <div className="mulligan-header">
        <div>
          <h2>Mulligan Trainer</h2>
          <p>
            {deck.name} / {totalCards} cards
          </p>
        </div>
        <Button disabled={!canDraw} onClick={drawHand}>
          Draw Hand
        </Button>
      </div>

      {!canDraw && (
        <div className="status-panel status-panel--error">
          This deck needs at least 5 cards before you can draw an opening hand.
        </div>
      )}

      {drawResult.error && (
        <div className="status-panel status-panel--error">{drawResult.error}</div>
      )}

      {drawResult.hand.length > 0 && (
        <>
          <div className="mulligan-hand">
            {drawResult.hand.map((card) => (
              <article key={card.cardId} className="mulligan-card">
                <strong>{card.name}</strong>
                <span>{card.cardId}</span>
                <span>x{card.quantity}</span>
              </article>
            ))}
          </div>

          <div className="mulligan-metrics">
            <span>Cards: {drawResult.metrics.cardCount}</span>
            <span>Unique IDs: {drawResult.metrics.uniqueCardIds}</span>
            <span>Grouped cards: {drawResult.metrics.cardsWithQuantity.length}</span>
          </div>

          <div className="mulligan-actions">
            <Button onClick={() => recordDecision('keep')}>Keep</Button>
            <Button onClick={() => recordDecision('mulligan')} variant="secondary">
              Mulligan
            </Button>
          </div>
        </>
      )}

      <div className="mulligan-stats">
        <div>
          <span>Hands drawn</span>
          <strong>{stats.handsDrawn}</strong>
        </div>
        <div>
          <span>Keeps</span>
          <strong>{stats.keeps}</strong>
        </div>
        <div>
          <span>Mulligans</span>
          <strong>{stats.mulligans}</strong>
        </div>
        <div>
          <span>Keep rate</span>
          <strong>{formatKeepRate(stats)}</strong>
        </div>
      </div>

      <Button onClick={resetSession} variant="ghost">
        Reset Session
      </Button>
    </section>
  );
}
