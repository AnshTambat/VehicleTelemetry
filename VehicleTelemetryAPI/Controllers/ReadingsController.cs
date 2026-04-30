using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleTelemetryAPI.Data;
using Microsoft.EntityFrameworkCore;
using VehicleTelemetryAPI.Models;

namespace VehicleTelemetryAPI.Controllers
{
    [ApiController]
    [Route("api/vehicles/{vehicleId}/readings")]
    [Authorize]
    public class ReadingsController : ControllerBase
    {
        private readonly TelemetryDbContext _db;
        public ReadingsController(TelemetryDbContext db) => _db = db;

        // ALL roles can view readings
        [HttpGet]
        public async Task<IActionResult> GetReadings(
            int vehicleId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var q = _db.VehicleReadings.AsNoTracking().Where(r => r.VehicleId == vehicleId);
            if (from.HasValue) q = q.Where(r => r.Timestamp >= from.Value);
            if (to.HasValue) q = q.Where(r => r.Timestamp <= to.Value);
            return Ok(await q.OrderBy(r => r.Timestamp).ToListAsync());
        }

        // ALL roles can view latest reading
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatest(int vehicleId)
        {
            var latest = await _db.VehicleReadings.AsNoTracking()
                .Where(r => r.VehicleId == vehicleId)
                .OrderByDescending(r => r.Timestamp)
                .FirstOrDefaultAsync();
            return latest is null ? NotFound() : Ok(latest);
        }

        // Admin and Operator can add readings
        [HttpPost]
        [Authorize(Roles = "Admin,Operator")]
        public async Task<IActionResult> AddReading(int vehicleId, VehicleReading reading)
        {
            reading.VehicleId = vehicleId;
            reading.Timestamp = DateTime.UtcNow;
            _db.VehicleReadings.Add(reading);
            await _db.SaveChangesAsync();
            return Ok(reading);
        }

        // Admin only can delete readings
        [HttpDelete("{readingId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReading(int vehicleId, int readingId)
        {
            var reading = await _db.VehicleReadings
                .FirstOrDefaultAsync(r => r.ReadingId == readingId && r.VehicleId == vehicleId);
            if (reading is null) return NotFound();
            _db.VehicleReadings.Remove(reading);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // ALL roles can view avg engine temp per hour
        [HttpGet("avg-engine-temp-per-hour")]
        public async Task<IActionResult> AvgTempPerHour(int vehicleId) =>
            Ok(await GetAvgTempData(vehicleId));

        private async Task<List<object>> GetAvgTempData(int vehicleId)
        {
            var raw = await _db.VehicleReadings
                .Where(r => r.VehicleId == vehicleId)
                .GroupBy(r => r.Timestamp.Hour)
                .Select(g => new { Hour = g.Key, AvgTemp = g.Average(r => r.EngineTemp) })
                .OrderBy(x => x.Hour)
                .ToListAsync();

            return raw
                .Select(x => (object)new { Hour = x.Hour, AvgTemp = Math.Round(x.AvgTemp, 2) })
                .ToList();
        }
    }
}