using System.Text.Json.Serialization;

namespace OneSake.Server.Services
{

    // CardService existiert um uns zu zeigen welche Art von Karten es gibt, restlichen Game-Side Dinge werden dann im .Game Ordner erledigt : Rules, Effects, etc...
    public class CardDto
    {
        [JsonPropertyName("card_id")]
        public string Id { get; set; } = "";

        [JsonPropertyName("card_code")]
        public string Code { get; set; } = "";

        [JsonPropertyName("card_name")]
        public string Name { get; set; } = "";

        [JsonPropertyName("card_setcode")]
        public string SetCode { get; set; } = "";

        [JsonPropertyName("card_rarity")]
        public string Rarity { get; set; } = "";

        [JsonPropertyName("card_type")]
        public string Type { get; set; } = "";

        [JsonPropertyName("card_color")]
        public string Color { get; set; } = "";

        [JsonPropertyName("card_cost")]
        public int? Cost { get; set; }

        [JsonPropertyName("card_power")]
        public string Power { get; set; } = "";

        [JsonPropertyName("card_counterval")]
        public string CounterVal { get; set; } = "";

        [JsonPropertyName("card_attribute")]
        public string Attribute { get; set; } = "";

        [JsonPropertyName("card_life")]
        public int? Life { get; set; }

        [JsonPropertyName("card_imageurl")]
        public string ImageUrl { get; set; } = "";

        [JsonPropertyName("card_createdat")]
        public DateTime CreatedAt { get; set; }


        // Ohne [JsonPropertyName] kann deserialization verkacken
        // man bekommt eventuelle empty/null values und debuggen koennte ein Problem werden

    }
}
