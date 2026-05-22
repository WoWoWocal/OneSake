using OneSake.Domain;
using OneSake.Game.State;

namespace OneSake.Game.Actions;

public sealed class PlayCardAction
{
    public void Execute(
        PlayerState player,
        MatchPhase phase,
        string activePlayerId,
        string? selectedCardInstanceId)
    {
        ValidatePhase(phase);

        ValidateActivePlayer(player, activePlayerId);

        ValidateHand(player);

        ValidateCardSelection(selectedCardInstanceId);

        var handIndex = player.Hand.FindIndex(card =>
            string.Equals(
                card.InstanceId,
                selectedCardInstanceId,
                StringComparison.Ordinal));

        if (handIndex < 0)
        {
            throw new InvalidOperationException(
                "Selected card is not in the player's hand.");
        }

        var playedCard = player.Hand[handIndex];

        player.Hand.RemoveAt(handIndex);

        player.PlayedCards.Add(playedCard);

        player.HandCount = player.Hand.Count;
    }

    private static void ValidatePhase(MatchPhase phase)
    {
        switch (phase)
        {
            case MatchPhase.Main:
                return;

            case MatchPhase.GameOver:
                throw new InvalidOperationException(
                    "The game is already over.");

            default:
                throw new InvalidOperationException(
                    "Cards can only be played during the main phase.");
        }
    }

    private static void ValidateActivePlayer(
        PlayerState player,
        string activePlayerId)
    {
        if (!string.Equals(
                player.PlayerId,
                activePlayerId,
                StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                "Only the active player can play a card.");
        }
    }

    private static void ValidateHand(PlayerState player)
    {
        if (player.Hand.Count == 0)
        {
            throw new InvalidOperationException(
                "Player has no cards in hand.");
        }
    }

    private static void ValidateCardSelection(
        string? selectedCardInstanceId)
    {
        if (string.IsNullOrWhiteSpace(selectedCardInstanceId))
        {
            throw new InvalidOperationException(
                "Playing a card requires selectedCardInstanceId.");
        }
    }
}
