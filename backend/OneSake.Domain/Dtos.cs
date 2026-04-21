namespace OneSake.Domain;

public enum MatchPhase
{
    Lobby,
    Mulligan,
    Main,
    GameOver
}

public record PlayerStateDto
{
    public string PlayerId { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public bool Connected { get; init; }
    public int DeckCount { get; init; }
    public int HandCount { get; init; }
    public int LifeCount { get; init; }
}

public record GameStateDto
{
    public string RoomCode { get; init; } = string.Empty;
    public int TurnNumber { get; init; }
    public string ActivePlayerId { get; init; } = string.Empty;
    public MatchPhase Phase { get; init; } = MatchPhase.Lobby;
    public IReadOnlyList<PlayerStateDto> Players { get; init; } = [];
}

public record ChoicePromptDto
{
    public string ChoiceId { get; init; } = string.Empty;
    public string PlayerId { get; init; } = string.Empty;
    public string Kind { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public IReadOnlyList<string> Options { get; init; } = [];
}

public record ChoiceSubmissionDto
{
    public string ChoiceId { get; init; } = string.Empty;
    public string PlayerId { get; init; } = string.Empty;
    public string SelectedOption { get; init; } = string.Empty;
}

public record ChatMessageDto
{
    public string RoomCode { get; init; } = string.Empty;
    public string SenderId { get; init; } = string.Empty;
    public string Text { get; init; } = string.Empty;
    public long TsUnixMs { get; init; }
}

public record LogEventDto
{
    public string RoomCode { get; init; } = string.Empty;
    public int Seq { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Text { get; init; } = string.Empty;
    public int TurnNumber { get; init; }
    public MatchPhase Phase { get; init; } = MatchPhase.Lobby;
    public long TsUnixMs { get; init; }
}
