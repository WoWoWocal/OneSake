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
        }

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
        Assert.Equal("END_TURN", endTurnPrompt.Kind);
        Assert.Equal("p1", endTurnPrompt.PlayerId);

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
        Assert.Equal("END_TURN", nextEndTurnPrompt.Kind);
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
        Assert.Equal("END_TURN", endTurnPrompt.Kind);
        Assert.Equal("p1", endTurnPrompt.PlayerId);
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
        Assert.Equal("END_TURN", endTurnPrompt.Kind);
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
