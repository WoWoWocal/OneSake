# Event Log Catalog

All log events are emitted as `LogEventDto` with:
- `roomCode`
- `seq` (monotonic per room)
- `type`
- `text`
- `turnNumber`
- `phase`
- `tsUnixMs`

## Event Types

### `JOIN`
- Trigger: Player joins room.
- Example text: `Alice joined room ABCD.`

### `START_MATCH`
- Trigger: `StartMatch` accepted.
- Example text: `Match started.`

### `DRAW_OPENING_HAND`
- Trigger: Start sequence after match start.
- Example text: `Both players drew their opening hand.`

### `MULLIGAN_RESOLVED`
- Trigger: Both mulligan decisions received.
- Example text: `Both players finalized mulligan.`

### `TURN_END`
- Trigger: Active player submits `END_TURN`.
- Example text: `Player connection-1 ended turn 1.`

### `TURN_START`
- Trigger: After turn switch to the next active player.
- Example text: `Turn 2 started for player connection-2.`

### `CHAT`
- Trigger: `SendChat` hub method.
- Example text: `Player connection-1: gg hf`
