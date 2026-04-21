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

            _turnNumber = 1;
            _phase = MatchPhase.Mulligan;
            _activePlayerId = _players[0].PlayerId;
            _logSeq = 0;
            _openChoicePrompts.Clear();
            _mulliganPlayerDecisions.Clear();

            foreach (var player in _players)
            {
                player.DeckCount = 50;
                player.HandCount = 5;
                player.LifeCount = 5;
                player.Connected = true;
            }

            CreateLogEvent("START_MATCH", "Match started.");
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
                _mulliganPlayerDecisions.Add(submission.PlayerId);

                if (_mulliganPlayerDecisions.Count == _players.Count)
                {
                    _phase = MatchPhase.Main;
                    CreateLogEvent("MULLIGAN_RESOLVED", "Both players finalized mulligan.");
                    CreateChoicePrompt(
                        _activePlayerId,
                        "END_TURN",
                        "End your turn?",
                        ["END_TURN"]);
                }
            }
            else if (string.Equals(prompt.Kind, "END_TURN", StringComparison.Ordinal))
            {
                if (_phase != MatchPhase.Main)
                {
                    throw new InvalidOperationException("End turn is only available in the main phase.");
                }

                if (!string.Equals(normalizedOption, "END_TURN", StringComparison.Ordinal))
                {
                    throw new InvalidOperationException("Unsupported option for END_TURN.");
                }

                if (!string.Equals(submission.PlayerId, _activePlayerId, StringComparison.Ordinal))
                {
                    throw new InvalidOperationException("Only the active player can end the turn.");
                }

                var previousActivePlayerId = _activePlayerId;
                CreateLogEvent("TURN_END", $"Player {previousActivePlayerId} ended turn {_turnNumber}.");

                _turnNumber += 1;
                _activePlayerId = GetOtherPlayerId(previousActivePlayerId);

                CreateLogEvent("TURN_START", $"Turn {_turnNumber} started for player {_activePlayerId}.");
                CreateChoicePrompt(
                    _activePlayerId,
                    "END_TURN",
                    "End your turn?",
                    ["END_TURN"]);
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
                        LifeCount = player.LifeCount
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

    private sealed class PlayerSlot
    {
        public string PlayerId { get; init; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public bool Connected { get; set; }
        public int DeckCount { get; set; }
        public int HandCount { get; set; }
        public int LifeCount { get; set; }
    }
}

public sealed record MatchUpdate
{
    public GameStateDto StateSnapshot { get; init; } = new();
    public IReadOnlyList<LogEventDto> LogEvents { get; init; } = [];
    public IReadOnlyList<ChoicePromptDto> ChoicePrompts { get; init; } = [];
}
