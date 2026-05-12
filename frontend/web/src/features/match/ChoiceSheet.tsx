import type { ChoicePromptDto } from '../../types/realtime';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../components/ui/BottomSheet';

interface ChoiceSheetProps {
  currentPrompt: ChoicePromptDto | null;
  pending: boolean;
  onSubmitChoice: (option: string) => void;
}

export function ChoiceSheet({ currentPrompt, onSubmitChoice, pending }: ChoiceSheetProps) {
  return (
    <BottomSheet open={Boolean(currentPrompt)} title={currentPrompt?.title ?? 'Choice'}>
      {currentPrompt && (
        <div className="choice-content">
          <div className="choice-sheet-subtitle">
            {currentPrompt.kind} for {currentPrompt.playerId}
          </div>
          <div className="button-row">
            {currentPrompt.options.map((option) => (
              <Button
                key={option}
                className="choice-button"
                disabled={pending}
                onClick={() => onSubmitChoice(option)}
                variant="secondary"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
