using System.Text.Json.Serialization;
using OneSake.Server.Hubs;
using OneSake.Server.Match;
using OneSake.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// =========================
// SERVICE CONFIGURATION
// =========================

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddControllers(); // Support Adden fuer Controllers
builder.Services.AddHttpClient<CardService>();

// Enables Swagger (API documentation UI)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// SignalR aktivieren fuer Real-Time Kommunikation
builder.Services
    .AddSignalR()
    .AddJsonProtocol(options =>
    {
        // Enums als Strings serializieren anstatt nummern -> statt zb. runnning:1 hat man running:works 
        options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
// Singleton service um game rooms zu managen
builder.Services.AddSingleton<MatchRoomManager>();
// Erlaubt frontend (localhost:5173) zu backend zu reden
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

var app = builder.Build();

// =========================
// MIDDLEWARE PIPELINE
// =========================

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection(); // Redirekt Http zu Https ( derzeit aber optional ) 

app.UseCors("AllowFrontend"); // Enable Cors

app.MapControllers(); // Controllers Map 

app.MapHub<MatchHub>("/matchHub");

app.Run();

// NOTE:
// Controllers sind auto-discovered Komponente also kann man einfach per MapController und AddControllers diese einfach hinzufuegen
