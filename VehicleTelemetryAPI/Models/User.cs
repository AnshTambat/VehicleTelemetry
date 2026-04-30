using System.ComponentModel.DataAnnotations;

namespace VehicleTelemetryAPI.Models
{
    public class User
    {
        public int UserId { get; set; }

        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(20)]
        public string Role { get; set; } = "Viewer";
    }
}