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

const ACTION_LABELS = ['Mulligan', 'Keep', 'Play Card', 'End Turn', 'Attack', 'Activate Main', 'Pass'];
const CHARACTER_SLOTS = [1, 2, 3, 4, 5];
const LIFE_SLOTS = [1, 2, 3, 4, 5];

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

function BoardCard({ label, meta }: { label: string; meta?: string }) {
  return (
    <div className="board-card">
      <span>{label}</span>
      {meta && <strong>{meta}</strong>}
    </div>
  );
}

function BoardStack({
  count,
  label,
  tone = 'default',
}: {
  count: number;
  label: string;
  tone?: 'default' | 'gold' | 'trash';
}) {
  return (
    <div className={`board-stack board-stack--${tone}`}>
      <span>{label}</span>
      <strong>{count}</strong>
    </div>
  );
}

function LifeCards({ count }: { count: number }) {
  return (
    <div className="life-row" aria-label={`${count} life cards`}>
      {LIFE_SLOTS.map((slot) => (
        <span key={slot} className={slot <= count ? 'is-filled' : ''} />
      ))}
    </div>
  );
}

function CharacterArea() {
  return (
    <div className="character-row">
      {CHARACTER_SLOTS.map((slot) => (
        <div key={slot} className="drop-zone character-slot">
          Character {slot}
        </div>
      ))}
    </div>
  );
}

function MatchPlayerArea({
  isOpponent = false,
  player,
}: {
  isOpponent?: boolean;
  player: PlayerStateDto | null;
}) {
  const displayName = player?.displayName ?? (isOpponent ? 'Opponent' : 'Player');
  const playerId = player?.playerId ?? 'Waiting for player';

  return (
    <section className={`board-player-area ${isOpponent ? 'is-opponent' : 'is-player'}`}>
      <div className="board-player-status">
        <div>
          <span>{isOpponent ? 'Opponent Area' : 'Player Area'}</span>
          <strong>{displayName}</strong>
          <small>{playerId}</small>
        </div>
        <div className={player?.connected ? 'connection-pill is-online' : 'connection-pill'}>
          {player?.connected ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className={player?.hasDeck ? 'player-deck-pill is-ready' : 'player-deck-pill'}>
        <span>{player?.hasDeck ? 'Deck ready' : 'No deck selected'}</span>
        {player?.hasDeck && (
          <strong>
            {player.deckName || 'Unnamed Deck'} / {player.leaderCardId || 'No leader'} /{' '}
            {player.mainDeckCount}/50
          </strong>
        )}
      </div>

      <div className="board-zone-grid">
        <div className="side-zones">
          <div className="leader-stage-row">
            <div className="drop-zone leader-zone">
              <span>Leader</span>
              <strong>Leader Zone</strong>
            </div>
            <div className="drop-zone stage-zone">
              <span>Stage</span>
              <strong>Stage Zone</strong>
            </div>
          </div>
          <div className="don-zone">
            <span>Cost / DON!!</span>
            <strong>0 active / 0 rested</strong>
          </div>
        </div>

        <CharacterArea />

        <div className="resource-zones">
          <BoardStack count={getZoneCount(player, 'deckCount')} label="Deck" />
          <BoardStack count={getZoneCount(player, 'boardCount')} label="Board" tone="gold" />
          <BoardStack count={0} label="Trash" tone="trash" />
          <div className="life-zone">
            <div>
              <span>Life Cards</span>
              <strong>{getZoneCount(player, 'lifeCount')}</strong>
            </div>
            <LifeCards count={Math.min(getZoneCount(player, 'lifeCount'), LIFE_SLOTS.length)} />
          </div>
        </div>
      </div>

      <div className="hand-zone">
        <div>
          <span>Hand Cards</span>
          <strong>{getZoneCount(player, 'handCount')}</strong>
        </div>
        <div className="hand-card-row">
          {Array.from({ length: Math.min(getZoneCount(player, 'handCount'), 8) }, (_, index) => (
            <BoardCard key={index} label="Hand" meta={`#${index + 1}`} />
          ))}
          {getZoneCount(player, 'handCount') === 0 && <BoardCard label="Hand" meta="Empty" />}
        </div>
      </div>
    </section>
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
        <div className="match-board">
          <MatchPlayerArea isOpponent player={opponent} />
          <div className="board-divider">
            <span>Character Area</span>
          </div>
          <MatchPlayerArea player={player} />
        </div>

        <aside className="match-action-bar" aria-label="Match actions">
          <div>
            <span>Actions</span>
            <strong>{currentPrompt?.title ?? 'Waiting'}</strong>
            {currentPrompt && <small>{currentPrompt.kind}</small>}
          </div>
          {ACTION_LABELS.map((actionLabel) => {
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
      </div>
    </section>
  );
}
