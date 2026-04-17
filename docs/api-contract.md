# API Contract

## SignalR Hub: MatchHub

### Methods
- `JoinRoom(string roomCode)`: Join a room and broadcast join message.
- `SendChat(string roomCode, string text)`: Send chat message to room.
- `SendLog(string roomCode, string text, string type = "SYSTEM")`: Send log event to room.

### Events
- `ChatMessage(ChatMessageDto)`: Broadcasted when chat sent or player joins.
- `LogEvent(LogEventDto)`: Broadcasted when log sent.

## DTOs
- `ChatMessageDto`: { senderId: string, text: string, timestamp: DateTime }
- `LogEventDto`: { seq: int, timestamp: DateTime, type: string, text: string }