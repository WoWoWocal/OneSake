using System.Net.Http.Json;

namespace OneSake.Server.Services;

// Dieser Service ist dafuer zustaendig externe API (optcgapi) aufzurufen
public class CardService

{
    private readonly HttpClient _http;
    // HttpClient wird automatisch von Asp.Net injected
    public CardService(HttpClient http)
    {
        _http = http;
    }

    // Holt Karten von der externen API
    public async Task<List<CardDto>> GetCardsByIdAsync(string id)
    {
        // API Endpoint
        var url = $"https://optcgapi.com/api/sets/card/{id}/";

        var cards = await _http.GetFromJsonAsync<List<CardDto>>(url);

        return cards ?? new List<CardDto>();
    }
}
