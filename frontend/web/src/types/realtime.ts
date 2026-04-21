export type MatchPhase = 'Lobby' | 'Mulligan' | 'Main' | 'GameOver' | number;

export interface PlayerStateDto {
  playerId: string;
  displayName: string;
  connected: boolean;
  deckCount: number;
  handCount: number;
  lifeCount: number;
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
