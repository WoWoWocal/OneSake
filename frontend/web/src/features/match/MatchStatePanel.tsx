import type { ReactNode } from 'react';

import pirateBoardUrl from '../../assets/boards/pirate-match-board.png';
import type { Deck } from '../../types/decks';
import type { ChoicePromptDto, GameStateDto, PlayerStateDto } from '../../types/realtime';
import type { DeckValidationResult } from '../deckbuilder/utils/deckValidation';
import { getTotalCards } from '../deckbuilder/utils/deckValidation';
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
  onSubmitChoice: (option: string) => void;
}

const CHARACTER_SLOTS = [1, 2, 3, 4, 5];
const LIFE_SLOTS = [1, 2, 3, 4, 5];
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
  player: PlayerStateDto | null,
  key: 'deckCount' | 'handCount' | 'lifeCount' | 'boardCount',
) {
  const count = player ? player[key] : 0;
  return Number.isFinite(count) ? Math.max(0, count) : 0;
}

function getPlayerName(player: PlayerStateDto | null, fallback: string): string {
  return player?.displayName || fallback;
}

function BoardZone({
  children,
  className,
  label,
}: {
  children?: ReactNode;
  className: string;
  label: string;
}) {
  return (
    <div className={`pirate-board-zone ${className}`} aria-label={label}>
      {children}
    </div>
  );
}

function CardSlot({
  filled = false,
  label,
  meta,
}: {
  filled?: boolean;
  label: string;
  meta?: string;
}) {
  return (
    <div className={`pirate-card-slot ${filled ? 'is-filled' : ''}`}>
      <span>{label}</span>
      {meta && <strong>{meta}</strong>}
    </div>
  );
}

function CharacterSlots({ count, side }: { count: number; side: 'opponent' | 'player' }) {
  return (
    <>
      {CHARACTER_SLOTS.map((slot) => (
        <BoardZone
          key={`${side}-${slot}`}
          className={`character-zone character-zone--${side}-${slot}`}
          label={`${side} character slot ${slot}`}
        >
          <CardSlot filled={slot <= count} label="Character" meta={`${slot}/5`} />
        </BoardZone>
      ))}
    </>
  );
}

function LifeCounter({ count, side }: { count: number; side: 'opponent' | 'player' }) {
  return (
    <BoardZone className={`life-counter life-counter--${side}`} label={`${side} life cards`}>
      <span>Life</span>
      <strong>{count}</strong>
      <div className="pirate-life-pips">
        {LIFE_SLOTS.map((slot) => (
          <i key={slot} className={slot <= count ? 'is-filled' : ''} />
        ))}
      </div>
    </BoardZone>
  );
}

function CountZone({
  count,
  className,
  label,
}: {
  count: number;
  className: string;
  label: string;
}) {
  return (
    <BoardZone className={className} label={label}>
      <span>{label}</span>
      <strong>{count}</strong>
    </BoardZone>
  );
}

function LeaderZone({ player, side }: { player: PlayerStateDto | null; side: 'opponent' | 'player' }) {
  return (
    <BoardZone className={`leader-zone leader-zone--${side}`} label={`${side} leader`}>
      <CardSlot
        filled={Boolean(player?.leaderCardId)}
        label="Leader"
        meta={player?.leaderCardId || 'Unset'}
      />
    </BoardZone>
  );
}

function StageZone({ side }: { side: 'opponent' | 'player' }) {
  return (
    <BoardZone className={`stage-zone stage-zone--${side}`} label={`${side} stage`}>
      <CardSlot label="Stage" meta="Empty" />
    </BoardZone>
  );
}

function DonCounter({ side }: { side: 'opponent' | 'player' }) {
  return (
    <BoardZone className={`don-counter don-counter--${side}`} label={`${side} DON counter`}>
      <span>DON!!</span>
      <strong>0 / 0</strong>
    </BoardZone>
  );
}

function PlayerPlate({
  player,
  side,
}: {
  player: PlayerStateDto | null;
  side: 'opponent' | 'player';
}) {
  const fallback = side === 'opponent' ? 'Opponent' : 'Player';

  return (
    <BoardZone className={`player-plate player-plate--${side}`} label={`${side} status`}>
      <span>{side === 'opponent' ? 'Opponent' : 'You'}</span>
      <strong>{getPlayerName(player, fallback)}</strong>
      <small>{player?.hasDeck ? player.deckName || 'Deck ready' : 'No deck selected'}</small>
    </BoardZone>
  );
}

function HandRail({ player }: { player: PlayerStateDto | null }) {
  const handCount = getZoneCount(player, 'handCount');

  return (
    <div className="pirate-hand-rail" aria-label="Player hand cards">
      <div>
        <span>Hand</span>
        <strong>{handCount} cards</strong>
      </div>
      <div className="pirate-hand-cards">
        {Array.from({ length: Math.min(handCount, 10) }, (_, index) => (
          <CardSlot key={index} filled label="Hand" meta={`#${index + 1}`} />
        ))}
        {handCount === 0 && <CardSlot label="Hand" meta="Empty" />}
      </div>
    </div>
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

function ChoiceOverlay({
  canSubmitChoice,
  currentPrompt,
  onSubmitChoice,
  pending,
}: {
  canSubmitChoice: boolean;
  currentPrompt: ChoicePromptDto | null;
  onSubmitChoice: (option: string) => void;
  pending: boolean;
}) {
  if (!currentPrompt) {
    return null;
  }

  const endTurnOption = getActionOption(currentPrompt, 'End Turn');
  const mappedOptions = new Set([endTurnOption].filter(Boolean));
  const visibleOptions = currentPrompt.options.filter((option) => !mappedOptions.has(option));

  if (visibleOptions.length === 0) {
    return null;
  }

  return (
    <div className="pirate-choice-overlay">
      <div>
        <span>{currentPrompt.kind}</span>
        <strong>{currentPrompt.title}</strong>
      </div>
      <div className="pirate-choice-actions">
        {visibleOptions.map((option) => (
          <BoardActionButton
            key={option}
            disabled={pending || !canSubmitChoice}
            onClick={() => onSubmitChoice(option)}
          >
            {option}
          </BoardActionButton>
        ))}
      </div>
    </div>
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
  onSubmitChoice: (option: string) => void;
  pending: boolean;
}) {
  return (
    <aside className="match-action-bar" aria-label="Match actions">
      <div>
        <span>Actions</span>
        <strong>{currentPrompt?.title ?? 'Waiting'}</strong>
        {currentPrompt && <small>{currentPrompt.kind}</small>}
      </div>
      {BOARD_ACTIONS.map((actionLabel) => {
        const option = getActionOption(currentPrompt, actionLabel);
        return (
          <button
            key={actionLabel}
            disabled={!option || pending || !canSubmitChoice}
            onClick={() => option && onSubmitChoice(option)}
            type="button"
          >
            {actionLabel}
          </button>
        );
      })}
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
  const player = players[0] ?? null;
  const opponent = players[1] ?? null;
  const endTurnOption = getActionOption(currentPrompt, 'End Turn');
  const canEndTurn = Boolean(endTurnOption) && !pending && canSubmitChoice;

  return (
    <section className="match-board-shell">
      <div className="match-scorebar">
        <div>
          <span>Room</span>
          <strong>{gameState?.roomCode || joinedRoomCode || '-'}</strong>
        </div>
        <div>
          <span>Turn</span>
          <strong>{gameState?.turnNumber ?? 0}</strong>
        </div>
        <div className="phase-pill">
          <span>Phase</span>
          <strong>{phaseLabel}</strong>
        </div>
        <div>
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
        <div className="pirate-board-panel">
          <div className="pirate-board-scroll">
            <div className="pirate-board" aria-label="OneSake pirate match board">
              <img alt="Pirate card game board" className="pirate-board-image" src={pirateBoardUrl} />

              <PlayerPlate player={opponent} side="opponent" />
              <LeaderZone player={opponent} side="opponent" />
              <StageZone side="opponent" />
              <CharacterSlots count={getZoneCount(opponent, 'boardCount')} side="opponent" />
              <CountZone
                className="deck-counter deck-counter--opponent"
                count={getZoneCount(opponent, 'deckCount')}
                label="Deck"
              />
              <CountZone className="trash-counter trash-counter--opponent" count={0} label="Trash" />
              <LifeCounter count={getZoneCount(opponent, 'lifeCount')} side="opponent" />
              <DonCounter side="opponent" />

              <PlayerPlate player={player} side="player" />
              <LeaderZone player={player} side="player" />
              <StageZone side="player" />
              <CharacterSlots count={getZoneCount(player, 'boardCount')} side="player" />
              <CountZone
                className="deck-counter deck-counter--player"
                count={getZoneCount(player, 'deckCount')}
                label="Deck"
              />
              <CountZone className="trash-counter trash-counter--player" count={0} label="Trash" />
              <LifeCounter count={getZoneCount(player, 'lifeCount')} side="player" />
              <DonCounter side="player" />

              <BoardActionButton
                className="end-turn-board-button"
                disabled={!canEndTurn}
                onClick={() => endTurnOption && onSubmitChoice(endTurnOption)}
              >
                End Turn
              </BoardActionButton>

              <ChoiceOverlay
                canSubmitChoice={canSubmitChoice}
                currentPrompt={currentPrompt}
                onSubmitChoice={onSubmitChoice}
                pending={pending}
              />
            </div>
          </div>

          <HandRail player={player} />
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
