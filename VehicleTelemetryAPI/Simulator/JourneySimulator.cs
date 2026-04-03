using VehicleTelemetryAPI.Data;
using VehicleTelemetryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace VehicleTelemetryAPI.Simulator
{
    public static class JourneySimulator
    {
        public static async Task ReplayJourney(TelemetryDbContext db)
        {
            var rng = new Random();
            var vehicles = await db.Vehicles.Take(3).ToListAsync();

            // Chennai GPS waypoints (simulate a city route)
            var waypoints = new[] {
            (13.0827, 80.2707), (13.0900, 80.2780),
            (13.0950, 80.2830), (13.1000, 80.2900),
            (13.1050, 80.2950), (13.1100, 80.3000)
        };

            Console.WriteLine("Starting journey replay for 3 vehicles...\n");

            for (int step = 0; step < waypoints.Length; step++)
            {
                var (lat, lon) = waypoints[step];

                foreach (var vehicle in vehicles)
                {
                    var reading = new VehicleReading
                    {
                        VehicleId = vehicle.VehicleId,
                        Speed = Math.Round((decimal)(40 + rng.NextDouble() * 80), 2),
                        EngineTemp = Math.Round((decimal)(75 + rng.NextDouble() * 30), 2),
                        Lat = (decimal)(lat + rng.NextDouble() * 0.005),
                        Lon = (decimal)(lon + rng.NextDouble() * 0.005),
                        Timestamp = DateTime.UtcNow.AddMinutes(step * 5)
                    };

                    db.VehicleReadings.Add(reading);
                    Console.WriteLine($"[{vehicle.Name}] Step {step + 1}: " +
                        $"{reading.Speed} km/h | {reading.EngineTemp}°C | " +
                        $"({reading.Lat:F4}, {reading.Lon:F4})");
                }

                await db.SaveChangesAsync();
                await Task.Delay(200); // simulate pacing
            }

            Console.WriteLine("\nJourney replay complete. Readings saved to database.");
        }
    }
}
