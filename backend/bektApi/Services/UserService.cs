using bektApi.Data;
using bektApi.DTOs;
using bektApi.Models;
using bektApi.Utils;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace bektApi.Services;

/// <summary>
/// 使用者服務實作 - 處理使用者 CRUD 與密碼雜湊
/// </summary>
public class UserService : IUserService
{
    private readonly AppDbContext _db;
    private const int PBKDF2_ITERATIONS = 10000;
    private const int SALT_SIZE = 32;
    private const int HASH_SIZE = 32;

    public UserService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<UserDto>> GetAllAsync() =>
        await _db.Users
            .Include(u => u.Role)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                DisplayName = u.DisplayName,
                RoleId = u.RoleId,
                RoleName = u.Role.Name,
                IsActive = u.IsActive
            })
            .ToListAsync();

    public async Task<UserDto?> GetByIdAsync(int id) =>
        await _db.Users
            .Include(u => u.Role)
            .Where(u => u.Id == id)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                DisplayName = u.DisplayName,
                RoleId = u.RoleId,
                RoleName = u.Role.Name,
                IsActive = u.IsActive
            })
            .FirstOrDefaultAsync();

    public async Task<UserDto> CreateAsync(User user, string password)
    {
        user.PasswordHash = PasswordHelper.HashPassword(password); // 使用新 PBKDF2
        user.CreatedAt = DateTime.UtcNow;
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(user.Id) ?? throw new Exception("使用者建立失敗");
    }

    public async Task UpdateAsync(int id, User user, string? password = null)
    {
        var existing = await _db.Users.FindAsync(id) ?? throw new KeyNotFoundException("找不到使用者");
        existing.Username = user.Username;
        existing.DisplayName = user.DisplayName;
        existing.RoleId = user.RoleId;
        existing.IsActive = user.IsActive;

        if (!string.IsNullOrEmpty(password))
            existing.PasswordHash = PasswordHelper.HashPassword(password); // 使用新 PBKDF2

        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user != null)
        {
            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
        }
    }
}