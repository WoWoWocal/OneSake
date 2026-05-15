import type { ChoicePromptDto } from '../../types/realtime';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../components/ui/BottomSheet';

interface ChoiceSheetProps {
  currentPrompt: ChoicePromptDto | null;
  pending: boolean;
  canSubmitChoice: boolean;
  onSubmitChoice: (option: string, selectedCardInstanceId?: string) => void;
}

export function ChoiceSheet({
  canSubmitChoice,
  currentPrompt,
  onSubmitChoice,
  pending,
}: ChoiceSheetProps) {
  const visibleOptions =
    currentPrompt?.kind === 'MAIN_ACTION'
      ? currentPrompt.options.filter((option) => option !== 'PLAY_CARD')
      : currentPrompt?.options ?? [];

  return (
    <BottomSheet
      open={Boolean(currentPrompt) && visibleOptions.length > 0}
      title={currentPrompt?.title ?? 'Choice'}
    >
      {currentPrompt && (
        <div className="choice-content">
          <div className="choice-sheet-subtitle">
            {currentPrompt.kind} for {currentPrompt.playerId}
          </div>
          <div className="button-row">
            {visibleOptions.map((option) => (
              <Button
                key={option}
                className="choice-button"
                disabled={pending || !canSubmitChoice}
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
