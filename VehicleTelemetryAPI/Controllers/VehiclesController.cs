using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleTelemetryAPI.Data;
using Microsoft.EntityFrameworkCore;
using VehicleTelemetryAPI.Models;
using VehicleTelemetryAPI.Services;

namespace VehicleTelemetryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VehiclesController : ControllerBase
    {
        private readonly TelemetryDbContext _db;
        private readonly VehicleService _svc;

        public VehiclesController(TelemetryDbContext db, VehicleService svc)
        {
            _db = db; _svc = svc;
        }

        // ALL roles can view vehicles
        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _db.Vehicles.AsNoTracking().ToListAsync());

        // ALL roles can view single vehicle
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var v = await _db.Vehicles.AsNoTracking().FirstOrDefaultAsync(x => x.VehicleId == id);
            return v is null ? NotFound() : Ok(v);
        }

        // Admin and Operator can create vehicles
        [HttpPost]
        [Authorize(Roles = "Admin,Operator")]
        public async Task<IActionResult> Create(Vehicle v)
        {
            v.CreatedAt = DateTime.UtcNow;
            _db.Vehicles.Add(v);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = v.VehicleId }, v);
        }

        public record VehicleUpdateDto(string Name, string LicensePlate);

        // Admin and Operator can update vehicles
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Operator")]
        public async Task<IActionResult> Update(int id, [FromBody] VehicleUpdateDto body)
        {
            var v = await _db.Vehicles.FindAsync(id);
            if (v is null) return NotFound();
            v.Name = body.Name;
            v.LicensePlate = body.LicensePlate;
            await _db.SaveChangesAsync();
            return Ok(v);
        }

        // Only Admin can delete vehicles
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var v = await _db.Vehicles.FindAsync(id);
            if (v is null) return NotFound();
            _db.Vehicles.Remove(v);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // ALL roles can view summary
        [HttpGet("{id}/summary")]
        public async Task<IActionResult> Summary(int id) =>
            Ok(await _svc.ComputeSummary(id));

        // ALL roles can view top 5
        [HttpGet("top5-speed-today")]
        public async Task<IActionResult> Top5() =>
            Ok(await _svc.GetTop5ByPeakSpeedToday());
    }
}