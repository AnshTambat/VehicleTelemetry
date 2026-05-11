using System.ComponentModel.DataAnnotations;

namespace VehicleTelemetryAPI.Models.DTOs
{
    public class RegisterRequest
    {
        [Required, MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        [RegularExpression(@"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$",
            ErrorMessage = "Email must be a valid address (e.g. user@example.com).")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$",
            ErrorMessage = "Password must be at least 8 characters and contain at least one uppercase letter, one number, and one special character.")]
        public string Password { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Role { get; set; } = "Viewer";

        public string RoleCode { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required]
        [RegularExpression(@"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$",
            ErrorMessage = "Email must be a valid address (e.g. user@example.com).")]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}
