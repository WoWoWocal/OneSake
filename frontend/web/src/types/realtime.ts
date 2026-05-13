export type MatchPhase =
  | 'Lobby'
  | 'Mulligan'
  | 'Refresh'
  | 'Draw'
  | 'Main'
  | 'End'
  | 'GameOver'
  | number;

export interface PlayerStateDto {
  playerId: string;
  displayName: string;
  connected: boolean;
  deckCount: number;
  handCount: number;
  lifeCount: number;
  deckName: string;
  leaderCardId: string;
  mainDeckCount: number;
  hasDeck: boolean;
}

export interface PlayerDeckCardDto {
  cardId: string;
  name: string;
  quantity: number;
}

export interface PlayerDeckSubmissionDto {
  deckId: string;
  deckName: string;
  leaderCardId: string;
  cards: PlayerDeckCardDto[];
}

export interface GameStateDto {
  roomCode: string;
  turnNumber: number;
  activePlayerId: string;
  phase: MatchPhase;
  players: PlayerStateDto[];
}

export interface ChoicePromptDto {
  choiceId: string;
  playerId: string;
  kind: string;
  title: string;
  options: string[];
}

export interface ChoiceSubmissionDto {
  choiceId: string;
  playerId: string;
  selectedOption: string;
}

export interface ChatMessageDto {
  roomCode: string;
  senderId: string;
  text: string;
  tsUnixMs: number;
}

export interface LogEventDto {
  roomCode: string;
  seq: number;
  type: string;
  text: string;
  turnNumber: number;
  phase: MatchPhase;
  tsUnixMs: number;
}
