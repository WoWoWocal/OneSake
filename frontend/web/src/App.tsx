import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { SignalRClient } from './api/signalrClient';
import {
  ChatMessageDto,
  ChoicePromptDto,
  ChoiceSubmissionDto,
  GameStateDto,
  LogEventDto,
  MatchPhase,
} from './types/realtime';

const PHASE_LABELS: Record<number, string> = {
  0: 'Lobby',
  1: 'Mulligan',
  2: 'Main',
  3: 'GameOver',
};

function formatPhase(phase: MatchPhase): string {
  if (typeof phase === 'string') {
    return phase;
  }

  return PHASE_LABELS[phase] ?? `Unknown(${phase})`;
}

function formatUnixMs(tsUnixMs: number): string {
  return new Date(tsUnixMs).toLocaleTimeString();
}

function App() {
  const signalRClient = useRef(
    new SignalRClient(`${import.meta.env.VITE_BACKEND_URL}/matchHub`),
  );

  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [joinedRoomCode, setJoinedRoomCode] = useState('');
  const [gameState, setGameState] = useState<GameStateDto | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<ChoicePromptDto | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageDto[]>([]);
  const [logEvents, setLogEvents] = useState<LogEventDto[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const client = signalRClient.current;
    client.onStateSnapshot((snapshot) => {
      setGameState(snapshot);
    });

    client.onChoicePrompt((prompt) => {
      setCurrentPrompt(prompt);
    });

    client.onChatMessage((message) => {
      setChatMessages((previous) => [...previous, message]);
    });

    client.onLogEvent((event) => {
      setLogEvents((previous) => [...previous, event]);
    });
  }, []);

  const canJoin = roomCodeInput.trim().length > 0 && displayNameInput.trim().length > 0;
  const canStart = joinedRoomCode.length > 0;

  const activePlayerDisplay = useMemo(() => {
    if (!gameState) {
      return '-';
    }

    const activePlayer = gameState.players.find(
      (player) => player.playerId === gameState.activePlayerId,
    );

    if (!activePlayer) {
      return gameState.activePlayerId || '-';
    }

    return `${activePlayer.displayName} (${activePlayer.playerId})`;
  }, [gameState]);

  const joinRoom = async (): Promise<void> => {
    const normalizedRoomCode = roomCodeInput.trim().toUpperCase();
    const normalizedDisplayName = displayNameInput.trim();
    if (!normalizedRoomCode || !normalizedDisplayName) {
      setError('RoomCode und DisplayName sind erforderlich.');
      return;
    }

    setPending(true);
    setError('');
    try {
      await signalRClient.current.joinRoom(normalizedRoomCode, normalizedDisplayName);
      setJoinedRoomCode(normalizedRoomCode);
      setRoomCodeInput(normalizedRoomCode);
    } catch (joinError) {
      const message = joinError instanceof Error ? joinError.message : 'Join fehlgeschlagen.';
      setError(message);
    } finally {
      setPending(false);
    }
  };

  const startMatch = async (): Promise<void> => {
    if (!joinedRoomCode) {
      return;
    }

    setPending(true);
    setError('');
    try {
      await signalRClient.current.startMatch(joinedRoomCode);
    } catch (startError) {
      const message = startError instanceof Error ? startError.message : 'StartMatch fehlgeschlagen.';
      setError(message);
    } finally {
      setPending(false);
    }
  };

  const submitChoice = async (option: string): Promise<void> => {
    if (!currentPrompt || !joinedRoomCode) {
      return;
    }

    const submission: ChoiceSubmissionDto = {
      choiceId: currentPrompt.choiceId,
      playerId: currentPrompt.playerId,
      selectedOption: option,
    };

    setPending(true);
    setError('');
    try {
      await signalRClient.current.submitChoice(joinedRoomCode, submission);
      setCurrentPrompt(null);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'SubmitChoice fehlgeschlagen.';
      setError(message);
    } finally {
      setPending(false);
    }
  };

  const sendChat = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    const normalizedText = chatInput.trim();
    if (!joinedRoomCode || !normalizedText) {
      return;
    }

    setPending(true);
    setError('');
    try {
      await signalRClient.current.sendChat(joinedRoomCode, normalizedText);
      setChatInput('');
    } catch (chatError) {
      const message = chatError instanceof Error ? chatError.message : 'SendChat fehlgeschlagen.';
      setError(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="panel header-panel">
        <h1>OneSake Sprint 1 Match Foundation</h1>
        <p>Join, start, mulligan, end turn, log and chat in one minimal view.</p>
        {error && <p className="error-banner">{error}</p>}
      </header>

      <section className="panel lobby-panel">
        <div className="field">
          <label htmlFor="roomCode">RoomCode</label>
          <input
            id="roomCode"
            value={roomCodeInput}
            onChange={(event) => setRoomCodeInput(event.target.value)}
            placeholder="ABCD"
            maxLength={12}
          />
        </div>
        <div className="field">
          <label htmlFor="displayName">DisplayName</label>
          <input
            id="displayName"
            value={displayNameInput}
            onChange={(event) => setDisplayNameInput(event.target.value)}
            placeholder="Player 1"
            maxLength={24}
          />
        </div>
        <div className="button-row">
          <button type="button" onClick={joinRoom} disabled={!canJoin || pending}>
            Join Room
          </button>
          <button type="button" onClick={startMatch} disabled={!canStart || pending}>
            StartMatch
          </button>
        </div>
      </section>

      <main className="content-grid">
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

        <section className="panel logs-panel">
          <h2>Log Events</h2>
          <div className="scroll-list">
            {logEvents.map((event) => (
              <div key={`${event.seq}-${event.tsUnixMs}`} className="list-entry">
                <div>
                  #{event.seq} [{event.type}] T{event.turnNumber} {formatPhase(event.phase)}
                </div>
                <div>{event.text}</div>
                <small>{formatUnixMs(event.tsUnixMs)}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="panel chat-panel">
          <h2>Chat</h2>
          <div className="scroll-list">
            {chatMessages.map((message) => (
              <div key={`${message.senderId}-${message.tsUnixMs}`} className="list-entry">
                <div>
                  <strong>{message.senderId}</strong>
                </div>
                <div>{message.text}</div>
                <small>{formatUnixMs(message.tsUnixMs)}</small>
              </div>
            ))}
          </div>
          <form className="chat-form" onSubmit={sendChat}>
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Write chat message"
            />
            <button type="submit" disabled={!joinedRoomCode || pending}>
              Send
            </button>
          </form>
        </section>
      </main>

      {currentPrompt && (
        <aside className="choice-sheet">
          <div className="choice-sheet-title">{currentPrompt.title}</div>
          <div className="choice-sheet-subtitle">
            {currentPrompt.kind} for {currentPrompt.playerId}
          </div>
          <div className="button-row">
            {currentPrompt.options.map((option) => (
              <button
                key={option}
                type="button"
                className="choice-button"
                onClick={() => void submitChoice(option)}
                disabled={pending}
              >
                {option}
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

export default App;
