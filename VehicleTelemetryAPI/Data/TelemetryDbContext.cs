using Microsoft.EntityFrameworkCore;
using VehicleTelemetryAPI.Models;

namespace VehicleTelemetryAPI.Data
{
    public class TelemetryDbContext : DbContext
    {
        public TelemetryDbContext(DbContextOptions<TelemetryDbContext> options) : base(options) { }

        public DbSet<Vehicle> Vehicles => Set<Vehicle>();
        public DbSet<VehicleReading> VehicleReadings => Set<VehicleReading>();
        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            b.Entity<VehicleReading>()
             .HasIndex(r => new { r.VehicleId, r.Timestamp });
            b.Entity<Vehicle>().Property(v => v.Name).HasMaxLength(100);
            b.Entity<User>().HasIndex(u => u.Email).IsUnique();
            b.Entity<User>().HasIndex(u => u.Username).IsUnique();
        }
    }
}
