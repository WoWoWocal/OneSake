using OneSake.Domain;
using OneSake.Game.State;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OneSake.Game.Actions
{
    public sealed class EndTurnAction
    {
        public void Execute(PlayerState player, MatchPhase phase, string _activePlayerId)
        {
            ValidatePhase(phase);

            ValidateActivePlayer(player, _activePlayerId);
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
    }
}
