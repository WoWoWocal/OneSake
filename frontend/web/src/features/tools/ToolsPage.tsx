import { useMemo, useState } from 'react';

import { loadStoredDecks } from '../deckbuilder/utils/deckStorage';
import { getTotalCards } from '../deckbuilder/utils/deckValidation';
import { MulliganTrainer } from './mulligan/MulliganTrainer';
import { SavedDeckSelect } from './SavedDeckSelect';

export function ToolsPage() {
  const [savedDecks] = useState(() => loadStoredDecks());
  const [selectedDeckId, setSelectedDeckId] = useState(savedDecks[0]?.id ?? '');
  const selectedDeck = useMemo(
    () => savedDecks.find((deck) => deck.id === selectedDeckId) ?? null,
    [selectedDeckId, savedDecks],
  );

  return (
    <section className="tools-page">
      <header className="panel header-panel">
        <h1>Tools</h1>
        <p>Saved decks are ready for trainer and probability workflows.</p>
      </header>

      <SavedDeckSelect
        decks={savedDecks}
        onSelectDeck={setSelectedDeckId}
        selectedDeckId={selectedDeckId}
      />

      {selectedDeck && (
        <section className="panel tools-panel">
          <h2>{selectedDeck.name}</h2>
          <div className="kv-grid">
            <span>Leader</span>
            <strong>{selectedDeck.leaderCardId || '-'}</strong>
            <span>Main Deck</span>
            <strong>{getTotalCards(selectedDeck.cards)}/50</strong>
          </div>
        </section>
      )}

      <div className="tools-grid">
        <MulliganTrainer deck={selectedDeck} />

        <section className="panel tools-panel">
          <h2>Probability Calculator</h2>
          <p>This will use the selected saved deck for draw and starting-hand odds.</p>
        </section>
      </div>
    </section>
  );
}
