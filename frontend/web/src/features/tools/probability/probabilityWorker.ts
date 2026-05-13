import { runProbabilitySimulation } from './probabilityLogic';
import type { ProbabilityWorkerRequest, ProbabilityWorkerResponse } from './probabilityTypes';

self.onmessage = (event: MessageEvent<ProbabilityWorkerRequest>) => {
  const request = event.data;

  if (request.type !== 'RUN_PROBABILITY') {
    return;
  }

  try {
    const result = runProbabilitySimulation(request.deck, request.input);
    const response: ProbabilityWorkerResponse = {
      type: 'PROBABILITY_RESULT',
      result,
    };
    self.postMessage(response);
  } catch (error) {
    const response: ProbabilityWorkerResponse = {
      type: 'PROBABILITY_ERROR',
      message: error instanceof Error ? error.message : 'Probability calculation failed.',
    };
    self.postMessage(response);
  }
};
