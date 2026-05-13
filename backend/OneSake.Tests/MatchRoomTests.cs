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
            Assert.Equal(50, player.DeckCount);
            Assert.Equal(5, player.HandCount);
            Assert.Equal(5, player.LifeCount);
        }

        Assert.Equal(2, update.ChoicePrompts.Count);
        Assert.All(update.ChoicePrompts, prompt => Assert.Equal("MULLIGAN_DECISION", prompt.Kind));
        Assert.Contains(update.LogEvents, logEvent => logEvent.Type == "START_MATCH");
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

        var secondMulligan = room.SubmitChoice(new ChoiceSubmissionDto
        {
            ChoiceId = p2MulliganPrompt.ChoiceId,
            PlayerId = "p2",
            SelectedOption = "MULLIGAN"
        });

        Assert.Equal(MatchPhase.Main, secondMulligan.StateSnapshot.Phase);
        Assert.Contains(secondMulligan.LogEvents, logEvent => logEvent.Type == "MULLIGAN_RESOLVED");
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
        Assert.Contains(endTurnUpdate.LogEvents, logEvent => logEvent.Type == "TURN_END");
        Assert.Contains(endTurnUpdate.LogEvents, logEvent => logEvent.Type == "TURN_START");
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
}
