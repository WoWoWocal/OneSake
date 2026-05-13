import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { SignalRClient, type ConnectionStatus } from '../../api/signalrClient';
import {
  ChatMessageDto,
  ChoicePromptDto,
  ChoiceSubmissionDto,
  GameStateDto,
  LogEventDto,
} from '../../types/realtime';
import { ChatPanel } from './ChatPanel';
import { ChoiceSheet } from './ChoiceSheet';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';
import { LobbyPanel } from './LobbyPanel';
import { LogPanel } from './LogPanel';
import { MatchStatePanel } from './MatchStatePanel';

export function MatchPage() {
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
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

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

    client.onConnectionStatus((status) => {
      setConnectionStatus(status);
    });
  }, []);

  const isConnected = connectionStatus === 'connected';
  const canJoin =
    roomCodeInput.trim().length > 0 &&
    displayNameInput.trim().length > 0 &&
    connectionStatus !== 'connecting';
  const canStart = joinedRoomCode.length > 0 && connectionStatus === 'connected';
  const connectionNotice = useMemo(() => {
    if (connectionStatus === 'reconnecting') {
      return 'Connection lost. Reconnecting to the match server...';
    }

    if (connectionStatus === 'disconnected') {
      return 'Not connected yet. Join a room to connect to the match server.';
    }

    if (connectionStatus === 'error') {
      return 'Connection error. Check the backend server and try again.';
    }

    if (connectionStatus === 'connecting') {
      return 'Connecting to the match server...';
    }

    return '';
  }, [connectionStatus]);

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
    if (!currentPrompt || !joinedRoomCode || !isConnected) {
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
    if (!joinedRoomCode || !normalizedText || !isConnected) {
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
    <section className="match-page">
      <header className="panel header-panel">
        <div className="match-header-row">
          <div>
            <h1>OneSake Match</h1>
            <p>Join, start, choices, log and chat in one mobile-ready view.</p>
          </div>
          <ConnectionStatusBadge status={connectionStatus} />
        </div>
        {connectionNotice && (
          <p className={`connection-notice connection-notice--${connectionStatus}`}>
            {connectionNotice}
          </p>
        )}
        {error && <p className="error-banner">{error}</p>}
      </header>

      <LobbyPanel
        canJoin={canJoin}
        canStart={canStart}
        displayNameInput={displayNameInput}
        onDisplayNameChange={setDisplayNameInput}
        onJoinRoom={() => void joinRoom()}
        onRoomCodeChange={setRoomCodeInput}
        onStartMatch={() => void startMatch()}
        pending={pending}
        roomCodeInput={roomCodeInput}
      />

      <main className="content-grid">
        <MatchStatePanel
          activePlayerDisplay={activePlayerDisplay}
          canSubmitChoice={isConnected}
          currentPrompt={currentPrompt}
          gameState={gameState}
          joinedRoomCode={joinedRoomCode}
          onSubmitChoice={(option) => void submitChoice(option)}
          pending={pending}
        />
        <LogPanel logEvents={logEvents} />
        <ChatPanel
          canSendChat={isConnected}
          chatInput={chatInput}
          chatMessages={chatMessages}
          joinedRoomCode={joinedRoomCode}
          onChatInputChange={setChatInput}
          onSendChat={sendChat}
          pending={pending}
        />
      </main>

      <ChoiceSheet
        canSubmitChoice={isConnected}
        currentPrompt={currentPrompt}
        onSubmitChoice={(option) => void submitChoice(option)}
        pending={pending}
      />
    </section>
  );
}
