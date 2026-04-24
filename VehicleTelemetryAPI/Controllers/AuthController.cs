using Microsoft.AspNetCore.Mvc;
using VehicleTelemetryAPI.Models.DTOs;
using VehicleTelemetryAPI.Services;

namespace VehicleTelemetryAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _auth;

        public AuthController(AuthService auth) => _auth = auth;

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            var (success, error) = await _auth.RegisterAsync(req);
            if (!success)
                return Conflict(new { message = error });

            return StatusCode(201, new { message = "Account created successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var (success, response, error) = await _auth.LoginAsync(req);
            if (!success)
                return Unauthorized(new { message = error });

            return Ok(response);
        }
    }
}
