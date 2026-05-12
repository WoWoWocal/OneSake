import { Button } from '../../components/ui/Button';

interface LobbyPanelProps {
  roomCodeInput: string;
  displayNameInput: string;
  canJoin: boolean;
  canStart: boolean;
  pending: boolean;
  onRoomCodeChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onJoinRoom: () => void;
  onStartMatch: () => void;
}

export function LobbyPanel({
  canJoin,
  canStart,
  displayNameInput,
  onDisplayNameChange,
  onJoinRoom,
  onRoomCodeChange,
  onStartMatch,
  pending,
  roomCodeInput,
}: LobbyPanelProps) {
  return (
    <section className="panel lobby-panel">
      <div className="field">
        <label htmlFor="roomCode">RoomCode</label>
        <input
          id="roomCode"
          maxLength={12}
          onChange={(event) => onRoomCodeChange(event.target.value)}
          placeholder="ABCD"
          value={roomCodeInput}
        />
      </div>
      <div className="field">
        <label htmlFor="displayName">DisplayName</label>
        <input
          id="displayName"
          maxLength={24}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          placeholder="Player 1"
          value={displayNameInput}
        />
      </div>
      <div className="button-row">
        <Button disabled={!canJoin || pending} onClick={onJoinRoom}>
          Join Room
        </Button>
        <Button disabled={!canStart || pending} onClick={onStartMatch} variant="secondary">
          StartMatch
        </Button>
      </div>
    </section>
  );
}
