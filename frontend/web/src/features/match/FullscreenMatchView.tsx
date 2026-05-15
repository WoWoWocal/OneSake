import { FormEvent, useState } from 'react';

import type { ConnectionStatus } from '../../api/signalrClient';
import type {
  ChatMessageDto,
  ChoicePromptDto,
  GameStateDto,
  LogEventDto,
} from '../../types/realtime';
import { ChatPanel } from './ChatPanel';
import { ChoiceSheet } from './ChoiceSheet';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';
import { LogPanel } from './LogPanel';
import { MatchBoard } from './board/MatchBoard';
import { formatPhase } from './matchFormatters';

interface FullscreenMatchViewProps {
  activePlayerDisplay: string;
  canStart: boolean;
  canSubmitChoice: boolean;
  chatInput: string;
  chatMessages: ChatMessageDto[];
  connectionStatus: ConnectionStatus;
  currentPrompt: ChoicePromptDto | null;
  error: string;
  gameState: GameStateDto | null;
  joinedRoomCode: string;
  logEvents: LogEventDto[];
  onChatInputChange: (value: string) => void;
  onExitBoard: () => void;
  onSendChat: (event: FormEvent) => void;
  onStartMatch: () => void;
  onSubmitChoice: (option: string, selectedCardInstanceId?: string) => void;
  pending: boolean;
}

export function FullscreenMatchView({
  activePlayerDisplay,
  canStart,
  canSubmitChoice,
  chatInput,
  chatMessages,
  connectionStatus,
  currentPrompt,
  error,
  gameState,
  joinedRoomCode,
  logEvents,
  onChatInputChange,
  onExitBoard,
  onSendChat,
  onStartMatch,
  onSubmitChoice,
  pending,
}: FullscreenMatchViewProps) {
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const phaseLabel = gameState ? formatPhase(gameState.phase) : 'Lobby';
  const canShowStartMatch = canStart && phaseLabel === 'Lobby';

  return (
    <section className="match-fullscreen" aria-label="Fullscreen match board">
      <header className="match-fullscreen__topbar">
        <div className="match-fullscreen__meta">
          <span>Room</span>
          <strong>{gameState?.roomCode || joinedRoomCode || '-'}</strong>
        </div>
        <div className="match-fullscreen__meta">
          <span>Phase</span>
          <strong>{phaseLabel}</strong>
        </div>
        <div className="match-fullscreen__meta">
          <span>Turn</span>
          <strong>{gameState?.turnNumber ?? 0}</strong>
        </div>
        <div className="match-fullscreen__meta match-fullscreen__meta--wide">
          <span>Active Player</span>
          <strong>{activePlayerDisplay}</strong>
        </div>
        <ConnectionStatusBadge status={connectionStatus} />
        {canShowStartMatch && (
          <button
            className="match-fullscreen__toggle"
            disabled={pending}
            onClick={onStartMatch}
            type="button"
          >
            Start Match
          </button>
        )}
        <button
          className="match-fullscreen__toggle"
          onClick={() => setSidePanelOpen((isOpen) => !isOpen)}
          type="button"
        >
          {sidePanelOpen ? 'Hide Chat' : 'Chat / Log'}
        </button>
        <button className="match-fullscreen__exit" onClick={onExitBoard} type="button">
          Exit Board
        </button>
      </header>

      <div className="match-fullscreen__orientation-notice" role="note">
        Für die beste Ansicht bitte Gerät quer halten.
      </div>

      {error && <p className="match-fullscreen__error">{error}</p>}

      <main
        className={
          sidePanelOpen
            ? 'match-fullscreen__stage match-fullscreen__stage--side-open'
            : 'match-fullscreen__stage'
        }
      >
        <div className="match-fullscreen__board">
          {!gameState && (
            <div className="match-fullscreen__waiting" role="status">
              Waiting for match state...
            </div>
          )}
          <MatchBoard
            activePlayerId={gameState?.activePlayerId ?? ''}
            canSubmitChoice={canSubmitChoice}
            currentPrompt={currentPrompt}
            gameState={gameState}
            joinedRoomCode={joinedRoomCode}
            onSubmitChoice={onSubmitChoice}
            pending={pending}
          />
        </div>

        <aside
          className={
            sidePanelOpen
              ? 'match-fullscreen__side-panel is-open'
              : 'match-fullscreen__side-panel'
          }
          aria-hidden={!sidePanelOpen}
        >
          <LogPanel logEvents={logEvents} />
          <ChatPanel
            canSendChat={canSubmitChoice}
            chatInput={chatInput}
            chatMessages={chatMessages}
            joinedRoomCode={joinedRoomCode}
            onChatInputChange={onChatInputChange}
            onSendChat={onSendChat}
            pending={pending}
          />
        </aside>
      </main>

      <ChoiceSheet
        canSubmitChoice={canSubmitChoice}
        currentPrompt={currentPrompt}
        onSubmitChoice={onSubmitChoice}
        pending={pending}
      />
    </section>
  );
}
