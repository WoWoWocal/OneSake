export type BoardSide = 'player' | 'opponent';

export type BoardSlotKind =
  | 'deck'
  | 'life'
  | 'leader'
  | 'character'
  | 'donDeck'
  | 'donArea'
  | 'trash'
  | 'hand';

export interface BoardSlotDefinition {
  id: string;
  side: BoardSide;
  kind: BoardSlotKind;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
