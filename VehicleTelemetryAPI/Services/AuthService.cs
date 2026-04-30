using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VehicleTelemetryAPI.Data;
using VehicleTelemetryAPI.Models;
using VehicleTelemetryAPI.Models.DTOs;

namespace VehicleTelemetryAPI.Services
{
    public class AuthService
    {
        private readonly TelemetryDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(TelemetryDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<(bool success, string error)> RegisterAsync(RegisterRequest req)
        {
            bool emailExists = await _db.Users.AnyAsync(u => u.Email == req.Email);
            if (emailExists)
                return (false, "Email is already registered.");

            bool usernameExists = await _db.Users.AnyAsync(u => u.Username == req.Username);
            if (usernameExists)
                return (false, "Username is already taken.");

            // Read secret codes from appsettings.json
            var operatorCode = _config["RoleCodes:Operator"];
            var adminCode = _config["RoleCodes:Admin"];

            // Validate role and role code
            string role;
            if (req.Role == "Admin")
            {
                if (string.IsNullOrEmpty(req.RoleCode) || req.RoleCode != adminCode)
                    return (false, "Invalid admin code. You are not authorized to register as Admin.");
                role = "Admin";
            }
            else if (req.Role == "Operator")
            {
                if (string.IsNullOrEmpty(req.RoleCode) || req.RoleCode != operatorCode)
                    return (false, "Invalid operator code. You are not authorized to register as Operator.");
                role = "Operator";
            }
            else
            {
                // Default to Viewer for anything else
                role = "Viewer";
            }

            var user = new User
            {
                Username = req.Username,
                Email = req.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = role
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return (true, string.Empty);
        }

        public async Task<(bool success, AuthResponse? response, string error)> LoginAsync(LoginRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return (false, null, "Invalid email or password.");

            var response = GenerateToken(user);
            return (true, response, string.Empty);
        }

        private AuthResponse GenerateToken(User user)
        {
            var jwtSection = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiry = DateTime.UtcNow.AddHours(double.Parse(jwtSection["ExpiryHours"]!));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSection["Issuer"],
                audience: jwtSection["Audience"],
                claims: claims,
                expires: expiry,
                signingCredentials: creds
            );

            return new AuthResponse
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Username = user.Username,
                Email = user.Email,
                ExpiresAt = expiry,
                Role = user.Role
            };
        }
    }
}