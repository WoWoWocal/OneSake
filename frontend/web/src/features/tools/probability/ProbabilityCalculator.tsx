import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '../../../components/ui/Button';
import type { Deck } from '../../../types/decks';
import { getTotalCards } from '../../deckbuilder/utils/deckValidation';
import { maxSimulations, runProbabilitySimulation } from './probabilityLogic';
import { probabilityPresets } from './probabilityPresets';
import type {
  ProbabilityResult,
  ProbabilitySimulationInput,
  ProbabilityWorkerRequest,
  ProbabilityWorkerResponse,
} from './probabilityTypes';

interface ProbabilityCalculatorProps {
  deck: Deck | null;
}

interface QuickTargetGroup {
  label: string;
  cardIds: string[];
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function formatCardTags(card: Deck['cards'][number]): string {
  return [
    card.color,
    card.type,
    typeof card.cost === 'number' ? `Cost ${card.cost}` : '',
  ]
    .filter(Boolean)
    .join(' / ');
}

function getQuickTargetGroups(deck: Deck | null): QuickTargetGroup[] {
  if (!deck) {
    return [];
  }

  const groups: QuickTargetGroup[] = [
    {
      label: '2k counters',
      cardIds: deck.cards
        .filter((card) => card.counter === 2000)
        .map((card) => card.cardId),
    },
    {
      label: 'Events',
      cardIds: deck.cards
        .filter((card) => card.type?.toLowerCase().includes('event'))
        .map((card) => card.cardId),
    },
    {
      label: 'Low cost 1-3',
      cardIds: deck.cards
        .filter((card) => typeof card.cost === 'number' && card.cost >= 1 && card.cost <= 3)
        .map((card) => card.cardId),
    },
    {
      label: 'Characters',
      cardIds: deck.cards
        .filter((card) => card.type?.toLowerCase().includes('character'))
        .map((card) => card.cardId),
    },
  ];

  return groups.filter((group) => group.cardIds.length > 0);
}

function getInputError(
  deck: Deck,
  selectedTargetIds: string[],
  minimumHits: number,
  handSize: number,
  simulations: number,
): string {
  const totalCards = getTotalCards(deck.cards);

  if (selectedTargetIds.length === 0) {
    return 'Select at least one target card.';
  }

  if (totalCards < handSize) {
    return `This deck has ${totalCards} cards, but hand size is ${handSize}.`;
  }

  if (minimumHits > handSize) {
    return 'Minimum hits cannot be greater than hand size.';
  }

  if (!Number.isFinite(simulations) || simulations < 1) {
    return 'Simulations must be at least 1.';
  }

  return '';
}

export function ProbabilityCalculator({ deck }: ProbabilityCalculatorProps) {
  const workerRef = useRef<Worker | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [targetSearch, setTargetSearch] = useState('');
  const [presetName, setPresetName] = useState(probabilityPresets[0].name);
  const [minimumHits, setMinimumHits] = useState(probabilityPresets[0].minimumHits);
  const [handSize, setHandSize] = useState(probabilityPresets[0].handSize);
  const [simulations, setSimulations] = useState(10000);
  const [result, setResult] = useState<ProbabilityResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationMessage, setCalculationMessage] = useState('');
  const [calculationError, setCalculationError] = useState('');

  const totalCards = deck ? getTotalCards(deck.cards) : 0;
  const normalizedSearch = normalizeSearch(targetSearch);
  const visibleCards = useMemo(() => {
    if (!deck) {
      return [];
    }

    return deck.cards.filter(
      (card) =>
        !normalizedSearch ||
        normalizeSearch(card.name).includes(normalizedSearch) ||
        normalizeSearch(card.cardId).includes(normalizedSearch),
    );
  }, [deck, normalizedSearch]);
  const quickTargetGroups = useMemo(() => getQuickTargetGroups(deck), [deck]);
  const inputError = deck
    ? getInputError(deck, selectedTargetIds, minimumHits, handSize, simulations)
    : '';
  const canCalculate = Boolean(deck && !inputError && !calculating);

  useEffect(() => {
    setSelectedTargetIds(deck?.cards[0] ? [deck.cards[0].cardId] : []);
    setTargetSearch('');
    setResult(null);
    setCalculationError('');
    setCalculationMessage('');
  }, [deck]);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
      }
    },
    [],
  );

  const applyPreset = (name: string): void => {
    const preset = probabilityPresets.find((entry) => entry.name === name);
    if (!preset) {
      return;
    }

    setPresetName(preset.name);
    setHandSize(preset.handSize);
    setMinimumHits(preset.minimumHits);
    setResult(null);
  };

  const toggleTarget = (cardId: string): void => {
    setSelectedTargetIds((currentTargets) =>
      currentTargets.includes(cardId)
        ? currentTargets.filter((targetId) => targetId !== cardId)
        : [...currentTargets, cardId],
    );
    setResult(null);
  };

  const applyQuickTargetGroup = (cardIds: string[]): void => {
    setSelectedTargetIds(cardIds);
    setResult(null);
  };

  const finishCalculation = (): void => {
    workerRef.current?.terminate();
    workerRef.current = null;
    fallbackTimerRef.current = null;
    setCalculating(false);
  };

  const runFallbackCalculation = (calculationDeck: Deck, input: ProbabilitySimulationInput): void => {
    // Fallback keeps the feature usable in browsers or test environments where module workers fail.
    setCalculationMessage('Worker unavailable; using UI-thread fallback.');
    fallbackTimerRef.current = window.setTimeout(() => {
      try {
        const nextResult = runProbabilitySimulation(calculationDeck, input);
        setSimulations(nextResult.simulations);
        setResult(nextResult);
        setCalculationError('');
      } catch (error) {
        setCalculationError(
          error instanceof Error ? error.message : 'Probability calculation failed.',
        );
      } finally {
        finishCalculation();
      }
    }, 0);
  };

  const calculate = (): void => {
    if (!deck || !canCalculate) {
      return;
    }

    const normalizedSimulations = Math.min(maxSimulations, Math.max(1, simulations));
    const input: ProbabilitySimulationInput = {
      targetCardIds: selectedTargetIds,
      minimumHits,
      handSize,
      simulations: normalizedSimulations,
      presetName,
    };
    const request: ProbabilityWorkerRequest = {
      type: 'RUN_PROBABILITY',
      deck,
      input,
    };

    workerRef.current?.terminate();
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    setCalculating(true);
    setResult(null);
    setCalculationError('');
    setCalculationMessage('Running simulation in background worker.');

    try {
      const worker = new Worker(new URL('./probabilityWorker.ts', import.meta.url), {
        type: 'module',
      });
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent<ProbabilityWorkerResponse>) => {
        if (workerRef.current !== worker) {
          return;
        }

        if (event.data.type === 'PROBABILITY_RESULT') {
          setSimulations(event.data.result.simulations);
          setResult(event.data.result);
          setCalculationMessage('Calculation complete.');
          setCalculationError('');
        } else {
          setCalculationError(event.data.message);
          setCalculationMessage('');
        }

        finishCalculation();
      };

      worker.onerror = () => {
        if (workerRef.current !== worker) {
          return;
        }

        setCalculationError('Probability worker failed.');
        setCalculationMessage('');
        finishCalculation();
      };

      worker.postMessage(request);
    } catch {
      runFallbackCalculation(deck, input);
    }
  };

  const cancelCalculation = (): void => {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    setCalculating(false);
    setCalculationError('');
    setCalculationMessage('Calculation cancelled.');
  };

  if (!deck) {
    return (
      <section className="panel tools-panel tool-card probability-calculator">
        <span className="tools-kicker">Odds</span>
        <h2>Probability Calculator</h2>
      </section>
    );
  }

  return (
    <section className="panel tools-panel tool-card probability-calculator">
      <div className="tool-card__header">
        <span className="tools-kicker">Odds</span>
        <h2>Probability Calculator</h2>
        <p>
          Chance to draw at least {minimumHits} card from selected targets in {handSize} cards.
        </p>
      </div>

      <div className="probability-sections">
        <section className="probability-section">
          <div className="probability-section__title">
            <h3>Target Selection</h3>
            <span>{selectedTargetIds.length} selected</span>
          </div>

          <label className="field" htmlFor="targetSearch">
            Target search
            <input
              id="targetSearch"
              onChange={(event) => setTargetSearch(event.target.value)}
              placeholder="Search name or card ID"
              value={targetSearch}
            />
          </label>

          <div className="probability-target-summary">
            {selectedTargetIds.length} selected / {deck.cards.length} deck entries
          </div>

          {quickTargetGroups.length > 0 && (
            <div className="probability-quick-targets" aria-label="Quick target groups">
              {quickTargetGroups.map((group) => (
                <button
                  key={group.label}
                  onClick={() => applyQuickTargetGroup(group.cardIds)}
                  type="button"
                >
                  {group.label} ({group.cardIds.length})
                </button>
              ))}
            </div>
          )}

          <div className="probability-target-list">
            {visibleCards.map((card) => {
              const cardTags = formatCardTags(card);

              return (
                <label key={card.cardId} className="probability-target">
                  <input
                    checked={selectedTargetIds.includes(card.cardId)}
                    onChange={() => toggleTarget(card.cardId)}
                    type="checkbox"
                  />
                  <span>
                    <strong>{card.name}</strong>
                    <small>
                      {card.cardId} / x{card.quantity}
                    </small>
                    {cardTags && <small>{cardTags}</small>}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="probability-section">
          <div className="probability-section__title">
            <h3>Simulation Settings</h3>
            <span>{presetName}</span>
          </div>

          <div className="probability-form">
            <label className="field" htmlFor="probabilityPreset">
              Preset
              <select
                id="probabilityPreset"
                onChange={(event) => applyPreset(event.target.value)}
                value={presetName}
              >
                {probabilityPresets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
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
        </section>
      </div>

      {inputError && <div className="status-panel status-panel--error">{inputError}</div>}
      {calculationError && (
        <div className="status-panel status-panel--error">{calculationError}</div>
      )}
      {calculationMessage && (
        <div className="probability-calculation-state">{calculationMessage}</div>
      )}

      <div className="probability-actions">
        <Button disabled={!canCalculate} onClick={calculate}>
          {calculating ? 'Calculating...' : 'Calculate'}
        </Button>
        {calculating && (
          <Button onClick={cancelCalculation} variant="danger">
            Cancel
          </Button>
        )}
      </div>

      {result && (
        <div className="probability-result">
          <span>{result.presetName ?? 'Custom'}</span>
          <strong>{result.probabilityPercent.toFixed(1)}%</strong>
          <div className="probability-result__stats">
            <div>
              <span>Hits</span>
              <strong>{result.hits}</strong>
            </div>
            <div>
              <span>Trials</span>
              <strong>{result.simulations}</strong>
            </div>
            <div>
              <span>Deck Cards</span>
              <strong>{totalCards}</strong>
            </div>
          </div>
          <p>
            {result.hits}/{result.simulations} simulations drew at least{' '}
            {result.minimumHits} card from {result.targetCardIds.length} selected target
            {result.targetCardIds.length === 1 ? '' : 's'} in {result.handSize} cards.
          </p>
        </div>
      )}
    </section>
  );
}
