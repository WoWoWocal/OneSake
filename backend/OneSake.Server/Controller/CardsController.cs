using Microsoft.AspNetCore.Mvc;
using OneSake.Server.Services;

namespace OneSake.Server.Controllers;

// Marks this as an API Controller
[ApiController]

// Base Route -> /cards
[Route("[controller]")]
public class CardsController : ControllerBase
{
    private readonly CardService _cardService;
    private readonly CardImportService _cardImportService;

    // inject services
    public CardsController(CardService cardService, CardImportService cardImportService)
    {
        _cardService = cardService;
        _cardImportService = cardImportService;
    }

    // GET /cards/OP01-001
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCardsById(string id)
    {
        var cards = await _cardService.GetCardsByIdAsync(id);

        // Falls nichts gefunden wurde return 404
        if (cards == null || cards.Count == 0) return NotFound();

        return Ok(cards);
    }

    // GET /cards/set/OP01
    [HttpGet("set/{set_id}")]
    public async Task<IActionResult> GetSetById(string set_id)
    {
        var set = await _cardService.GetSetByIdAsync(set_id);

        Console.WriteLine($"Fetching Set {set_id}");
        Console.WriteLine($"Count: {set.Count}");

        if (set == null || set.Count == 0) return NotFound();

        return Ok(set);
    }

    // POST /cards/import/OP01
    [HttpPost("import/{setId}")]
    public async Task<IActionResult> ImportSet(string setId)
    {
        var result = await _cardImportService.ImportSetAsync(setId);

        if (result.TotalFromApi == 0)
        {
            return NotFound($"No cards found for set {setId}.");
        }

        return Ok(result);
    }
}