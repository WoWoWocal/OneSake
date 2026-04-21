# API Contract

## SignalR Hub: `MatchHub` (`/matchHub`)

### Hub Methods
- `JoinRoom(string roomCode, string displayName)`
- `StartMatch(string roomCode)`
- `SubmitChoice(string roomCode, ChoiceSubmissionDto submission)`
- `SendChat(string roomCode, string text)`

### Client Events
- `StateSnapshot(GameStateDto)`
- `ChoicePrompt(ChoicePromptDto)`
- `ChatMessage(ChatMessageDto)`
- `LogEvent(LogEventDto)`

## DTOs

### `GameStateDto`
```json
{
  "roomCode": "ABCD",
  "turnNumber": 1,
  "activePlayerId": "connection-1",
  "phase": "Mulligan",
  "players": [
    {
      "playerId": "connection-1",
      "displayName": "Alice",
      "connected": true,
      "deckCount": 50,
      "handCount": 5,
      "lifeCount": 5
    },
    {
      "playerId": "connection-2",
      "displayName": "Bob",
      "connected": true,
      "deckCount": 50,
      "handCount": 5,
      "lifeCount": 5
    }
  ]
}
```

### `ChoicePromptDto`
```json
{
  "choiceId": "1f5f2d7039dc4e7eb7fb6dd586f785c6",
  "playerId": "connection-1",
  "kind": "MULLIGAN_DECISION",
  "title": "Do you want to keep your opening hand?",
  "options": ["KEEP", "MULLIGAN"]
}
```

### `ChoiceSubmissionDto`
```json
{
  "choiceId": "1f5f2d7039dc4e7eb7fb6dd586f785c6",
  "playerId": "connection-1",
  "selectedOption": "KEEP"
}
```

### `ChatMessageDto`
```json
{
  "roomCode": "ABCD",
  "senderId": "connection-1",
  "text": "gg hf",
  "tsUnixMs": 1776735200000
}
```

### `LogEventDto`
```json
{
  "roomCode": "ABCD",
  "seq": 4,
  "type": "TURN_START",
  "text": "Turn 2 started for player connection-2.",
  "turnNumber": 2,
  "phase": "Main",
  "tsUnixMs": 1776735201000
}
```

## Notes
- `roomCode` is used as the SignalR group key.
- MVP room size is max 2 players.
- `StartMatch` requires exactly 2 joined players.
