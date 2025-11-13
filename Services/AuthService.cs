using bektApi.Data;
using bektApi.DTOs;
using bektApi.Models;
using bektApi.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace bektApi.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private const int PBKDF2_ITERATIONS = 10000; // 可調整：10k~100k
    private const int SALT_SIZE = 32; // 256-bit
    private const int HASH_SIZE = 32; // 256-bit

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<JwtResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

        if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            return null;

        // 自動升級舊密碼
        if (IsLegacySha256Hash(user.PasswordHash))
        {
            user.PasswordHash = HashPasswordWithPbkdf2(request.Password);
            await _db.SaveChangesAsync();
        }

        var token = GenerateJwtToken(user);

        return new JwtResponse
        {
            Token = token,
            User = new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                DisplayName = user.DisplayName ?? user.Username,
                RoleId = user.RoleId,
                RoleName = user.Role.Name,
                IsActive = user.IsActive
            }
        };
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.Name),
            new Claim("displayName", user.DisplayName ?? user.Username)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // 新增：PBKDF2 驗證
    private bool VerifyPassword(string password, string storedHash)
    {
        // 支援舊 SHA256 格式（過渡期）
        if (IsLegacySha256Hash(storedHash))
        {
            using var sha256 = SHA256.Create();
            var computed = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));
            return computed == storedHash;
        }

        // PBKDF2 格式
        var parts = storedHash.Split('|');
        if (parts.Length != 4 || parts[0] != "PBKDF2") return false;

        var iterations = int.Parse(parts[1]);
        var salt = Convert.FromBase64String(parts[2]);
        var hash = parts[3];

        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
        var testHash = Convert.ToBase64String(pbkdf2.GetBytes(HASH_SIZE));

        return testHash == hash;
    }

    // 判斷是否為舊 SHA256 格式
    private static bool IsLegacySha256Hash(string hash)
    {
        return !hash.Contains('|') && hash.Length == 44; // Base64(SHA256) = 44 字元
    }

    // 產生新 PBKDF2 密碼
    private string HashPasswordWithPbkdf2(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SALT_SIZE);
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, PBKDF2_ITERATIONS, HashAlgorithmName.SHA256);
        var hash = Convert.ToBase64String(pbkdf2.GetBytes(HASH_SIZE));
        return $"PBKDF2|{PBKDF2_ITERATIONS}|{Convert.ToBase64String(salt)}|{hash}";
    }
}