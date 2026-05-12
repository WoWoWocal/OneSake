import { useState } from 'react';

import { Button } from '../../components/ui/Button';
import type { Deck } from '../../types/decks';
import { createDeckExportString } from './utils/deckExport';
import type { DeckValidationResult } from './utils/deckValidation';

interface DeckExportProps {
  deck: Deck;
  validation: DeckValidationResult;
}

export function DeckExport({ deck, validation }: DeckExportProps) {
  const [copyMessage, setCopyMessage] = useState('');
  const exportString = createDeckExportString(deck);

  const copyDeck = async (): Promise<void> => {
    if (!validation.isValid) {
      return;
    }

    try {
      await navigator.clipboard.writeText(exportString);
      setCopyMessage('Copied to clipboard.');
    } catch {
      setCopyMessage('Copy failed. Select the text manually.');
    }
  };

  return (
    <section className="panel deck-panel deck-export">
      <h2>Export</h2>
      {!validation.isValid && (
        <p>Export is disabled until validation passes: {validation.errors[0]}</p>
      )}
      <pre>{exportString}</pre>
      <Button disabled={!validation.isValid} fullWidth onClick={() => void copyDeck()}>
        Copy export
      </Button>
      {copyMessage && <p className="copy-message">{copyMessage}</p>}
    </section>
  );
}
