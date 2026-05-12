import { useEffect, useMemo, useState } from 'react';

import { Button } from '../../../components/ui/Button';
import type { Deck } from '../../../types/decks';
import { getTotalCards } from '../../deckbuilder/utils/deckValidation';
import { maxSimulations, runProbabilitySimulation } from './probabilityLogic';
import { probabilityPresets } from './probabilityPresets';
import type { ProbabilityResult } from './probabilityTypes';

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
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [targetSearch, setTargetSearch] = useState('');
  const [presetName, setPresetName] = useState(probabilityPresets[0].name);
  const [minimumHits, setMinimumHits] = useState(probabilityPresets[0].minimumHits);
  const [handSize, setHandSize] = useState(probabilityPresets[0].handSize);
  const [simulations, setSimulations] = useState(10000);
  const [result, setResult] = useState<ProbabilityResult | null>(null);
  const [calculating, setCalculating] = useState(false);

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
  }, [deck]);

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

  const calculate = (): void => {
    if (!deck || !canCalculate) {
      return;
    }

    const normalizedSimulations = Math.min(maxSimulations, Math.max(1, simulations));
    setCalculating(true);
    window.setTimeout(() => {
      const nextResult = runProbabilitySimulation(deck, {
        targetCardIds: selectedTargetIds,
        minimumHits,
        handSize,
        simulations: normalizedSimulations,
        presetName,
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
        <p>
          Chance to draw at least {minimumHits} card from selected targets in {handSize} cards.
        </p>
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

      <div className="probability-targets">
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
      </div>

      {inputError && <div className="status-panel status-panel--error">{inputError}</div>}

      <Button disabled={!canCalculate} onClick={calculate}>
        {calculating ? 'Calculating...' : 'Calculate'}
      </Button>

      {result && (
        <div className="probability-result">
          <span>{result.presetName ?? 'Custom'}</span>
          <strong>{result.probabilityPercent.toFixed(1)}%</strong>
          <p>
            {result.hits}/{result.simulations} simulations drew at least{' '}
            {result.minimumHits} card from {result.targetCardIds.length} selected target
            {result.targetCardIds.length === 1 ? '' : 's'} in {result.handSize} cards.
          </p>
          <p>Total deck cards: {totalCards}</p>
        </div>
      )}
    </section>
  );
}
