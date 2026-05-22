using OneSake.Domain;
using OneSake.Game.State;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks; 

namespace OneSake.Game.Actions
{
    public sealed class AttackAction
    {

        public bool Execute(PlayerState attacker, PlayerState opponent, MatchPhase phase, string activePlayerId, string? selectedCardInstanceId)
        {
            ValidatePhase(phase);

            ValidateActivePlayer(attacker, activePlayerId);

            
            opponent.LifeCount = Math.Max(0, opponent.LifeCount - 1);

            return opponent.LifeCount <= 0;

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
    }
}


