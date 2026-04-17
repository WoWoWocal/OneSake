using Microsoft.AspNetCore.SignalR;
using OneSake.Domain;

namespace OneSake.Server.Hubs;

public class MatchHub : Hub
{
    private static readonly Dictionary<string, int> _roomSequences = new();

    public async Task JoinRoom(string roomCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
        await Clients.Group(roomCode).SendAsync("ChatMessage", new ChatMessageDto(Context.ConnectionId, $"Player {Context.ConnectionId} joined the room.", DateTime.UtcNow));
    }

    public async Task SendChat(string roomCode, string text)
    {
        await Clients.Group(roomCode).SendAsync("ChatMessage", new ChatMessageDto(Context.ConnectionId, text, DateTime.UtcNow));
    }

    public async Task SendLog(string roomCode, string text, string type = "SYSTEM")
    {
        var seq = GetNextSequence(roomCode);
        await Clients.Group(roomCode).SendAsync("LogEvent", new LogEventDto(seq, DateTime.UtcNow, type, text));
    }

    private int GetNextSequence(string roomCode)
    {
        if (!_roomSequences.ContainsKey(roomCode))
        {
            _roomSequences[roomCode] = 0;
        }
        return ++_roomSequences[roomCode];
    }
}