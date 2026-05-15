import { useMemo, useState } from 'react';

import { Button } from '../../components/ui/Button';
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
          <p>Practice hands and calculate deck odds.</p>
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

      {selectedDeck && selectedDeckValidation ? (
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
      ) : (
        <section className="panel tools-empty-state">
          <span className="tools-kicker">No saved decks yet</span>
          <h2>Build a deck before using tools.</h2>
          <p>Create and save a deck in the Deckbuilder first.</p>
          {onOpenDeckbuilder ? (
            <Button onClick={onOpenDeckbuilder} variant="secondary">
              Open Deckbuilder
            </Button>
          ) : (
            <p>Use the Deckbuilder tab to create a deck.</p>
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
