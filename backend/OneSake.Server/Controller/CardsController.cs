using Microsoft.AspNetCore.Mvc;
using OneSake.Server.Services;
using System.Runtime.CompilerServices;

namespace OneSake.Server.Controllers;

// Marks this as an API Controller
[ApiController]

// Base Route -> /cards
[Route("[controller]")]
public class CardsController : ControllerBase
{
    private readonly CardService _cardService;

    // inject CardService
    public CardsController (CardService cardService)
    {
        _cardService = cardService;
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

    [HttpGet("set/{set_id}")]
    public async Task<IActionResult> GetSetById(string set_id)
    {
        var set = await _cardService.GetSetByIdAsync(set_id);

        Console.WriteLine($"Fetching Set {set_id}");

        Console.WriteLine($"Count: {set.Count}");

        if (set == null || set.Count == 0) return NotFound();

        return Ok(set);
    }
}
