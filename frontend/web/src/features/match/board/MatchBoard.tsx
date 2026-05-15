import onesakeBoardUrl from '../../../assets/boards/onesake-board.png';
import type {
  CardInstanceDto,
  ChoicePromptDto,
  GameStateDto,
  PlayerStateDto,
} from '../../../types/realtime';
import { boardSlots } from './boardLayout';
import { BoardSlot } from './BoardSlot';
import type { BoardSide, BoardSlotDefinition } from './boardTypes';

interface MatchBoardProps {
  gameState: GameStateDto | null;
  activePlayerId: string;
  canSubmitChoice: boolean;
  currentPrompt: ChoicePromptDto | null;
  joinedRoomCode?: string;
  onSubmitChoice: (option: string, selectedCardInstanceId?: string) => void;
  pending: boolean;
}

function getCount(
  player: PlayerStateDto | null,
  key: 'deckCount' | 'handCount' | 'lifeCount' | 'boardCount',
): number {
  const count = player ? player[key] : 0;
  return Number.isFinite(count) ? Math.max(0, count) : 0;
}

function getPlayerName(player: PlayerStateDto | null, fallback: string): string {
  return player?.displayName || fallback;
}

function getVisiblePlayers(gameState: GameStateDto | null): Record<BoardSide, PlayerStateDto | null> {
  const players = gameState?.players ?? [];
  const viewerPlayer =
    players.find((player) => player.playerId === gameState?.viewerPlayerId) ?? players[0] ?? null;
  const opponentPlayer =
    players.find((player) => player.playerId !== viewerPlayer?.playerId) ?? null;

  return {
    player: viewerPlayer,
    opponent: opponentPlayer,
  };
}

function getCharacterIndex(slot: BoardSlotDefinition): number {
  const match = slot.id.match(/character-(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function getSlotCount(slot: BoardSlotDefinition, player: PlayerStateDto | null): number | undefined {
  if (slot.kind === 'deck') {
    return getCount(player, 'deckCount');
  }

  if (slot.kind === 'hand') {
    return getCount(player, 'handCount');
  }

  if (slot.kind === 'life') {
    return getCount(player, 'lifeCount');
  }

  if (slot.kind === 'trash') {
    return player?.trashCount ?? player?.trashCards.length ?? 0;
  }

  return undefined;
}

function getSlotCard(
  slot: BoardSlotDefinition,
  player: PlayerStateDto | null,
): CardInstanceDto | undefined {
  if (slot.kind !== 'character') {
    return undefined;
  }

  return player?.boardCards[getCharacterIndex(slot) - 1];
}

function isSlotFilled(slot: BoardSlotDefinition, player: PlayerStateDto | null): boolean {
  if (!player) {
    return false;
  }

  if (slot.kind === 'leader') {
    return Boolean(player.leaderCardId);
  }

  if (slot.kind === 'character') {
    return Boolean(getSlotCard(slot, player)) || getCharacterIndex(slot) <= getCount(player, 'boardCount');
  }

  return false;
}

function hasPromptOption(prompt: ChoicePromptDto | null, optionName: string): boolean {
  return Boolean(prompt?.options.some((option) => option === optionName));
}

function HandCardButton({
  canPlay,
  card,
  onPlay,
}: {
  canPlay: boolean;
  card: CardInstanceDto;
  onPlay: (card: CardInstanceDto) => void;
}) {
  return (
    <button
      className="match-hand-card"
      disabled={!canPlay}
      onClick={() => onPlay(card)}
      type="button"
    >
      <strong>{card.name}</strong>
      <span>{card.cardId}</span>
    </button>
  );
}

export function MatchBoard({
  activePlayerId,
  canSubmitChoice,
  currentPrompt,
  gameState,
  joinedRoomCode,
  onSubmitChoice,
  pending,
}: MatchBoardProps) {
  const debugBoardLayout =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debugBoard');
  const visiblePlayers = getVisiblePlayers(gameState);
  const localPlayer = visiblePlayers.player;
  const roomCode = gameState?.roomCode || joinedRoomCode || '-';
  const isGameOver = gameState?.phase === 'GameOver';
  const canPlayHandCards =
    Boolean(localPlayer) &&
    currentPrompt?.kind === 'MAIN_ACTION' &&
    currentPrompt.playerId === localPlayer?.playerId &&
    hasPromptOption(currentPrompt, 'PLAY_CARD') &&
    canSubmitChoice &&
    !pending;

  return (
    <div className="match-board-frame">
      <div className="match-board-scroll">
        <div
          className={debugBoardLayout ? 'match-board match-board--debug' : 'match-board'}
          aria-label="OneSake match board"
        >
          <img alt="OneSake pirate wooden game board" className="match-board-image" src={onesakeBoardUrl} />

          <div className="match-board-overlay">
            {boardSlots.map((slot) => {
              const slotPlayer = visiblePlayers[slot.side];
              const slotCard = getSlotCard(slot, slotPlayer);
              return (
                <BoardSlot
                  key={slot.id}
                  active={slotPlayer?.playerId === activePlayerId}
                  card={slotCard}
                  count={getSlotCount(slot, slotPlayer)}
                  filled={Boolean(slotCard) || isSlotFilled(slot, slotPlayer)}
                  slot={slot}
                />
              );
            })}

            <div
              className={`match-board-player-tag match-board-player-tag--opponent ${
                visiblePlayers.opponent?.playerId === activePlayerId ? 'is-active' : ''
              }`}
            >
              <span>Opponent</span>
              <strong>{getPlayerName(visiblePlayers.opponent, 'Opponent')}</strong>
            </div>

            <div
              className={`match-board-player-tag match-board-player-tag--player ${
                visiblePlayers.player?.playerId === activePlayerId ? 'is-active' : ''
              }`}
            >
              <span>You</span>
              <strong>{getPlayerName(visiblePlayers.player, 'Player')}</strong>
            </div>

            <div className="match-board-room-tag">
              <span>Room</span>
              <strong>{roomCode}</strong>
            </div>

            {isGameOver && (
              <div className="match-board-game-over" role="status">
                Game Over
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="match-hand-zone" aria-label="Your hand cards">
        <div className="match-hand-zone__header">
          <span>Your Hand</span>
          <strong>{localPlayer?.handCount ?? 0} cards</strong>
        </div>

        <div className="match-hand-card-row">
          {localPlayer?.handCards.length ? (
            localPlayer.handCards.map((card) => (
              <HandCardButton
                key={card.instanceId}
                canPlay={canPlayHandCards}
                card={card}
                onPlay={(selectedCard) => onSubmitChoice('PLAY_CARD', selectedCard.instanceId)}
              />
            ))
          ) : (
            <div className="match-hand-empty">No visible hand cards.</div>
          )}
        </div>
      </div>
    </div>
  );
}
