import { useEffect, useState } from 'react';

import { Button } from '../../../components/ui/Button';
import type { Deck } from '../../../types/decks';
import { getTotalCards } from '../../deckbuilder/utils/deckValidation';
import { maxSimulations, runProbabilitySimulation } from './probabilityLogic';
import type { ProbabilityResult } from './probabilityTypes';

interface ProbabilityCalculatorProps {
  deck: Deck | null;
}

export function ProbabilityCalculator({ deck }: ProbabilityCalculatorProps) {
  const [targetCardId, setTargetCardId] = useState('');
  const [minimumHits, setMinimumHits] = useState(1);
  const [handSize, setHandSize] = useState(5);
  const [simulations, setSimulations] = useState(10000);
  const [result, setResult] = useState<ProbabilityResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  const totalCards = deck ? getTotalCards(deck.cards) : 0;
  const canCalculate = Boolean(deck && targetCardId && totalCards >= handSize);

  useEffect(() => {
    setTargetCardId(deck?.cards[0]?.cardId ?? '');
    setResult(null);
  }, [deck]);

  const calculate = (): void => {
    if (!deck || !canCalculate) {
      return;
    }

    const normalizedSimulations = Math.min(maxSimulations, Math.max(1, simulations));
    setCalculating(true);
    window.setTimeout(() => {
      const nextResult = runProbabilitySimulation(deck, {
        targetCardId,
        minimumHits,
        handSize,
        simulations: normalizedSimulations,
      });
      setSimulations(nextResult.simulations);
      setResult(nextResult);
      setCalculating(false);
    }, 0);
  };

  if (!deck) {
    return (
      <section className="panel tools-panel probability-calculator">
        <h2>Probability Calculator</h2>
        <p>Select a saved deck to calculate opening-hand odds.</p>
      </section>
    );
  }

  return (
    <section className="panel tools-panel probability-calculator">
      <div>
        <h2>Probability Calculator</h2>
        <p>Chance to draw at least {minimumHits} copy in your selected hand size.</p>
      </div>

      {totalCards < handSize && (
        <div className="status-panel status-panel--error">
          This deck has {totalCards} cards, but hand size is {handSize}.
        </div>
      )}

      <div className="probability-form">
        <label className="field" htmlFor="targetCardId">
          Target Card
          <select
            id="targetCardId"
            onChange={(event) => {
              setTargetCardId(event.target.value);
              setResult(null);
            }}
            value={targetCardId}
          >
            {deck.cards.map((card) => (
              <option key={card.cardId} value={card.cardId}>
                {card.name} ({card.cardId})
              </option>
            ))}
          </select>
        </label>

        <label className="field" htmlFor="minimumHits">
          Minimum Hits
          <input
            id="minimumHits"
            min={1}
            onChange={(event) => {
              setMinimumHits(Number(event.target.value));
              setResult(null);
            }}
            type="number"
            value={minimumHits}
          />
        </label>

        <label className="field" htmlFor="handSize">
          Hand Size
          <input
            id="handSize"
            min={1}
            onChange={(event) => {
              setHandSize(Number(event.target.value));
              setResult(null);
            }}
            type="number"
            value={handSize}
          />
        </label>

        <label className="field" htmlFor="simulations">
          Simulations
          <input
            id="simulations"
            max={maxSimulations}
            min={1}
            onChange={(event) => {
              setSimulations(Number(event.target.value));
              setResult(null);
            }}
            type="number"
            value={simulations}
          />
        </label>
      </div>

      <Button disabled={!canCalculate || calculating} onClick={calculate}>
        {calculating ? 'Calculating...' : 'Calculate'}
      </Button>

      {result && (
        <div className="probability-result">
          <span>Chance</span>
          <strong>{result.probabilityPercent.toFixed(1)}%</strong>
          <p>
            {result.hits}/{result.simulations} simulations drew at least{' '}
            {result.minimumHits} copy of {result.targetCardId} in {result.handSize} cards.
          </p>
        </div>
      )}
    </section>
  );
}
