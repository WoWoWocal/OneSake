import type { ProbabilityPreset } from './probabilityTypes';

export const probabilityPresets: ProbabilityPreset[] = [
  {
    name: 'Opening Hand',
    handSize: 5,
    minimumHits: 1,
  },
  {
    name: 'Going First Turn 2',
    handSize: 6,
    minimumHits: 1,
  },
  {
    name: 'Going Second Turn 2',
    handSize: 7,
    minimumHits: 1,
  },
];
