import type { DeckValidationResult } from './utils/deckValidation';

interface DeckValidationProps {
  validation: DeckValidationResult;
}

export function DeckValidation({ validation }: DeckValidationProps) {
  return (
    <section className="panel deck-panel">
      <h2>Validation</h2>
      <div className="validation-progress">Main Deck: {validation.totalCards}/50</div>
      <ul className="validation-list">
        {validation.isValid ? (
          <li className="is-valid">Deck is valid.</li>
        ) : (
          validation.errors.map((validationError) => (
            <li key={validationError} className="is-pending">
              {validationError}
            </li>
          ))
        )}
        {validation.warnings.map((validationWarning) => (
          <li key={validationWarning} className="is-warning">
            {validationWarning}
          </li>
        ))}
      </ul>
    </section>
  );
}
