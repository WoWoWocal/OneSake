using Microsoft.AspNetCore.Mvc;

namespace OneSake.Server.Controllers;

// Markiert diese Klasse als einen API Controller
// Enabled automatisch request validation, binding, etc...
[ApiController]

// Definiert die base route fuer diesen Controller
// "[controller]" wird automatisch zu "health"
[Route("[controller]")]

public class HealthController : ControllerBase
{
    [HttpGet]
    // Handled HTTP GET requests zu /health
    // In unserem Fall lt. "OneSake.Server/Properties/launchSettings.json" ist es localhost:5179
    public IActionResult Get() => Ok("API is alive");
    // IActionResult Returned auf eine Aktion eine simple Nachricht mit einem HTTP 200 OK
    // Wird benutzt um zu verifizieren dass Backend laeuft und auf erreichbar ist

    // Das wird auch Health Check Endpoint genannt un sicher zu gehen dass routing funktioniert und spaeter dann auch deployment
}
