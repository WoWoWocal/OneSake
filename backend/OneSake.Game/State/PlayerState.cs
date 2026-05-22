using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OneSake.Game.State;
using OneSake.Domain;

namespace OneSake.Game.State
{
    public sealed class PlayerState
    {
        public string PlayerId { get; init; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public bool Connected { get; set; }
        public int DeckCount { get; set; }
        public int HandCount { get; set; }
        public int LifeCount { get; set; }
        public string DeckId { get; set; } = string.Empty;
        public string DeckName { get; set; } = string.Empty;
        public string LeaderCardId { get; set; } = string.Empty;
        public int MainDeckCount { get; set; }
        public bool HasDeck { get; set; }
        public List<PlayerDeckCardDto> DeckCards { get; set; } = [];
        public List<CardInstance> DrawDeck { get; set; } = [];
        public List<CardInstance> Hand { get; set; } = [];
        public List<CardInstance> PlayedCards { get; set; } = [];
        public List<CardInstance> TrashCards { get; set; } = [];
    }
}
