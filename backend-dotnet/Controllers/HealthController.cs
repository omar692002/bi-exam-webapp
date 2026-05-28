using BiBackend.Mdx;
using Microsoft.AspNetCore.Mvc;

namespace BiBackend.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    private readonly SsasClient _ssas;

    public HealthController(SsasClient ssas) => _ssas = ssas;

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var rows = _ssas.Execute("SELECT {[Measures].[Revenue]} ON COLUMNS FROM [VDS]");
            return Ok(new
            {
                status = "UP",
                ssasServer = _ssas.DataSource,
                catalog = _ssas.Catalog,
                cube = _ssas.Cube,
                probeRows = rows.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { status = "DOWN", error = ex.Message });
        }
    }
}
