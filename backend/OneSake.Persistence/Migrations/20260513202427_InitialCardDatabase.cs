using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OneSake.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCardDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CardId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CardName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SetId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SetName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Rarity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CardText = table.Column<string>(type: "text", nullable: false),
                    Life = table.Column<int>(type: "integer", nullable: true),
                    CardCost = table.Column<int>(type: "integer", nullable: true),
                    CardPower = table.Column<int>(type: "integer", nullable: true),
                    CounterAmount = table.Column<int>(type: "integer", nullable: true),
                    SubTypes = table.Column<string>(type: "text", nullable: false),
                    Attribute = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    InventoryPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    MarketPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    CardImageId = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    DateScraped = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cards", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cards_CardId",
                table: "Cards",
                column: "CardId");

            migrationBuilder.CreateIndex(
                name: "IX_Cards_CardName",
                table: "Cards",
                column: "CardName");

            migrationBuilder.CreateIndex(
                name: "IX_Cards_SetId",
                table: "Cards",
                column: "SetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cards");
        }
    }
}
