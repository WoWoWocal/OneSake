import { useMemo, useState } from 'react';

import { loadStoredDecks } from '../deckbuilder/utils/deckStorage';
import { getTotalCards, validateDeck } from '../deckbuilder/utils/deckValidation';
import { MulliganTrainer } from './mulligan/MulliganTrainer';
import { ProbabilityCalculator } from './probability/ProbabilityCalculator';
import { SavedDeckSelect } from './SavedDeckSelect';

interface ToolsPageProps {
  onOpenDeckbuilder?: () => void;
}

export function ToolsPage({ onOpenDeckbuilder }: ToolsPageProps) {
  const [savedDecks] = useState(() => loadStoredDecks());
  const [selectedDeckId, setSelectedDeckId] = useState(savedDecks[0]?.id ?? '');
  const selectedDeck = useMemo(
    () => savedDecks.find((deck) => deck.id === selectedDeckId) ?? null,
    [selectedDeckId, savedDecks],
  );
  const selectedDeckValidation = useMemo(
    () => (selectedDeck ? validateDeck(selectedDeck) : null),
    [selectedDeck],
  );
  const selectedDeckTotal = selectedDeck ? getTotalCards(selectedDeck.cards) : 0;

  return (
    <section className="tools-page">
      <header className="panel header-panel tools-hero">
        <div>
          <span className="tools-kicker">Game Analysis</span>
          <h1>Captain Tools</h1>
        </div>
        {selectedDeck && selectedDeckValidation && (
          <div
            className={`tools-deck-badge ${
              selectedDeckValidation.isValid ? 'is-valid' : 'is-invalid'
            }`}
          >
            {selectedDeckValidation.isValid ? 'Valid Deck' : 'Needs Work'}
          </div>
        )}
      </header>

      <SavedDeckSelect
        decks={savedDecks}
        onOpenDeckbuilder={onOpenDeckbuilder}
        onSelectDeck={setSelectedDeckId}
        selectedDeckId={selectedDeckId}
      />

      {selectedDeck && selectedDeckValidation && (
        <section className="panel tools-panel tools-deck-context">
          <div>
            <span className="tools-kicker">Active Deck</span>
            <h2>{selectedDeck.name}</h2>
            <p>{selectedDeck.leaderName || selectedDeck.leaderCardId || 'No leader selected'}</p>
          </div>
          <dl className="tools-deck-context__stats">
            <div>
              <dt>Leader</dt>
              <dd>{selectedDeck.leaderCardId || '-'}</dd>
            </div>
            <div>
              <dt>Main Deck</dt>
              <dd>{selectedDeckTotal}/50</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{selectedDeckValidation.isValid ? 'Valid' : 'Invalid'}</dd>
            </div>
          </dl>
          {!selectedDeckValidation.isValid && (
            <ul className="tools-deck-context__issues">
              {selectedDeckValidation.errors.slice(0, 2).map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="tools-grid">
        <MulliganTrainer deck={selectedDeck} />
        <ProbabilityCalculator deck={selectedDeck} />
      </div>
    </section>
  );
}
