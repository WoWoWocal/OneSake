import type { CardDto } from '../types/cards';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function buildCardsUrl(path: string): string {
  const baseUrl = String(BACKEND_URL ?? '').replace(/\/$/, '');
  if (!baseUrl) {
    throw new Error('VITE_BACKEND_URL is not configured.');
  }

  return `${baseUrl}/Cards/${path}`;
}

async function fetchCards(path: string): Promise<CardDto[]> {
  const response = await fetch(buildCardsUrl(path));

  if (!response.ok) {
    throw new Error(`Cards request failed (${response.status}).`);
  }

  return (await response.json()) as CardDto[];
}

export async function getCardsById(cardId: string): Promise<CardDto[]> {
  return fetchCards(encodeURIComponent(cardId.trim()));
}

export async function getCardsBySetId(setId: string): Promise<CardDto[]> {
  return fetchCards(`set/${encodeURIComponent(setId.trim())}`);
}
