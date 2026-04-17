namespace OneSake.Domain;

public record ChatMessageDto(string SenderId, string Text, DateTime Timestamp);

public record LogEventDto(int Seq, DateTime Timestamp, string Type, string Text);