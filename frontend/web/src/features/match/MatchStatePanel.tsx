import type { ReactNode } from 'react';

import type { Deck } from '../../types/decks';
import type { ChoicePromptDto, GameStateDto, PlayerStateDto } from '../../types/realtime';
import type { DeckValidationResult } from '../deckbuilder/utils/deckValidation';
import { getTotalCards } from '../deckbuilder/utils/deckValidation';
import { MatchBoard } from './board/MatchBoard';
import { formatPhase } from './matchFormatters';

interface MatchStatePanelProps {
  gameState: GameStateDto | null;
  joinedRoomCode: string;
  activePlayerDisplay: string;
  currentPrompt: ChoicePromptDto | null;
  pending: boolean;
  canSubmitChoice: boolean;
  selectedDeck: Deck | null;
  selectedDeckValidation: DeckValidationResult | null;
  onSubmitChoice: (option: string, selectedCardInstanceId?: string) => void;
}

const BOARD_ACTIONS = ['Mulligan', 'Keep', 'Play Card', 'Attack', 'Activate Main', 'Pass'];

function normalizeAction(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function getActionOption(prompt: ChoicePromptDto | null, actionLabel: string): string | null {
  if (!prompt) {
    return null;
  }

  const normalizedAction = normalizeAction(actionLabel);
  return (
    prompt.options.find((option) => normalizeAction(option) === normalizedAction) ??
    prompt.options.find((option) => normalizeAction(option).includes(normalizedAction)) ??
    null
  );
}

function getZoneCount(
  player: PlayerStateDto,
  key: 'deckCount' | 'handCount' | 'lifeCount' | 'boardCount',
): number {
  const count = player[key];
  return Number.isFinite(count) ? Math.max(0, count) : 0;
}

function PlayerSummary({ player }: { player: PlayerStateDto }) {
  return (
    <li className={player.connected ? 'is-connected' : 'is-disconnected'}>
      <div>
        <strong>{player.displayName || player.playerId}</strong>
        <span className="player-id">{player.playerId}</span>
      </div>
      <div className="player-stats">
        <span>Deck {getZoneCount(player, 'deckCount')}</span>
        <span>Life {getZoneCount(player, 'lifeCount')}</span>
        <span>Hand {getZoneCount(player, 'handCount')}</span>
        <span>Board {getZoneCount(player, 'boardCount')}</span>
      </div>
    </li>
  );
}

function BoardActionButton({
  children,
  className = '',
  disabled,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`board-action-button ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ActionDock({
  canSubmitChoice,
  currentPrompt,
  onSubmitChoice,
  pending,
}: {
  canSubmitChoice: boolean;
  currentPrompt: ChoicePromptDto | null;
  onSubmitChoice: (option: string, selectedCardInstanceId?: string) => void;
  pending: boolean;
}) {
  const endTurnOption = getActionOption(currentPrompt, 'End Turn');

  return (
    <aside className="match-action-bar" aria-label="Match actions">
      <div>
        <span>Actions</span>
        <strong>{currentPrompt?.title ?? 'Waiting'}</strong>
        {currentPrompt && <small>{currentPrompt.kind}</small>}
      </div>

      {BOARD_ACTIONS.map((actionLabel) => {
        const option = getActionOption(currentPrompt, actionLabel);
        const isBoardHandAction =
          currentPrompt?.kind === 'MAIN_ACTION' && normalizeAction(actionLabel) === 'playcard';
        return (
          <BoardActionButton
            key={actionLabel}
            disabled={!option || isBoardHandAction || pending || !canSubmitChoice}
            onClick={() => option && onSubmitChoice(option)}
          >
            {actionLabel}
          </BoardActionButton>
        );
      })}

      <BoardActionButton
        className="end-turn-action-button"
        disabled={!endTurnOption || pending || !canSubmitChoice}
        onClick={() => endTurnOption && onSubmitChoice(endTurnOption)}
      >
        End Turn
      </BoardActionButton>
    </aside>
  );
}

export function MatchStatePanel({
  activePlayerDisplay,
  canSubmitChoice,
  currentPrompt,
  gameState,
  joinedRoomCode,
  onSubmitChoice,
  pending,
  selectedDeck,
  selectedDeckValidation,
}: MatchStatePanelProps) {
  const phaseLabel = gameState ? formatPhase(gameState.phase) : 'Lobby';
  const players = gameState?.players ?? [];

  return (
    <section className="match-board-shell">
      <div className="match-scorebar">
        <div>
          <span>Room</span>
          <strong>{gameState?.roomCode || joinedRoomCode || '-'}</strong>
        </div>
        <div>
          <span>Phase</span>
          <strong>{phaseLabel}</strong>
        </div>
        <div>
          <span>Turn</span>
          <strong>{gameState?.turnNumber ?? 0}</strong>
        </div>
        <div className="phase-pill">
          <span>Active Player</span>
          <strong>{activePlayerDisplay}</strong>
        </div>
      </div>

      <div className="selected-match-deck">
        <div>
          <span>Selected Deck</span>
          <strong>{selectedDeck?.name ?? 'No deck selected'}</strong>
          <small>{selectedDeck?.leaderCardId || 'No leader'}</small>
        </div>
        <div>
          <span>Main Deck</span>
          <strong>{selectedDeck ? `${getTotalCards(selectedDeck.cards)}/50` : '-'}</strong>
          <small className={selectedDeckValidation?.isValid ? 'is-valid' : 'is-invalid'}>
            {selectedDeckValidation?.isValid ? 'Valid' : 'Invalid'}
          </small>
        </div>
      </div>

      <div className="match-board-layout">
        <div className="match-board-main">
          <MatchBoard
            activePlayerId={gameState?.activePlayerId ?? ''}
            canSubmitChoice={canSubmitChoice}
            currentPrompt={currentPrompt}
            gameState={gameState}
            joinedRoomCode={joinedRoomCode}
            onSubmitChoice={onSubmitChoice}
            pending={pending}
          />

          <ul className="match-player-summary" aria-label="Player zone counts">
            {players.length > 0 ? (
              players.map((player) => <PlayerSummary key={player.playerId} player={player} />)
            ) : (
              <li className="is-empty">No players in this room yet.</li>
            )}
          </ul>
        </div>

        <ActionDock
          canSubmitChoice={canSubmitChoice}
          currentPrompt={currentPrompt}
          onSubmitChoice={onSubmitChoice}
          pending={pending}
        />
      </div>
    </section>
  );
}
