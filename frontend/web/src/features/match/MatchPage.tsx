import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { SignalRClient, type ConnectionStatus } from '../../api/signalrClient';
import {
  ChatMessageDto,
  ChoicePromptDto,
  ChoiceSubmissionDto,
  GameStateDto,
  LogEventDto,
} from '../../types/realtime';
import { Button } from '../../components/ui/Button';
import { loadStoredDecks } from '../deckbuilder/utils/deckStorage';
import { validateDeck } from '../deckbuilder/utils/deckValidation';
import { ChatPanel } from './ChatPanel';
import { ChoiceSheet } from './ChoiceSheet';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';
import { FullscreenMatchView } from './FullscreenMatchView';
import { LobbyPanel } from './LobbyPanel';
import { LogPanel } from './LogPanel';
import { toPlayerDeckSubmission } from './matchDeckMapper';
import { MatchDeckSelect } from './MatchDeckSelect';
import { MatchStatePanel } from './MatchStatePanel';

interface MatchPageProps {
  onImmersiveModeChange?: (isImmersiveMode: boolean) => void;
  onOpenDeckbuilder?: () => void;
}

type CopyStatus = '' | 'copied' | 'failed';

function createRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
    '',
  );
}

async function requestBoardPresentation(): Promise<void> {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // CSS fullscreen mode remains available if the browser blocks real fullscreen.
  }

  try {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>;
    };
    await orientation.lock?.('landscape');
  } catch {
    // Orientation lock is not available on every browser/device.
  }
}

async function exitBoardPresentation(): Promise<void> {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  } catch {
    // Leaving CSS fullscreen is enough if browser fullscreen cannot be exited here.
  }

  try {
    const orientation = screen.orientation as ScreenOrientation & {
      unlock?: () => void;
    };
    orientation.unlock?.();
  } catch {
    // Orientation unlock is optional and unsupported in some browsers.
  }
}

export function MatchPage({ onImmersiveModeChange, onOpenDeckbuilder }: MatchPageProps) {
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
  const [savedDecks] = useState(() => loadStoredDecks());
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [isBoardMode, setIsBoardMode] = useState(false);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('');

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

  useEffect(() => {
    if (!selectedDeckId && savedDecks[0]) {
      setSelectedDeckId(savedDecks[0].id);
    }
  }, [savedDecks, selectedDeckId]);

  useEffect(() => {
    onImmersiveModeChange?.(isBoardMode);

    return () => {
      onImmersiveModeChange?.(false);
    };
  }, [isBoardMode, onImmersiveModeChange]);

  useEffect(() => {
    if (!copyStatus) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopyStatus(''), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  const isConnected = connectionStatus === 'connected';
  const selectedDeck = useMemo(
    () => savedDecks.find((deck) => deck.id === selectedDeckId) ?? null,
    [savedDecks, selectedDeckId],
  );
  const selectedDeckValidation = useMemo(
    () => (selectedDeck ? validateDeck(selectedDeck) : null),
    [selectedDeck],
  );
  const hasSavedDecks = savedDecks.length > 0;
  const hasValidSelectedDeck = Boolean(selectedDeckValidation?.isValid);
  const hasPlayerName = displayNameInput.trim().length > 0;
  const hasRoomCode = roomCodeInput.trim().length > 0;
  const canJoin =
    hasRoomCode &&
    hasPlayerName &&
    hasValidSelectedDeck &&
    connectionStatus !== 'connecting';
  const canStart =
    joinedRoomCode.length > 0 && connectionStatus === 'connected' && hasValidSelectedDeck;
  const deckNotice = useMemo(() => {
    if (!hasSavedDecks) {
      return 'Create and save a deck in the Deckbuilder first.';
    }

    if (!selectedDeck) {
      return 'Select a saved deck before joining a room.';
    }

    if (!selectedDeckValidation?.isValid) {
      return selectedDeckValidation?.errors[0] ?? 'Selected deck is not valid yet.';
    }

    return '';
  }, [hasSavedDecks, selectedDeck, selectedDeckValidation]);
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

  const readinessItems = useMemo(
    () => [
      {
        label: 'Player name',
        ready: hasPlayerName,
        text: hasPlayerName ? displayNameInput.trim() : 'Enter a display name.',
      },
      {
        label: 'Room code',
        ready: hasRoomCode,
        text: hasRoomCode ? roomCodeInput.trim().toUpperCase() : 'Create or enter a room code.',
      },
      {
        label: 'Valid deck',
        ready: hasValidSelectedDeck,
        text: hasValidSelectedDeck ? selectedDeck?.name ?? 'Ready' : deckNotice,
      },
      {
        label: joinedRoomCode ? 'Joined' : 'Connection',
        ready: joinedRoomCode.length > 0 || connectionStatus === 'connected',
        text: joinedRoomCode
          ? `Room ${joinedRoomCode}`
          : connectionStatus === 'connected'
            ? 'Connected to match server.'
            : 'Join a room to connect.',
      },
    ],
    [
      connectionStatus,
      deckNotice,
      displayNameInput,
      hasPlayerName,
      hasRoomCode,
      hasValidSelectedDeck,
      joinedRoomCode,
      roomCodeInput,
      selectedDeck,
    ],
  );

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

      if (selectedDeck && selectedDeckValidation?.isValid) {
        await signalRClient.current.setPlayerDeck(
          normalizedRoomCode,
          toPlayerDeckSubmission(selectedDeck),
        );
      }

      setIsBoardMode(true);
      void requestBoardPresentation();
    } catch (joinError) {
      const message = joinError instanceof Error ? joinError.message : 'Join fehlgeschlagen.';
      setError(message);
    } finally {
      setPending(false);
    }
  };

  const generateRoomCode = (): void => {
    setRoomCodeInput(createRoomCode());
    setCopyStatus('');
  };

  const updateRoomCodeInput = (value: string): void => {
    setRoomCodeInput(value.toUpperCase());
  };

  const copyRoomCode = async (): Promise<void> => {
    if (!joinedRoomCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(joinedRoomCode);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  const openBoardMode = (): void => {
    setIsBoardMode(true);
    void requestBoardPresentation();
  };

  const exitBoardMode = (): void => {
    setIsBoardMode(false);
    void exitBoardPresentation();
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

  const submitChoice = async (option: string, selectedCardInstanceId?: string): Promise<void> => {
    if (!currentPrompt || !joinedRoomCode || !isConnected) {
      return;
    }

    const submission: ChoiceSubmissionDto = {
      choiceId: currentPrompt.choiceId,
      playerId: currentPrompt.playerId,
      selectedOption: option,
      selectedCardInstanceId,
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

  if (isBoardMode) {
    return (
      <FullscreenMatchView
        activePlayerDisplay={activePlayerDisplay}
        canStart={canStart}
        canSubmitChoice={isConnected}
        chatInput={chatInput}
        chatMessages={chatMessages}
        connectionStatus={connectionStatus}
        currentPrompt={currentPrompt}
        error={error}
        gameState={gameState}
        joinedRoomCode={joinedRoomCode}
        logEvents={logEvents}
        onChatInputChange={setChatInput}
        onExitBoard={exitBoardMode}
        onSendChat={sendChat}
        onStartMatch={() => void startMatch()}
        onSubmitChoice={(option, selectedCardInstanceId) =>
          void submitChoice(option, selectedCardInstanceId)
        }
        pending={pending}
      />
    );
  }

  return (
    <section className="match-page">
      <header className="panel header-panel">
        <div className="match-header-row">
          <div>
            <span className="match-setup-kicker">Game Lobby</span>
            <h1>Prepare Match</h1>
            <p>Choose your deck, create or join a room, then enter the fullscreen board.</p>
          </div>
          <ConnectionStatusBadge status={connectionStatus} />
        </div>
        {connectionNotice && (
          <p className={`connection-notice connection-notice--${connectionStatus}`} role="status">
            {connectionNotice}
          </p>
        )}
        {error && <p className="error-banner" role="alert">{error}</p>}
      </header>

      <LobbyPanel
        canJoin={canJoin}
        canStart={canStart}
        connectionStatus={connectionStatus}
        copyStatus={copyStatus}
        deckNotice={deckNotice}
        displayNameInput={displayNameInput}
        joinedRoomCode={joinedRoomCode}
        onCopyRoomCode={() => void copyRoomCode()}
        onDisplayNameChange={setDisplayNameInput}
        onGenerateRoomCode={generateRoomCode}
        onJoinRoom={() => void joinRoom()}
        onOpenBoard={openBoardMode}
        onOpenDeckbuilder={onOpenDeckbuilder}
        onRoomCodeChange={updateRoomCodeInput}
        onStartMatch={() => void startMatch()}
        pending={pending}
        readinessItems={readinessItems}
        roomCodeInput={roomCodeInput}
      />

      <MatchDeckSelect
        decks={savedDecks}
        onOpenDeckbuilder={onOpenDeckbuilder}
        onSelectDeck={setSelectedDeckId}
        selectedDeckId={selectedDeckId}
      />

      {joinedRoomCode && (
        <section className="panel match-open-board-panel match-joined-panel">
          <div>
            <span className="match-setup-kicker">Joined Room</span>
            <h2>{joinedRoomCode}</h2>
            <p>You are still in this room. Open the board again without reconnecting.</p>
          </div>
          <div className="match-joined-panel__actions">
            <Button onClick={() => void copyRoomCode()} variant="secondary">
              {copyStatus === 'copied' ? 'Copied' : 'Copy Room Code'}
            </Button>
            <Button onClick={openBoardMode}>Open Board</Button>
            <Button disabled={!canStart || pending} onClick={() => void startMatch()} variant="secondary">
              Start Match
            </Button>
          </div>
        </section>
      )}

      <main className="content-grid">
        <MatchStatePanel
          activePlayerDisplay={activePlayerDisplay}
          canSubmitChoice={isConnected}
          currentPrompt={currentPrompt}
          gameState={gameState}
          joinedRoomCode={joinedRoomCode}
          onSubmitChoice={(option, selectedCardInstanceId) =>
            void submitChoice(option, selectedCardInstanceId)
          }
          pending={pending}
          selectedDeck={selectedDeck}
          selectedDeckValidation={selectedDeckValidation}
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
        onSubmitChoice={(option, selectedCardInstanceId) =>
          void submitChoice(option, selectedCardInstanceId)
        }
        pending={pending}
      />
    </section>
  );
}
