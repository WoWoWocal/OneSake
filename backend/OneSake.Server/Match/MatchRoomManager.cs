namespace OneSake.Server.Match;

public sealed class MatchRoomManager
{
    private readonly object _sync = new();
    private readonly Dictionary<string, MatchRoom> _rooms = new(StringComparer.OrdinalIgnoreCase);

    public MatchRoom GetOrCreate(string roomCode)
    {
        lock (_sync)
        {
            if (_rooms.TryGetValue(roomCode, out var room))
            {
                return room;
            }

            var createdRoom = new MatchRoom(roomCode);
            _rooms[roomCode] = createdRoom;
            return createdRoom;
        }
    }

    public MatchRoom? Get(string roomCode)
    {
        lock (_sync)
        {
            _rooms.TryGetValue(roomCode, out var room);
            return room;
        }
    }
}
