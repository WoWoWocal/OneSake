# Sprint 1 Backlog (Vertical Slice Foundation)

## 1) DTOs and Contracts Baseline
**Goal:** Define a minimal shared contract for realtime match state and events.  
**Tasks:**
- Add `MatchPhase`, `PlayerStateDto`, `GameStateDto`.
- Add `ChoicePromptDto`, `ChoiceSubmissionDto`.
- Add `ChatMessageDto`, `LogEventDto`.
**Definition of Done:**
- Backend builds with the new DTOs.
- Fields are consistent with frontend types.
**Test notes:** Build backend and check JSON payload shape from hub events.

## 2) In-Memory MatchRoom and RoomManager
**Goal:** Create a simple in-memory room runtime for 2-player matches.  
**Tasks:**
- Add `MatchRoom` with state, prompts, log sequence.
- Add `MatchRoomManager` with `GetOrCreate` and `Get`.
- Enforce max 2 players per room.
**Definition of Done:**
- Joining player 3 is rejected.
- Room state snapshot can be created at any time.
**Test notes:** Unit-test room creation and join behavior.

## 3) StartMatch Flow
**Goal:** Start a minimal match from lobby with deterministic initial state.  
**Tasks:**
- Set `TurnNumber=1`, `Phase=Mulligan`, active player = first join.
- Initialize each player (`Deck=50`, `Hand=5`, `Life=5`).
- Emit `START_MATCH` and `DRAW_OPENING_HAND`.
**Definition of Done:**
- Both players receive updated state after start.
- Opening state values match MVP rules.
**Test notes:** Verify snapshot and log events after `StartMatch`.

## 4) Choice Prompt and Submission Flow
**Goal:** Support server-driven choices and player submissions.  
**Tasks:**
- Track open prompts by `ChoiceId`.
- Validate ownership (`PlayerId`) and option values.
- Return state, new logs, and new prompts after submission.
**Definition of Done:**
- Invalid `ChoiceId` or wrong player is rejected.
- Valid submission updates server state correctly.
**Test notes:** Unit-test positive and negative submit paths.

## 5) Mulligan Resolution
**Goal:** Finish mulligan phase only when both players answered.  
**Tasks:**
- Create `MULLIGAN_DECISION` prompt for both players.
- Track both decisions.
- On second decision: set phase to `Main`, emit `MULLIGAN_RESOLVED`, create `END_TURN` for active player.
**Definition of Done:**
- Match remains in `Mulligan` until both decisions are present.
- Exactly one end-turn prompt exists for active player.
**Test notes:** Simulate both mulligan choices in sequence.

## 6) End Turn Flow
**Goal:** Alternate active player and turns with a minimal loop.  
**Tasks:**
- Accept `END_TURN` only for active player.
- Emit `TURN_END`, increment turn, switch active player.
- Emit `TURN_START`, issue next `END_TURN` prompt.
**Definition of Done:**
- Active player switches after each valid end turn.
- Turn number increments by one each time.
**Test notes:** Unit-test two consecutive turn transitions.

## 7) SignalR Hub Methods and Events
**Goal:** Expose the room runtime via hub methods with clear events.  
**Tasks:**
- Add `JoinRoom`, `StartMatch`, `SubmitChoice`, `SendChat`.
- Use `roomCode` as SignalR group key.
- Emit `StateSnapshot`, `ChoicePrompt`, `ChatMessage`, `LogEvent`.
**Definition of Done:**
- Join/start/submit/chat trigger expected events.
- Room not found and invalid input return clear errors.
**Test notes:** Manual test with two browser tabs.

## 8) Frontend Lobby and Match View
**Goal:** Provide a minimal, playable view for room and turn flow.  
**Tasks:**
- Build lobby with room/display name and buttons.
- Show state (`RoomCode`, `TurnNumber`, `Phase`, `ActivePlayerId`).
- Show both players (`Deck`, `Hand`, `Life`, connection).
**Definition of Done:**
- User can join room and start match from UI.
- State updates live when actions happen.
**Test notes:** Verify with two clients in same room.

## 9) Choice Sheet + Log + Chat
**Goal:** Make choices and communication visible in one screen.  
**Tasks:**
- Show sticky choice sheet only for local player.
- Add buttons for `KEEP`, `MULLIGAN`, `END_TURN`.
- Add log list and chat list with simple input/send.
**Definition of Done:**
- Local player can submit prompts from UI.
- Chat and log append in realtime.
**Test notes:** Send chat in tab A, verify in tab B.

## 10) Verification and Documentation
**Goal:** Keep implementation testable and understandable for the team.  
**Tasks:**
- Update `docs/api-contract.md` and `docs/event-log-catalog.md`.
- Run `npm ci`, `npm run lint`, `npm run build`.
- Run `dotnet restore/build/test` when available.
**Definition of Done:**
- Checks pass in CI-like local run.
- Docs match actual method/event names.
**Test notes:** Include command outputs in PR notes.
