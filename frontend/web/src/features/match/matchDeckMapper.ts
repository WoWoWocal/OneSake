import type { Deck } from '../../types/decks';
import type { PlayerDeckSubmissionDto } from '../../types/realtime';

export function toPlayerDeckSubmission(deck: Deck): PlayerDeckSubmissionDto {
  return {
    deckId: deck.id,
    deckName: deck.name,
    leaderCardId: deck.leaderCardId,
    cards: deck.cards.map((card) => ({
      cardId: card.cardId,
      name: card.name,
      quantity: card.quantity,
    })),
  };
}
