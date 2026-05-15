using OneSake.Domain;
using OneSake.Server.Match;

namespace OneSake.Tests;

public class MatchRoomTests
{
    [Fact]
    public void StartMatch_InitializesMulliganState()
    {
        var room = new MatchRoom("ABCD");
        room.JoinPlayer("p1", "Alice");
        room.JoinPlayer("p2", "Bob");
        room.SetPlayerDeck("p1", CreateDeck("deck-1", "Alice Deck"));
        room.SetPlayerDeck("p2", CreateDeck("deck-2", "Bob Deck"));

        var update = room.StartMatch();

        Assert.Equal("ABCD", update.StateSnapshot.RoomCode);
        Assert.Equal(MatchPhase.Mulligan, update.StateSnapshot.Phase);
        Assert.Equal(1, update.StateSnapshot.TurnNumber);
        Assert.Equal("p1", update.StateSnapshot.ActivePlayerId);
        Assert.Equal(2, update.StateSnapshot.Players.Count);

        foreach (var player in update.StateSnapshot.Players)
        {
            Assert.Equal(45, player.DeckCount);
            Assert.Equal(5, player.HandCount);
            Assert.Equal(5, player.LifeCount);
            Assert.Equal(0, player.BoardCount);
            Assert.Empty(player.HandCards);
        }

        var p1PrivatePlayer = update.StateSnapshots["p1"].Players.Single(player => player.PlayerId == "p1");
        var p2AsSeenByP1 = update.StateSnapshots["p1"].Players.Single(player => player.PlayerId == "p2");
        var p1AsSeenByP2 = update.StateSnapshots["p2"].Players.Single(player => player.PlayerId == "p1");
        Assert.Equal(5, p1PrivatePlayer.HandCards.Count);
        Assert.All(p1PrivatePlayer.HandCards, card =>
        {
            Assert.False(string.IsNullOrWhiteSpace(card.InstanceId));
            Assert.False(string.IsNullOrWhiteSpace(card.CardId));
            Assert.False(string.IsNullOrWhiteSpace(card.Name));
        });
        Assert.Equal(5, p1PrivatePlayer.HandCards.Select(card => card.InstanceId).Distinct().Count());
        Assert.Empty(p2AsSeenByP1.HandCards);
        Assert.Empty(p1AsSeenByP2.HandCards);

        Assert.Equal(2, update.ChoicePrompts.Count);
        Assert.All(update.ChoicePrompts, prompt => Assert.Equal("MULLIGAN_DECISION", prompt.Kind));
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "START_MATCH");
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "SHUFFLE_DECKS");
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "DRAW_OPENING_HAND");
    }

    [Fact]
    public void SubmitChoice_ResolvesMulliganAndAdvancesTurn()
    {
        var room = new MatchRoom("ABCD");
        room.JoinPlayer("p1", "Alice");
        room.JoinPlayer("p2", "Bob");
        room.SetPlayerDeck("p1", CreateDeck("deck-1", "Alice Deck"));
        room.SetPlayerDeck("p2", CreateDeck("deck-2", "Bob Deck"));

        var startUpdate = room.StartMatch();
        var p1MulliganPrompt = startUpdate.ChoicePrompts.Single(prompt => prompt.PlayerId == "p1");
        var p2MulliganPrompt = startUpdate.ChoicePrompts.Single(prompt => prompt.PlayerId == "p2");

        var firstMulligan = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = p1MulliganPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "KEEP"
        });

        Assert.Equal(MatchPhase.Mulligan, firstMulligan.StateSnapshot.Phase);
        Assert.Empty(firstMulligan.ChoicePrompts);
        Assert.Contains(firstMulligan.LogEvents, logEvent => logEvent.Type == "MULLIGAN_KEEP");

        var secondMulligan = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = p2MulliganPrompt.ChoiceId,
            PlayerId = "p2",
            SelectedOption = "MULLIGAN"
        });

        Assert.Equal(MatchPhase.Main, secondMulligan.StateSnapshot.Phase);
        Assert.Contains(secondMulligan.LogEvents, logEvent => logEvent.Type == "MULLIGAN_TAKEN");
        Assert.Contains(secondMulligan.LogEvents, logEvent => logEvent.Type == "MULLIGAN_RESOLVED");
        Assert.Contains(secondMulligan.LogEvents, logEvent => logEvent.Type == "REFRESH_PHASE");
        Assert.Contains(secondMulligan.LogEvents, logEvent => logEvent.Type == "DRAW_CARD");
        Assert.Contains(secondMulligan.LogEvents, logEvent => logEvent.Type == "MAIN_PHASE");
        var activePlayerAfterMulligan = secondMulligan.StateSnapshot.Players.Single(player => player.PlayerId == "p1");
        var otherPlayerAfterMulligan = secondMulligan.StateSnapshot.Players.Single(player => player.PlayerId == "p2");
        Assert.Equal(44, activePlayerAfterMulligan.DeckCount);
        Assert.Equal(6, activePlayerAfterMulligan.HandCount);
        Assert.Equal(45, otherPlayerAfterMulligan.DeckCount);
        Assert.Equal(5, otherPlayerAfterMulligan.HandCount);
        var endTurnPrompt = Assert.Single(secondMulligan.ChoicePrompts);
        Assert.Equal("MAIN_ACTION", endTurnPrompt.Kind);
        Assert.Equal("p1", endTurnPrompt.PlayerId);
        Assert.Contains("PLAY_CARD", endTurnPrompt.Options);
        Assert.Contains("END_TURN", endTurnPrompt.Options);

        var endTurnUpdate = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = endTurnPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "END_TURN"
        });

        Assert.Equal(2, endTurnUpdate.StateSnapshot.TurnNumber);
        Assert.Equal("p2", endTurnUpdate.StateSnapshot.ActivePlayerId);
        Assert.Equal(MatchPhase.Main, endTurnUpdate.StateSnapshot.Phase);
        Assert.Contains(endTurnUpdate.LogEvents, logEvent => logEvent.Type == "END_PHASE");
        Assert.Contains(endTurnUpdate.LogEvents, logEvent => logEvent.Type == "TURN_END");
        Assert.Contains(endTurnUpdate.LogEvents, logEvent => logEvent.Type == "REFRESH_PHASE");
        Assert.Contains(endTurnUpdate.LogEvents, logEvent => logEvent.Type == "DRAW_CARD");
        Assert.Contains(endTurnUpdate.LogEvents, logEvent => logEvent.Type == "MAIN_PHASE");
        Assert.DoesNotContain(endTurnUpdate.LogEvents, logEvent => logEvent.Type == "TURN_START");
        var newActivePlayer = endTurnUpdate.StateSnapshot.Players.Single(player => player.PlayerId == "p2");
        Assert.Equal(44, newActivePlayer.DeckCount);
        Assert.Equal(6, newActivePlayer.HandCount);
        var nextEndTurnPrompt = Assert.Single(endTurnUpdate.ChoicePrompts);
        Assert.Equal("p2", nextEndTurnPrompt.PlayerId);
        Assert.Equal("MAIN_ACTION", nextEndTurnPrompt.Kind);
        Assert.Contains("PLAY_CARD", nextEndTurnPrompt.Options);
        Assert.Contains("END_TURN", nextEndTurnPrompt.Options);
    }

    [Fact]
    public void StartMatch_FailsWhenPlayersHaveNoDecks()
    {
        var room = new MatchRoom("ABCD");
        room.JoinPlayer("p1", "Alice");
        room.JoinPlayer("p2", "Bob");

        var error = Assert.Throws<InvalidOperationException>(() => room.StartMatch());

        Assert.Equal("Both players must select a deck before starting.", error.Message);
    }

    [Fact]
    public void SetPlayerDeck_StoresDeckDataInStateSnapshot()
    {
        var room = new MatchRoom("ABCD");
        room.JoinPlayer("p1", "Alice");

        var update = room.SetPlayerDeck("p1", CreateDeck("deck-1", "Alice Deck"));
        var player = Assert.Single(update.StateSnapshot.Players);

        Assert.True(player.HasDeck);
        Assert.Equal("Alice Deck", player.DeckName);
        Assert.Equal("OP01-001", player.LeaderCardId);
        Assert.Equal(50, player.MainDeckCount);
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "DECK_SELECTED");
    }

    [Fact]
    public void StartMatch_WorksWhenBothPlayersHaveDecks()
    {
        var room = new MatchRoom("ABCD");
        room.JoinPlayer("p1", "Alice");
        room.JoinPlayer("p2", "Bob");
        room.SetPlayerDeck("p1", CreateDeck("deck-1", "Alice Deck"));
        room.SetPlayerDeck("p2", CreateDeck("deck-2", "Bob Deck"));

        var update = room.StartMatch();

        Assert.Equal(MatchPhase.Mulligan, update.StateSnapshot.Phase);
        Assert.All(update.StateSnapshot.Players, player => Assert.True(player.HasDeck));
    }

    [Fact]
    public void StartMatch_UsesRegisteredDeckCardsForDeckAndHandCounts()
    {
        var room = new MatchRoom("ABCD");
        room.JoinPlayer("p1", "Alice");
        room.JoinPlayer("p2", "Bob");
        room.SetPlayerDeck("p1", CreateDeck("deck-1", "Alice Deck"));
        room.SetPlayerDeck("p2", CreateDeck("deck-2", "Bob Deck"));

        var update = room.StartMatch();

        Assert.All(update.StateSnapshot.Players, player =>
        {
            Assert.Equal(45, player.DeckCount);
            Assert.Equal(5, player.HandCount);
            Assert.Equal(5, player.LifeCount);
            Assert.Equal(0, player.BoardCount);
            Assert.Equal(50, player.MainDeckCount);
        });
    }

    [Fact]
    public void MulliganKeep_DoesNotChangeDeckOrHandCounts()
    {
        var room = new MatchRoom("ABCD");
        room.JoinPlayer("p1", "Alice");
        room.JoinPlayer("p2", "Bob");
        room.SetPlayerDeck("p1", CreateDeck("deck-1", "Alice Deck"));
        room.SetPlayerDeck("p2", CreateDeck("deck-2", "Bob Deck"));
        var startUpdate = room.StartMatch();
        var p1MulliganPrompt = startUpdate.ChoicePrompts.Single(prompt => prompt.PlayerId == "p1");

        var update = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = p1MulliganPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "KEEP"
        });
        var player = update.StateSnapshot.Players.Single(entry => entry.PlayerId == "p1");

        Assert.Equal(45, player.DeckCount);
        Assert.Equal(5, player.HandCount);
        Assert.Equal(MatchPhase.Mulligan, update.StateSnapshot.Phase);
        Assert.Empty(update.ChoicePrompts);
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "MULLIGAN_KEEP");
    }

    [Fact]
    public void MulliganTaken_RedrawsOpeningHandAndKeepsCountsCorrect()
    {
        var room = new MatchRoom("ABCD");
        room.JoinPlayer("p1", "Alice");
        room.JoinPlayer("p2", "Bob");
        room.SetPlayerDeck("p1", CreateDeck("deck-1", "Alice Deck"));
        room.SetPlayerDeck("p2", CreateDeck("deck-2", "Bob Deck"));
        var startUpdate = room.StartMatch();
        var p1MulliganPrompt = startUpdate.ChoicePrompts.Single(prompt => prompt.PlayerId == "p1");

        var update = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = p1MulliganPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "MULLIGAN"
        });
        var player = update.StateSnapshot.Players.Single(entry => entry.PlayerId == "p1");

        Assert.Equal(45, player.DeckCount);
        Assert.Equal(5, player.HandCount);
        Assert.Equal(MatchPhase.Mulligan, update.StateSnapshot.Phase);
        Assert.Empty(update.ChoicePrompts);
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "MULLIGAN_TAKEN");
    }

    [Fact]
    public void MulliganDecision_ResolvesOnlyAfterBothPlayersDecide()
    {
        var room = new MatchRoom("ABCD");
        room.JoinPlayer("p1", "Alice");
        room.JoinPlayer("p2", "Bob");
        room.SetPlayerDeck("p1", CreateDeck("deck-1", "Alice Deck"));
        room.SetPlayerDeck("p2", CreateDeck("deck-2", "Bob Deck"));
        var startUpdate = room.StartMatch();
        var p1MulliganPrompt = startUpdate.ChoicePrompts.Single(prompt => prompt.PlayerId == "p1");
        var p2MulliganPrompt = startUpdate.ChoicePrompts.Single(prompt => prompt.PlayerId == "p2");

        var firstDecision = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = p1MulliganPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "KEEP"
        });

        Assert.Equal(MatchPhase.Mulligan, firstDecision.StateSnapshot.Phase);
        Assert.Empty(firstDecision.ChoicePrompts);

        var secondDecision = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = p2MulliganPrompt.ChoiceId,
            PlayerId = "p2",
            SelectedOption = "KEEP"
        });

        Assert.Equal(MatchPhase.Main, secondDecision.StateSnapshot.Phase);
        var endTurnPrompt = Assert.Single(secondDecision.ChoicePrompts);
        Assert.Equal("MAIN_ACTION", endTurnPrompt.Kind);
        Assert.Equal("p1", endTurnPrompt.PlayerId);
        Assert.Contains("PLAY_CARD", endTurnPrompt.Options);
        Assert.Contains("END_TURN", endTurnPrompt.Options);
        Assert.Contains(secondDecision.LogEvents, logEvent => logEvent.Type == "MULLIGAN_RESOLVED");
        Assert.Contains(secondDecision.LogEvents, logEvent => logEvent.Type == "REFRESH_PHASE");
        Assert.Contains(secondDecision.LogEvents, logEvent => logEvent.Type == "DRAW_CARD");
        Assert.Contains(secondDecision.LogEvents, logEvent => logEvent.Type == "MAIN_PHASE");

        var activePlayer = secondDecision.StateSnapshot.Players.Single(player => player.PlayerId == "p1");
        var otherPlayer = secondDecision.StateSnapshot.Players.Single(player => player.PlayerId == "p2");
        Assert.Equal(44, activePlayer.DeckCount);
        Assert.Equal(6, activePlayer.HandCount);
        Assert.Equal(45, otherPlayer.DeckCount);
        Assert.Equal(5, otherPlayer.HandCount);
    }

    [Fact]
    public void DrawPhase_LogsDeckEmptyAndStillEntersMainWhenDrawDeckIsEmpty()
    {
        var room = new MatchRoom("ABCD");
        room.JoinPlayer("p1", "Alice");
        room.JoinPlayer("p2", "Bob");
        room.SetPlayerDeck("p1", CreateSmallDeck("deck-1", "Alice Small Deck"));
        room.SetPlayerDeck("p2", CreateDeck("deck-2", "Bob Deck"));
        var startUpdate = room.StartMatch();
        var p1MulliganPrompt = startUpdate.ChoicePrompts.Single(prompt => prompt.PlayerId == "p1");
        var p2MulliganPrompt = startUpdate.ChoicePrompts.Single(prompt => prompt.PlayerId == "p2");

        room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = p1MulliganPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "KEEP"
        });

        var update = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = p2MulliganPrompt.ChoiceId,
            PlayerId = "p2",
            SelectedOption = "KEEP"
        });
        var activePlayer = update.StateSnapshot.Players.Single(player => player.PlayerId == "p1");
        var endTurnPrompt = Assert.Single(update.ChoicePrompts);

        Assert.Equal(MatchPhase.Main, update.StateSnapshot.Phase);
        Assert.Equal(0, activePlayer.DeckCount);
        Assert.Equal(5, activePlayer.HandCount);
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "DECK_EMPTY");
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "MAIN_PHASE");
        Assert.Equal("p1", endTurnPrompt.PlayerId);
        Assert.Equal("MAIN_ACTION", endTurnPrompt.Kind);
        Assert.Contains("PLAY_CARD", endTurnPrompt.Options);
        Assert.Contains("END_TURN", endTurnPrompt.Options);
    }

    [Fact]
    public void MainPhasePrompt_OffersPlayCardAndEndTurnWhenActivePlayerHasHandCards()
    {
        var room = CreateStartedMainPhaseRoom(out var mainActionPrompt);

        var state = room.CreateStateSnapshot();
        var activePlayer = state.Players.Single(player => player.PlayerId == state.ActivePlayerId);

        Assert.Equal(MatchPhase.Main, state.Phase);
        Assert.Equal(6, activePlayer.HandCount);
        Assert.Equal("MAIN_ACTION", mainActionPrompt.Kind);
        Assert.Equal(activePlayer.PlayerId, mainActionPrompt.PlayerId);
        Assert.Contains("PLAY_CARD", mainActionPrompt.Options);
        Assert.Contains("END_TURN", mainActionPrompt.Options);
    }

    [Fact]
    public void MainActionPlayCard_ReducesHandAndCreatesNextMainActionPrompt()
    {
        var room = CreateStartedMainPhaseRoom(out var mainActionPrompt);

        var update = room.SubmitChoice(CreatePlayCardSubmission(room, mainActionPrompt, "p1"));
        var activePlayer = update.StateSnapshot.Players.Single(player => player.PlayerId == "p1");
        var nextPrompt = Assert.Single(update.ChoicePrompts);

        Assert.Equal(MatchPhase.Main, update.StateSnapshot.Phase);
        Assert.Equal(1, update.StateSnapshot.TurnNumber);
        Assert.Equal("p1", update.StateSnapshot.ActivePlayerId);
        Assert.Equal(5, activePlayer.HandCount);
        Assert.Equal(1, activePlayer.BoardCount);
        Assert.Equal(44, activePlayer.DeckCount);
        Assert.Single(activePlayer.BoardCards);
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "PLAY_CARD");
        Assert.Equal("MAIN_ACTION", nextPrompt.Kind);
        Assert.Equal("p1", nextPrompt.PlayerId);
        Assert.Contains("PLAY_CARD", nextPrompt.Options);
        Assert.Contains("ATTACK", nextPrompt.Options);
        Assert.Contains("END_TURN", nextPrompt.Options);
    }

    [Fact]
    public void MainActionPlayCard_FailsWithoutSelectedCardInstanceId()
    {
        var room = CreateStartedMainPhaseRoom(out var mainActionPrompt);

        var error = Assert.Throws<InvalidOperationException>(() => room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = mainActionPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "PLAY_CARD"
        }));

        Assert.Equal("Playing a card requires selectedCardInstanceId.", error.Message);
        var activePlayer = room.CreateStateSnapshot("p1").Players.Single(player => player.PlayerId == "p1");
        Assert.Equal(6, activePlayer.HandCount);
        Assert.Equal(0, activePlayer.BoardCount);
    }

    [Fact]
    public void MainActionPlayCard_PlaysSelectedCardInstance()
    {
        var room = CreateStartedMainPhaseRoom(out var mainActionPrompt);
        var selectedCard = room
            .CreateStateSnapshot("p1")
            .Players.Single(player => player.PlayerId == "p1")
            .HandCards[1];

        var update = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = mainActionPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "PLAY_CARD",
            SelectedCardInstanceId = selectedCard.InstanceId
        });
        var activePlayer = update.StateSnapshots["p1"].Players.Single(player => player.PlayerId == "p1");
        var boardCard = Assert.Single(activePlayer.BoardCards);

        Assert.Equal(selectedCard.InstanceId, boardCard.InstanceId);
        Assert.Equal(selectedCard.CardId, boardCard.CardId);
        Assert.DoesNotContain(activePlayer.HandCards, card => card.InstanceId == selectedCard.InstanceId);
        Assert.Equal(5, activePlayer.HandCount);
        Assert.Equal(1, activePlayer.BoardCount);
    }

    [Fact]
    public void MainActionPrompt_OffersAttackAfterPlayCard()
    {
        var room = CreateStartedMainPhaseRoom(out var mainActionPrompt);

        var update = room.SubmitChoice(CreatePlayCardSubmission(room, mainActionPrompt, "p1"));
        var activePlayer = update.StateSnapshot.Players.Single(player => player.PlayerId == "p1");
        var nextPrompt = Assert.Single(update.ChoicePrompts);

        Assert.Equal(1, activePlayer.BoardCount);
        Assert.Equal("MAIN_ACTION", nextPrompt.Kind);
        Assert.Contains("ATTACK", nextPrompt.Options);
    }

    [Fact]
    public void MainActionAttack_ReducesOpponentLifeAndCreatesNextMainActionPrompt()
    {
        var room = CreateStartedMainPhaseRoom(out var mainActionPrompt);
        var playUpdate = room.SubmitChoice(CreatePlayCardSubmission(room, mainActionPrompt, "p1"));
        var attackPrompt = Assert.Single(playUpdate.ChoicePrompts);

        var attackUpdate = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = attackPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "ATTACK"
        });
        var opponent = attackUpdate.StateSnapshot.Players.Single(player => player.PlayerId == "p2");
        var nextPrompt = Assert.Single(attackUpdate.ChoicePrompts);

        Assert.Equal(MatchPhase.Main, attackUpdate.StateSnapshot.Phase);
        Assert.Equal(4, opponent.LifeCount);
        Assert.Contains(attackUpdate.LogEvents, logEvent => logEvent.Type == "ATTACK");
        Assert.Contains(attackUpdate.LogEvents, logEvent => logEvent.Type == "LIFE_LOST");
        Assert.Equal("MAIN_ACTION", nextPrompt.Kind);
        Assert.Equal("p1", nextPrompt.PlayerId);
        Assert.Contains("ATTACK", nextPrompt.Options);
    }

    [Fact]
    public void MainActionAttack_IsNotOfferedWithoutPlayedCards()
    {
        var room = CreateStartedMainPhaseRoom(out var mainActionPrompt);

        Assert.DoesNotContain("ATTACK", mainActionPrompt.Options);
        var error = Assert.Throws<InvalidOperationException>(() => room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = mainActionPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "ATTACK"
        }));

        Assert.Equal("Selected option is invalid.", error.Message);
    }

    [Fact]
    public void MainActionAttack_FailsForNonActivePlayer()
    {
        var room = CreateStartedMainPhaseRoom(out var mainActionPrompt);
        var playUpdate = room.SubmitChoice(CreatePlayCardSubmission(room, mainActionPrompt, "p1"));
        var attackPrompt = Assert.Single(playUpdate.ChoicePrompts);

        var error = Assert.Throws<InvalidOperationException>(() => room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = attackPrompt.ChoiceId,
            PlayerId = "p2",
            SelectedOption = "ATTACK"
        }));

        Assert.Equal("Choice prompt does not belong to this player.", error.Message);
    }

    [Fact]
    public void MainActionAttack_EndsGameWhenOpponentLifeReachesZero()
    {
        var room = CreateStartedMainPhaseRoom(out var mainActionPrompt);
        var playUpdate = room.SubmitChoice(CreatePlayCardSubmission(room, mainActionPrompt, "p1"));

        var currentPrompt = Assert.Single(playUpdate.ChoicePrompts);
        MatchUpdate attackUpdate = playUpdate;
        for (var attackIndex = 0; attackIndex < 5; attackIndex += 1)
        {
            attackUpdate = room.SubmitChoice(new ChoiceSubmissionDto
            {
                ChoiceId = currentPrompt.ChoiceId,
                PlayerId = "p1",
                SelectedOption = "ATTACK"
            });

            if (attackIndex < 4)
            {
                currentPrompt = Assert.Single(attackUpdate.ChoicePrompts);
            }
        }

        var opponent = attackUpdate.StateSnapshot.Players.Single(player => player.PlayerId == "p2");
        Assert.Equal(MatchPhase.GameOver, attackUpdate.StateSnapshot.Phase);
        Assert.Equal(0, opponent.LifeCount);
        Assert.Empty(attackUpdate.ChoicePrompts);
        Assert.Contains(attackUpdate.LogEvents, logEvent => logEvent.Type == "ATTACK");
        Assert.Contains(attackUpdate.LogEvents, logEvent => logEvent.Type == "LIFE_LOST");
        Assert.Contains(attackUpdate.LogEvents, logEvent => logEvent.Type == "GAME_OVER");
    }

    [Fact]
    public void MainActionEndTurn_AdvancesToNextPlayerTurn()
    {
        var room = CreateStartedMainPhaseRoom(out var mainActionPrompt);

        var update = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = mainActionPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "END_TURN"
        });
        var newActivePlayer = update.StateSnapshot.Players.Single(player => player.PlayerId == "p2");
        var nextPrompt = Assert.Single(update.ChoicePrompts);

        Assert.Equal(MatchPhase.Main, update.StateSnapshot.Phase);
        Assert.Equal(2, update.StateSnapshot.TurnNumber);
        Assert.Equal("p2", update.StateSnapshot.ActivePlayerId);
        Assert.Equal(44, newActivePlayer.DeckCount);
        Assert.Equal(6, newActivePlayer.HandCount);
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "END_PHASE");
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "TURN_END");
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "REFRESH_PHASE");
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "DRAW_CARD");
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "MAIN_PHASE");
        Assert.Equal("MAIN_ACTION", nextPrompt.Kind);
        Assert.Equal("p2", nextPrompt.PlayerId);
        Assert.Contains("PLAY_CARD", nextPrompt.Options);
        Assert.Contains("END_TURN", nextPrompt.Options);
    }

    [Fact]
    public void MainActionPlayCard_FailsForNonActivePlayer()
    {
        var room = CreateStartedMainPhaseRoom(out var mainActionPrompt);

        var error = Assert.Throws<InvalidOperationException>(() => room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = mainActionPrompt.ChoiceId,
            PlayerId = "p2",
            SelectedOption = "PLAY_CARD"
        }));

        Assert.Equal("Choice prompt does not belong to this player.", error.Message);
    }

    private static ChoiceSubmissionDto CreatePlayCardSubmission(
        MatchRoom room,
        ChoicePromptDto prompt,
        string playerId,
        int handIndex = 0)
    {
        var card = room
            .CreateStateSnapshot(playerId)
            .Players.Single(player => player.PlayerId == playerId)
            .HandCards[handIndex];

        return new ChoiceSubmissionDto
        {
            ChoiceId = prompt.ChoiceId,
            PlayerId = playerId,
            SelectedOption = "PLAY_CARD",
            SelectedCardInstanceId = card.InstanceId
        };
    }

    private static MatchRoom CreateStartedMainPhaseRoom(out ChoicePromptDto mainActionPrompt)
    {
        var room = new MatchRoom("ABCD");
        room.JoinPlayer("p1", "Alice");
        room.JoinPlayer("p2", "Bob");
        room.SetPlayerDeck("p1", CreateDeck("deck-1", "Alice Deck"));
        room.SetPlayerDeck("p2", CreateDeck("deck-2", "Bob Deck"));
        var startUpdate = room.StartMatch();
        var p1MulliganPrompt = startUpdate.ChoicePrompts.Single(prompt => prompt.PlayerId == "p1");
        var p2MulliganPrompt = startUpdate.ChoicePrompts.Single(prompt => prompt.PlayerId == "p2");

        room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = p1MulliganPrompt.ChoiceId,
            PlayerId = "p1",
            SelectedOption = "KEEP"
        });

        var mainUpdate = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = p2MulliganPrompt.ChoiceId,
            PlayerId = "p2",
            SelectedOption = "KEEP"
        });

        mainActionPrompt = Assert.Single(mainUpdate.ChoicePrompts);
        return room;
    }

    private static PlayerDeckSubmissionDto CreateDeck(string deckId, string deckName)
    {
        return new PlayerDeckSubmissionDto
        {
            DeckId = deckId,
            DeckName = deckName,
            LeaderCardId = "OP01-001",
            Cards =
            [
                new PlayerDeckCardDto
                {
                    CardId = "OP01-016",
                    Name = "Main Card A",
                    Quantity = 4
                },
                new PlayerDeckCardDto
                {
                    CardId = "OP01-025",
                    Name = "Main Card B",
                    Quantity = 46
                }
            ]
        };
    }

    private static PlayerDeckSubmissionDto CreateSmallDeck(string deckId, string deckName)
    {
        return new PlayerDeckSubmissionDto
        {
            DeckId = deckId,
            DeckName = deckName,
            LeaderCardId = "OP01-001",
            Cards =
            [
                new PlayerDeckCardDto
                {
                    CardId = "OP01-016",
                    Name = "Main Card A",
                    Quantity = 5
                }
            ]
        };
    }
}
