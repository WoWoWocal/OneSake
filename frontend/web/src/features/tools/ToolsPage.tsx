import { useMemo, useState } from 'react';

import { loadStoredDecks } from '../deckbuilder/utils/deckStorage';
import { validateDeck } from '../deckbuilder/utils/deckValidation';
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

      <div className="tools-grid">
        <MulliganTrainer deck={selectedDeck} />
        <ProbabilityCalculator deck={selectedDeck} />
      </div>
    </section>
  );
}
