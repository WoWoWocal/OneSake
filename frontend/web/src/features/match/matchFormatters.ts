import type { MatchPhase } from '../../types/realtime';

const PHASE_LABELS: Record<number, string> = {
  0: 'Lobby',
  1: 'Mulligan',
  2: 'Refresh',
  3: 'Draw',
  4: 'Main',
  5: 'End',
  6: 'GameOver',
};

export function formatPhase(phase: MatchPhase): string {
  if (typeof phase === 'string') {
    return phase;
  }

  return PHASE_LABELS[phase] ?? `Unknown(${phase})`;
}

export function formatUnixMs(tsUnixMs: number): string {
  return new Date(tsUnixMs).toLocaleTimeString();
}
