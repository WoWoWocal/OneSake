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

    private readonly Dictionary<string, List<CardDto>> _cardCache = new(); // Dictionary mit String als key und liste von den karten da es mehrere karten gibt per person zb. Zoro Parallel und Zoro Normal fuer zb. OP01-001
    private readonly Dictionary<string, List<CardDto>> _setCache = new(); // Dictionary mit key um ganze sets zu bekommen, bruachbar um Deckbuilder zu machen

    // Holt Karten von der externen API
    public async Task<List<CardDto>> GetCardsByIdAsync(string id)
    {
        if (_cardCache.ContainsKey(id)) return _cardCache[id];
        // API Endpoint
        var url = $"https://optcgapi.com/api/sets/card/{id}/";

        try
        {
            var cards = await _http.GetFromJsonAsync<List<CardDto>>(url) ?? new List<CardDto>();

            // Storing Cache
            _cardCache[id] = cards;

            return cards;
        }

        catch
        {
            return new List<CardDto>();
        }
    }

    public async Task<List<CardDto>> GetSetByIdAsync(string set_id)
    {
        if (_setCache.ContainsKey(set_id)) return _setCache[set_id];

        // API Endpoint
        var url = $"https://optcgapi.com/api/sets/{set_id}/";

        try
        {
            var set = await _http.GetFromJsonAsync<List<CardDto>>(url) ?? new List<CardDto>();

            _setCache[set_id] = set;

            return set;
        }
        catch
        {
            return new List<CardDto>();
        }
    }

}


