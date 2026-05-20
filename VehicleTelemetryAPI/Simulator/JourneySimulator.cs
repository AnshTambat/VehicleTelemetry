 using VehicleTelemetryAPI.Data;
using VehicleTelemetryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace VehicleTelemetryAPI.Simulator
{
    public static class JourneySimulator
    {
        // Each route covers a distinct area of Chennai so vehicles are genuinely scattered
        private static readonly (double lat, double lon)[][] Routes = new[]
        {
            // Route 0 — North Chennai (Perambur → Kolathur)
            new[] { (13.1200, 80.2350), (13.1280, 80.2420), (13.1350, 80.2500), (13.1420, 80.2580), (13.1500, 80.2650), (13.1570, 80.2720) },
            // Route 1 — Central Chennai (Anna Salai corridor)
            new[] { (13.0650, 80.2600), (13.0700, 80.2650), (13.0750, 80.2700), (13.0800, 80.2750), (13.0850, 80.2800), (13.0900, 80.2850) },
            // Route 2 — South Chennai (Velachery → Tambaram)
            new[] { (12.9800, 80.2200), (12.9700, 80.2150), (12.9600, 80.2100), (12.9500, 80.2050), (12.9400, 80.2000), (12.9300, 80.1950) },
            // Route 3 — West Chennai (Porur → Maduravoyal)
            new[] { (13.0350, 80.1580), (13.0420, 80.1650), (13.0500, 80.1720), (13.0580, 80.1800), (13.0650, 80.1870), (13.0720, 80.1950) },
            // Route 4 — East Chennai (Adyar → Thiruvanmiyur)
            new[] { (13.0050, 80.2550), (12.9980, 80.2580), (12.9900, 80.2610), (12.9820, 80.2640), (12.9740, 80.2670), (12.9660, 80.2700) },
            // Route 5 — North-West (Ambattur → Avadi)
            new[] { (13.1100, 80.1600), (13.1180, 80.1530), (13.1260, 80.1460), (13.1340, 80.1390), (13.1420, 80.1320), (13.1500, 80.1250) },
            // Route 6 — South-East (OMR Tech Corridor)
            new[] { (12.9600, 80.2450), (12.9500, 80.2500), (12.9400, 80.2550), (12.9300, 80.2600), (12.9200, 80.2650), (12.9100, 80.2700) },
            // Route 7 — Harbour (Port → Marina)
            new[] { (13.1050, 80.2900), (13.0980, 80.2920), (13.0900, 80.2940), (13.0820, 80.2960), (13.0740, 80.2980), (13.0660, 80.3000) },
            // Route 8 — South-West (Chromepet → Pallavaram)
            new[] { (12.9530, 80.1430), (12.9600, 80.1500), (12.9670, 80.1570), (12.9740, 80.1640), (12.9810, 80.1710), (12.9880, 80.1780) },
            // Route 9 — Central-North (T.Nagar → Nungambakkam)
            new[] { (13.0400, 80.2330), (13.0470, 80.2380), (13.0540, 80.2430), (13.0610, 80.2480), (13.0680, 80.2530), (13.0750, 80.2580) },
        };

        public static async Task ReplayJourney(TelemetryDbContext db)
        {
            var rng = Random.Shared;
            var vehicles = await db.Vehicles.ToListAsync();

            if (vehicles.Count == 0)
            {
                Console.WriteLine("No vehicles found in DB — nothing to simulate.");
                return;
            }

            Console.WriteLine($"Starting journey replay for {vehicles.Count} vehicles...\n");

            int steps = Routes[0].Length;

            for (int step = 0; step < steps; step++)
            {
                foreach (var (vehicle, idx) in vehicles.Select((v, i) => (v, i)))
                {
                    // Each vehicle follows its own route (cycles if more vehicles than routes)
                    var route = Routes[idx % Routes.Length];
                    var (lat, lon) = route[step];

                    var reading = new VehicleReading
                    {
                        VehicleId = vehicle.VehicleId,
                        Speed     = Math.Round((decimal)(30 + rng.NextDouble() * 90), 2),
                        EngineTemp = Math.Round((decimal)(70 + rng.NextDouble() * 35), 2),
                        Lat       = (decimal)(lat + (rng.NextDouble() - 0.5) * 0.002),
                        Lon       = (decimal)(lon + (rng.NextDouble() - 0.5) * 0.002),
                        Timestamp = DateTime.UtcNow
                    };

                    db.VehicleReadings.Add(reading);
                    Console.WriteLine($"[{vehicle.Name}] Step {step + 1}: " +
                        $"{reading.Speed} km/h | {reading.EngineTemp}°C | " +
                        $"({reading.Lat:F4}, {reading.Lon:F4})");
                }

                await db.SaveChangesAsync();
                await Task.Delay(200);
            }

            Console.WriteLine("\nJourney replay complete. Readings saved to database.");
        }
    }
}
