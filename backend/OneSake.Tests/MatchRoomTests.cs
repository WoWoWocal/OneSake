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
}
