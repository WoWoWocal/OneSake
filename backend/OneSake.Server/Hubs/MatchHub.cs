using Microsoft.AspNetCore.SignalR;
using OneSake.Domain;
using OneSake.Server.Match;

namespace OneSake.Server.Hubs;

public class MatchHub : Hub
{
    private readonly MatchRoomManager _roomManager;

    public MatchHub(MatchRoomManager roomManager)
    {
        _roomManager = roomManager;
    }

    public async Task JoinRoom(string roomCode, string displayName)
    {
        var normalizedRoomCode = NormalizeRoomCode(roomCode);
        var room = _roomManager.GetOrCreate(normalizedRoomCode);

        await Groups.AddToGroupAsync(Context.ConnectionId, normalizedRoomCode);
        var update = room.JoinPlayer(Context.ConnectionId, displayName);
        await PublishMatchUpdate(normalizedRoomCode, update);
    }

    public async Task StartMatch(string roomCode)
    {
        var normalizedRoomCode = NormalizeRoomCode(roomCode);
        var room = GetExistingRoom(normalizedRoomCode);
        var update = room.StartMatch();
        await PublishMatchUpdate(normalizedRoomCode, update);
    }

    public async Task SubmitChoice(string roomCode, ChoiceSubmissionDto submission)
    {
        var normalizedRoomCode = NormalizeRoomCode(roomCode);
        var room = GetExistingRoom(normalizedRoomCode);

        if (!string.Equals(submission.PlayerId, Context.ConnectionId, StringComparison.Ordinal))
        {
            throw new HubException("Invalid player id for this connection.");
        }

        var normalizedSubmission = submission with
        {
            ChoiceId = submission.ChoiceId.Trim(),
            PlayerId = Context.ConnectionId,
            SelectedOption = submission.SelectedOption.Trim()
        };

        var update = room.SubmitChoice(normalizedSubmission);
        await PublishMatchUpdate(normalizedRoomCode, update);
    }

    public async Task SendChat(string roomCode, string text)
    {
        var normalizedRoomCode = NormalizeRoomCode(roomCode);
        var room = GetExistingRoom(normalizedRoomCode);
        var normalizedText = text.Trim();

        if (string.IsNullOrWhiteSpace(normalizedText))
        {
            return;
        }

        var senderId = room.ResolvePlayerId(Context.ConnectionId);
        var chatMessage = new ChatMessageDto
        {
            RoomCode = normalizedRoomCode,
            SenderId = senderId,
            Text = normalizedText,
            TsUnixMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };

        await Clients.Group(normalizedRoomCode).SendAsync("ChatMessage", chatMessage);

        var logEvent = room.CreateLogEvent("CHAT", $"Player {senderId}: {normalizedText}");
        await Clients.Group(normalizedRoomCode).SendAsync("LogEvent", logEvent);
    }

    private MatchRoom GetExistingRoom(string roomCode)
    {
        return _roomManager.Get(roomCode) ?? throw new HubException("Room does not exist.");
    }

    private static string NormalizeRoomCode(string roomCode)
    {
        var normalizedRoomCode = roomCode.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(normalizedRoomCode))
        {
            throw new HubException("roomCode is required.");
        }

        return normalizedRoomCode;
    }

    private async Task PublishMatchUpdate(string roomCode, MatchUpdate update)
    {
        await Clients.Group(roomCode).SendAsync("StateSnapshot", update.StateSnapshot);

        foreach (var logEvent in update.LogEvents)
        {
            await Clients.Group(roomCode).SendAsync("LogEvent", logEvent);
        }

        foreach (var prompt in update.ChoicePrompts)
        {
            await Clients.Client(prompt.PlayerId).SendAsync("ChoicePrompt", prompt);
        }
    }
}
