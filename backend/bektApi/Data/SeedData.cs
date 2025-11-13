// backend/bektApi/Data/SeedData.cs
using bektApi.Models;
using bektApi.Utils;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace bektApi.Data;

public static class SeedData
{
    private const int PBKDF2_ITERATIONS = 10000;
    private const int SALT_SIZE = 32;
    private const int HASH_SIZE = 32;

    public static void Initialize(AppDbContext db)
    {
        if (db.Users.Any()) return;

        var admin = new User
        {
            Id = 1,
            Username = "admin",
            DisplayName = "系統管理員",
            RoleId = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            PasswordHash = PasswordHelper.HashPassword("admin123")  // 使用你的 PBKDF2
        };

        db.Users.Add(admin);
        db.SaveChanges();
    }
}