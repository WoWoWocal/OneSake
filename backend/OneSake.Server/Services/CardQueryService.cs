using Microsoft.EntityFrameworkCore;
using OneSake.Persistence;
using OneSake.Persistence.Entities;

namespace OneSake.Server.Services;

public class CardQueryService
{
    private readonly OneSakeDbContext _dbContext;

    public CardQueryService(OneSakeDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<CardDto>> GetCardsByIdAsync(string cardId)
    {
        var cards = await _dbContext.Cards
            .AsNoTracking()
            .Where(card => card.CardId == cardId)
            .ToListAsync();

        return cards.Select(MapToDto).ToList();
    }

    public async Task<List<CardDto>> GetSetByIdAsync(string setId)
    {
        var cards = await _dbContext.Cards
            .AsNoTracking()
            .Where(card => card.SetId == setId)
            .OrderBy(card => card.CardId)
            .ToListAsync();

        return cards.Select(MapToDto).ToList();
    }

    private static CardDto MapToDto(Card card)
    {
        return new CardDto
        {
            InventoryPrice = card.InventoryPrice is null ? null : (float)card.InventoryPrice.Value,
            MarketPrice = card.MarketPrice is null ? null : (float)card.MarketPrice.Value,

            CardName = card.CardName,
            SetName = card.SetName,
            CardText = card.CardText,
            SetId = card.SetId,
            Rarity = card.Rarity,
            CardId = card.CardId,
            Color = card.Color,
            Type = card.Type,

            Life = card.Life,
            CardCost = card.CardCost,
            CardPower = card.CardPower,
            SubTypes = card.SubTypes,
            CounterAmount = card.CounterAmount,
            Attribute = card.Attribute,

            DateScraped = card.DateScraped,

            CardImageId = card.CardImageId,
            ImageURL = card.ImageUrl
        };
    }
}