import type { GameStateDto } from '../../types/realtime';
import { formatPhase } from './matchFormatters';

interface MatchStatePanelProps {
  gameState: GameStateDto | null;
  joinedRoomCode: string;
  activePlayerDisplay: string;
}

export function MatchStatePanel({
  activePlayerDisplay,
  gameState,
  joinedRoomCode,
}: MatchStatePanelProps) {
  return (
    <section className="panel state-panel">
      <h2>Match</h2>
      <div className="kv-grid">
        <span>RoomCode</span>
        <strong>{gameState?.roomCode || joinedRoomCode || '-'}</strong>
        <span>TurnNumber</span>
        <strong>{gameState?.turnNumber ?? 0}</strong>
        <span>Phase</span>
        <strong>{gameState ? formatPhase(gameState.phase) : 'Lobby'}</strong>
        <span>ActivePlayer</span>
        <strong>{activePlayerDisplay}</strong>
      </div>

      <h3>Players</h3>
      <ul className="player-list">
        {(gameState?.players ?? []).map((player) => (
          <li key={player.playerId}>
            <div>
              <strong>{player.displayName}</strong>
              <span className="player-id">{player.playerId}</span>
            </div>
            <div className="player-stats">
              <span>Deck {player.deckCount}</span>
              <span>Hand {player.handCount}</span>
              <span>Life {player.lifeCount}</span>
              <span>{player.connected ? 'Online' : 'Offline'}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
