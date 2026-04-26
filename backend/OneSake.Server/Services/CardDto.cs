using System.Text.Json.Serialization;

namespace OneSake.Server.Services
{

    // CardService existiert um uns zu zeigen welche Art von Karten es gibt, restlichen Game-Side Dinge werden dann im .Game Ordner erledigt : Rules, Effects, etc...
    public class CardDto
    {
        [JsonPropertyName("inventory_price")]
        public float? InventoryPrice { get; set; }

        [JsonPropertyName("market_price")]
        public float? MarketPrice { get; set; }

        [JsonPropertyName("card_name")]
        public string CardName { get; set; } = "";

        [JsonPropertyName("set_name")]
        public string SetName { get; set; } = "";

        [JsonPropertyName("card_text")]
        public string CardText { get; set; } = "";

        [JsonPropertyName("set_id")]
        public string SetId { get; set; } = "";

        [JsonPropertyName("rarity")]
        public string Rarity { get; set; } = "";

        [JsonPropertyName("card_set_id")]
        public string CardId { get; set; } = "";

        [JsonPropertyName("card_color")]
        public string Color { get; set; } = "";

        [JsonPropertyName("card_type")]
        public string Type { get; set; } = "";

        [JsonPropertyName("life")]
        public int? Life { get; set; }

        [JsonPropertyName("card_cost")]
        public int? CardCost { get; set; }

        [JsonPropertyName("card_power")]
        public int? CardPower { get; set; }

        [JsonPropertyName("sub_types")]
        public string SubTypes { get; set; } = "";

        [JsonPropertyName("counter_amount")]
        public int? CounterAmount { get; set; }

        [JsonPropertyName("attribute")]
        public string Attribute { get; set; } = "";

        [JsonPropertyName("date_scraped")]
        public DateTime DateScraped { get; set; }

        [JsonPropertyName("card_image_id")]
        public string CardImageId { get; set; } = "";

        [JsonPropertyName("card_image")]
        public string ImageURL { get; set; } = "";

       


        // Ohne [JsonPropertyName] kann deserialization verkacken
        // man bekommt eventuelle empty/null values und debuggen koennte ein Problem werden

    }
}
