import onesakeBoardUrl from '../../../assets/boards/onesake-board.png';
import type { GameStateDto, PlayerStateDto } from '../../../types/realtime';
import { boardSlots } from './boardLayout';
import { BoardSlot } from './BoardSlot';
import type { BoardSide, BoardSlotDefinition } from './boardTypes';

interface MatchBoardProps {
  gameState: GameStateDto | null;
  activePlayerId: string;
  joinedRoomCode?: string;
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

  return {
    player: players[0] ?? null,
    opponent: players[1] ?? null,
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

  return undefined;
}

function isSlotFilled(slot: BoardSlotDefinition, player: PlayerStateDto | null): boolean {
  if (!player) {
    return false;
  }

  if (slot.kind === 'leader') {
    return Boolean(player.leaderCardId);
  }

  if (slot.kind === 'character') {
    return getCharacterIndex(slot) <= getCount(player, 'boardCount');
  }

  return false;
}

export function MatchBoard({ activePlayerId, gameState, joinedRoomCode }: MatchBoardProps) {
  const visiblePlayers = getVisiblePlayers(gameState);
  const roomCode = gameState?.roomCode || joinedRoomCode || '-';
  const isGameOver = gameState?.phase === 'GameOver';

  return (
    <div className="match-board-frame">
      <div className="match-board-scroll">
        <div className="match-board" aria-label="OneSake match board">
          <img alt="OneSake pirate wooden game board" className="match-board-image" src={onesakeBoardUrl} />

          <div className="match-board-overlay">
            {boardSlots.map((slot) => {
              const slotPlayer = visiblePlayers[slot.side];
              return (
                <BoardSlot
                  key={slot.id}
                  active={slotPlayer?.playerId === activePlayerId}
                  count={getSlotCount(slot, slotPlayer)}
                  filled={isSlotFilled(slot, slotPlayer)}
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
    </div>
  );
}
