namespace OneSake.Persistence.Entities;

public class Card
{
    public int Id { get; set; }

    public string CardId { get; set; } = "";
    public string CardName { get; set; } = "";
    public string SetId { get; set; } = "";
    public string SetName { get; set; } = "";

    public string Rarity { get; set; } = "";
    public string Color { get; set; } = "";
    public string Type { get; set; } = "";
    public string CardText { get; set; } = "";

    public int? Life { get; set; }
    public int? CardCost { get; set; }
    public int? CardPower { get; set; }
    public int? CounterAmount { get; set; }

    public string SubTypes { get; set; } = "";
    public string Attribute { get; set; } = "";

    public decimal? InventoryPrice { get; set; }
    public decimal? MarketPrice { get; set; }

    public string CardImageId { get; set; } = "";
    public string ImageUrl { get; set; } = "";

    public DateTime DateScraped { get; set; }
}