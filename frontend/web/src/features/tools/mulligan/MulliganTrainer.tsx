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
      counter2000Count: 0,
      eventCount: 0,
      lowCostCount: 0,
      characterCount: 0,
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
      <section className="panel tools-panel tool-card mulligan-trainer">
        <span className="tools-kicker">Practice</span>
        <h2>Mulligan Trainer</h2>
      </section>
    );
  }

  const metricCards = [
    { label: 'Cards', value: drawResult.metrics.cardCount },
    { label: 'Unique IDs', value: drawResult.metrics.uniqueCardIds },
    { label: '2k Counters', value: drawResult.metrics.counter2000Count },
    { label: 'Events', value: drawResult.metrics.eventCount },
    { label: 'Low Cost', value: drawResult.metrics.lowCostCount },
    { label: 'Characters', value: drawResult.metrics.characterCount },
  ];

  const statCards = [
    { label: 'Hands Drawn', value: stats.handsDrawn },
    { label: 'Keeps', value: stats.keeps },
    { label: 'Mulligans', value: stats.mulligans },
    { label: 'Keep Rate', value: formatKeepRate(stats) },
  ];

  return (
    <section className="panel tools-panel tool-card mulligan-trainer">
      <div className="mulligan-header">
        <div>
          <span className="tools-kicker">Practice</span>
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
                <div className="mulligan-card__art" aria-hidden="true">
                  {card.cardId}
                </div>
                <div className="mulligan-card__body">
                  <strong>{card.name}</strong>
                  <span>
                    {card.cardId} / x{card.quantity}
                  </span>
                </div>
                <div className="tag-list mulligan-card__tags">
                  {card.color && <span className="tag-chip">{card.color}</span>}
                  {card.type && <span className="tag-chip">{card.type}</span>}
                  {typeof card.cost === 'number' && (
                    <span className="tag-chip">Cost {card.cost}</span>
                  )}
                  {typeof card.counter === 'number' && card.counter > 0 && (
                    <span className="tag-chip">Counter {card.counter}</span>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mulligan-metrics">
            {metricCards.map((metric) => (
              <div key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
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
        {statCards.map((stat) => (
          <div key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <Button onClick={resetSession} variant="ghost">
        Reset Session
      </Button>
    </section>
  );
}
