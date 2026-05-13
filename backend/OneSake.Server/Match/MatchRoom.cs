using OneSake.Domain;

namespace OneSake.Server.Match;

public sealed class MatchRoom
{
    private readonly object _sync = new();
    private readonly string _roomCode;
    private readonly List<PlayerSlot> _players = [];
    private readonly Dictionary<string, ChoicePromptDto> _openChoicePrompts = new(StringComparer.Ordinal);
    private readonly HashSet<string> _mulliganPlayerDecisions = new(StringComparer.Ordinal);
    private readonly List<LogEventDto> _pendingLogEvents = [];
    private readonly List<ChoicePromptDto> _pendingChoicePrompts = [];

    private int _logSeq;
    private int _turnNumber;
    private string _activePlayerId = string.Empty;
    private MatchPhase _phase = MatchPhase.Lobby;

    public MatchRoom(string roomCode)
    {
        _roomCode = roomCode;
    }

    public MatchUpdate JoinPlayer(string connectionId, string displayName)
    {
        lock (_sync)
        {
            var normalizedDisplayName = string.IsNullOrWhiteSpace(displayName)
                ? $"Player-{_players.Count + 1}"
                : displayName.Trim();

            var existingPlayer = _players.FirstOrDefault(player => player.PlayerId == connectionId);
            if (existingPlayer is null)
            {
                if (_players.Count >= 2)
                {
                    throw new InvalidOperationException("Room is full.");
                }

                _players.Add(new PlayerSlot
                {
                    PlayerId = connectionId,
                    DisplayName = normalizedDisplayName,
                    Connected = true
                });
            }
            else
            {
                existingPlayer.DisplayName = normalizedDisplayName;
                existingPlayer.Connected = true;
            }

            CreateLogEvent("JOIN", $"{normalizedDisplayName} joined room {_roomCode}.");
            return CreateUpdate();
        }
    }

    public MatchUpdate StartMatch()
    {
        lock (_sync)
        {
            if (_players.Count != 2)
            {
                throw new InvalidOperationException("StartMatch requires exactly 2 players.");
            }

            if (_players.Any(player => !player.HasDeck))
            {
                throw new InvalidOperationException("Both players must select a deck before starting.");
            }

            _turnNumber = 1;
            _phase = MatchPhase.Mulligan;
            _activePlayerId = _players[0].PlayerId;
            _logSeq = 0;
            _openChoicePrompts.Clear();
            _mulliganPlayerDecisions.Clear();

            foreach (var player in _players)
            {
                player.DrawDeck = BuildMatchDeck(player);
                Shuffle(player.DrawDeck);
                player.Hand.Clear();
                player.PlayedCards.Clear();
                DrawCards(player, 5);
                player.LifeCount = 5;
                player.Connected = true;
            }

            CreateLogEvent("START_MATCH", "Match started.");
            CreateLogEvent("SHUFFLE_DECKS", "Both players shuffled their decks.");
            CreateLogEvent("DRAW_OPENING_HAND", "Both players drew their opening hand.");

            foreach (var player in _players)
            {
                CreateChoicePrompt(
                    player.PlayerId,
                    "MULLIGAN_DECISION",
                    "Do you want to keep your opening hand?",
                    ["KEEP", "MULLIGAN"]);
            }

            return CreateUpdate();
        }
    }

    public MatchUpdate SetPlayerDeck(string connectionId, PlayerDeckSubmissionDto deck)
    {
        lock (_sync)
        {
            var player = GetPlayerSlot(connectionId);

            var normalizedCards = deck.Cards
                .Where(card => !string.IsNullOrWhiteSpace(card.CardId) && card.Quantity > 0)
                .GroupBy(card => card.CardId.Trim(), StringComparer.OrdinalIgnoreCase)
                .Select(group =>
                {
                    var firstCard = group.First();
                    return new PlayerDeckCardDto
                    {
                        CardId = group.Key,
                        Name = string.IsNullOrWhiteSpace(firstCard.Name)
                            ? group.Key
                            : firstCard.Name.Trim(),
                        Quantity = group.Sum(card => card.Quantity)
                    };
                })
                .OrderBy(card => card.CardId, StringComparer.OrdinalIgnoreCase)
                .ToList();

            player.DeckId = deck.DeckId.Trim();
            player.DeckName = string.IsNullOrWhiteSpace(deck.DeckName)
                ? "Unnamed Deck"
                : deck.DeckName.Trim();
            player.LeaderCardId = deck.LeaderCardId.Trim();
            player.DeckCards = normalizedCards;
            player.MainDeckCount = normalizedCards.Sum(card => card.Quantity);
            player.HasDeck = !string.IsNullOrWhiteSpace(player.LeaderCardId) && player.MainDeckCount > 0;

            CreateLogEvent("DECK_SELECTED", $"{player.DisplayName} selected deck {player.DeckName}.");
            return CreateUpdate();
        }
    }

    public MatchUpdate SubmitChoice(ChoiceSubmissionDto submission)
    {
        lock (_sync)
        {
            if (!_openChoicePrompts.TryGetValue(submission.ChoiceId, out var prompt))
            {
                throw new InvalidOperationException("Choice prompt was not found.");
            }

            if (!string.Equals(prompt.PlayerId, submission.PlayerId, StringComparison.Ordinal))
            {
                throw new InvalidOperationException("Choice prompt does not belong to this player.");
            }

            var normalizedOption = prompt.Options.FirstOrDefault(
                option => string.Equals(option, submission.SelectedOption, StringComparison.OrdinalIgnoreCase));

            if (normalizedOption is null)
            {
                throw new InvalidOperationException("Selected option is invalid.");
            }

            _openChoicePrompts.Remove(prompt.ChoiceId);

            if (string.Equals(prompt.Kind, "MULLIGAN_DECISION", StringComparison.Ordinal))
            {
                var player = GetPlayerSlot(submission.PlayerId);
                if (string.Equals(normalizedOption, "KEEP", StringComparison.Ordinal))
                {
                    CreateLogEvent("MULLIGAN_KEEP", $"{player.DisplayName} kept their opening hand.");
                }
                else if (string.Equals(normalizedOption, "MULLIGAN", StringComparison.Ordinal))
                {
                    ResolveMulligan(player);
                    CreateLogEvent("MULLIGAN_TAKEN", $"{player.DisplayName} took a mulligan.");
                }
                else
                {
                    throw new InvalidOperationException("Unsupported option for MULLIGAN_DECISION.");
                }

                _mulliganPlayerDecisions.Add(submission.PlayerId);

                if (_mulliganPlayerDecisions.Count == _players.Count)
                {
                    CreateLogEvent("MULLIGAN_RESOLVED", "Both players finalized mulligan.");
                    BeginTurn(GetPlayerSlot(_activePlayerId));
                }
            }
            else if (string.Equals(prompt.Kind, "END_TURN", StringComparison.Ordinal))
            {
                if (!string.Equals(normalizedOption, "END_TURN", StringComparison.Ordinal))
                {
                    throw new InvalidOperationException("Unsupported option for END_TURN.");
                }

                ResolveEndTurn(GetPlayerSlot(submission.PlayerId));
            }
            else if (string.Equals(prompt.Kind, "MAIN_ACTION", StringComparison.Ordinal))
            {
                var player = GetPlayerSlot(submission.PlayerId);

                if (string.Equals(normalizedOption, "PLAY_CARD", StringComparison.Ordinal))
                {
                    PlayCard(player);
                    CreateMainActionPrompt(player);
                }
                else if (string.Equals(normalizedOption, "END_TURN", StringComparison.Ordinal))
                {
                    ResolveEndTurn(player);
                }
                else
                {
                    throw new InvalidOperationException("Unsupported option for MAIN_ACTION.");
                }
            }
            else
            {
                throw new InvalidOperationException($"Unsupported choice kind '{prompt.Kind}'.");
            }

            return CreateUpdate();
        }
    }

    public LogEventDto CreateLogEvent(string type, string text)
    {
        lock (_sync)
        {
            _logSeq += 1;
            var logEvent = new LogEventDto
            {
                RoomCode = _roomCode,
                Seq = _logSeq,
                Type = type,
                Text = text,
                TurnNumber = _turnNumber,
                Phase = _phase,
                TsUnixMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };

            _pendingLogEvents.Add(logEvent);
            return logEvent;
        }
    }

    public GameStateDto CreateStateSnapshot()
    {
        lock (_sync)
        {
            return new GameStateDto
            {
                RoomCode = _roomCode,
                TurnNumber = _turnNumber,
                ActivePlayerId = _activePlayerId,
                Phase = _phase,
                Players = _players
                    .Select(player => new PlayerStateDto
                    {
                        PlayerId = player.PlayerId,
                        DisplayName = player.DisplayName,
                        Connected = player.Connected,
                        DeckCount = player.DeckCount,
                        HandCount = player.HandCount,
                        LifeCount = player.LifeCount,
                        BoardCount = player.PlayedCards.Count,
                        DeckName = player.DeckName,
                        LeaderCardId = player.LeaderCardId,
                        MainDeckCount = player.MainDeckCount,
                        HasDeck = player.HasDeck
                    })
                    .ToArray()
            };
        }
    }

    public string ResolvePlayerId(string connectionId)
    {
        lock (_sync)
        {
            var player = _players.FirstOrDefault(entry => entry.PlayerId == connectionId);
            return player?.PlayerId ?? connectionId;
        }
    }

    private MatchUpdate CreateUpdate()
    {
        var update = new MatchUpdate
        {
            StateSnapshot = CreateStateSnapshot(),
            LogEvents = _pendingLogEvents.ToArray(),
            ChoicePrompts = _pendingChoicePrompts.ToArray()
        };

        _pendingLogEvents.Clear();
        _pendingChoicePrompts.Clear();

        return update;
    }

    private void CreateChoicePrompt(string playerId, string kind, string title, IReadOnlyList<string> options)
    {
        var prompt = new ChoicePromptDto
        {
            ChoiceId = Guid.NewGuid().ToString("N"),
            PlayerId = playerId,
            Kind = kind,
            Title = title,
            Options = options.ToArray()
        };

        _openChoicePrompts[prompt.ChoiceId] = prompt;
        _pendingChoicePrompts.Add(prompt);
    }

    private string GetOtherPlayerId(string currentPlayerId)
    {
        var otherPlayer = _players.FirstOrDefault(player => player.PlayerId != currentPlayerId);
        if (otherPlayer is null)
        {
            throw new InvalidOperationException("Unable to resolve next active player.");
        }

        return otherPlayer.PlayerId;
    }

    private PlayerSlot GetPlayerSlot(string playerId)
    {
        return _players.FirstOrDefault(player => player.PlayerId == playerId)
            ?? throw new InvalidOperationException("Player is not in this room.");
    }

    private void BeginTurn(PlayerSlot player)
    {
        _activePlayerId = player.PlayerId;
        EnterRefreshPhase(player);
        EnterDrawPhase(player);
        EnterMainPhase(player);
    }

    private void EnterRefreshPhase(PlayerSlot player)
    {
        _phase = MatchPhase.Refresh;
        CreateLogEvent("REFRESH_PHASE", $"Refresh phase for {player.DisplayName}.");
    }

    private void EnterDrawPhase(PlayerSlot player)
    {
        _phase = MatchPhase.Draw;

        if (player.DrawDeck.Count > 0)
        {
            DrawCards(player, 1);
            CreateLogEvent("DRAW_CARD", $"{player.DisplayName} drew 1 card.");
            return;
        }

        CreateLogEvent("DECK_EMPTY", $"{player.DisplayName} cannot draw because their deck is empty.");
    }

    private void EnterMainPhase(PlayerSlot player)
    {
        _phase = MatchPhase.Main;
        CreateLogEvent("MAIN_PHASE", $"Main phase for {player.DisplayName}.");
        CreateMainActionPrompt(player);
    }

    private void CreateMainActionPrompt(PlayerSlot player)
    {
        var options = new List<string>();

        if (player.Hand.Count > 0)
        {
            options.Add("PLAY_CARD");
        }

        options.Add("END_TURN");

        CreateChoicePrompt(
            player.PlayerId,
            "MAIN_ACTION",
            "Choose your main phase action.",
            options);
    }

    private void PlayCard(PlayerSlot player)
    {
        if (_phase != MatchPhase.Main)
        {
            throw new InvalidOperationException("Play card is only available in the main phase.");
        }

        if (!string.Equals(player.PlayerId, _activePlayerId, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Only the active player can play a card.");
        }

        if (player.Hand.Count == 0)
        {
            throw new InvalidOperationException("Player has no cards in hand.");
        }

        var playedCard = player.Hand[0];
        player.Hand.RemoveAt(0);
        player.PlayedCards.Add(playedCard);
        player.HandCount = player.Hand.Count;

        CreateLogEvent("PLAY_CARD", $"{player.DisplayName} played a card.");
    }

    private void ResolveEndTurn(PlayerSlot player)
    {
        if (_phase != MatchPhase.Main)
        {
            throw new InvalidOperationException("End turn is only available in the main phase.");
        }

        if (!string.Equals(player.PlayerId, _activePlayerId, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Only the active player can end the turn.");
        }

        EnterEndPhase(player);

        var previousActivePlayerId = player.PlayerId;
        CreateLogEvent("TURN_END", $"Player {previousActivePlayerId} ended turn {_turnNumber}.");

        _turnNumber += 1;
        _activePlayerId = GetOtherPlayerId(previousActivePlayerId);
        BeginTurn(GetPlayerSlot(_activePlayerId));
    }

    private void EnterEndPhase(PlayerSlot player)
    {
        _phase = MatchPhase.End;
        CreateLogEvent("END_PHASE", $"End phase for {player.DisplayName}.");
    }

    private static void ResolveMulligan(PlayerSlot player)
    {
        player.DrawDeck.AddRange(player.Hand);
        player.Hand.Clear();
        Shuffle(player.DrawDeck);
        DrawCards(player, 5);
    }

    private static List<MatchCard> BuildMatchDeck(PlayerSlot player)
    {
        return player.DeckCards
            .Where(card => card.Quantity > 0 && !string.IsNullOrWhiteSpace(card.CardId))
            .SelectMany(card =>
                Enumerable.Range(0, card.Quantity).Select(_ => new MatchCard
                {
                    CardId = card.CardId,
                    Name = string.IsNullOrWhiteSpace(card.Name) ? card.CardId : card.Name
                }))
            .ToList();
    }

    private static void Shuffle(IList<MatchCard> cards)
    {
        for (var index = cards.Count - 1; index > 0; index -= 1)
        {
            var swapIndex = Random.Shared.Next(index + 1);
            (cards[index], cards[swapIndex]) = (cards[swapIndex], cards[index]);
        }
    }

    private static void DrawCards(PlayerSlot player, int amount)
    {
        var cardsToDraw = Math.Min(Math.Max(0, amount), player.DrawDeck.Count);

        for (var index = 0; index < cardsToDraw; index += 1)
        {
            var drawnCard = player.DrawDeck[0];
            player.DrawDeck.RemoveAt(0);
            player.Hand.Add(drawnCard);
        }

        player.DeckCount = player.DrawDeck.Count;
        player.HandCount = player.Hand.Count;
    }

    private sealed record MatchCard
    {
        public string CardId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
    }

    private sealed class PlayerSlot
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
        public List<MatchCard> DrawDeck { get; set; } = [];
        public List<MatchCard> Hand { get; set; } = [];
        public List<MatchCard> PlayedCards { get; set; } = [];
    }
}

public sealed record MatchUpdate
{
    public GameStateDto StateSnapshot { get; init; } = new();
    public IReadOnlyList<LogEventDto> LogEvents { get; init; } = [];
    public IReadOnlyList<ChoicePromptDto> ChoicePrompts { get; init; } = [];
}
