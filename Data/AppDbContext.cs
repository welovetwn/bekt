// backend/bektApi/Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using bektApi.Models;

namespace bektApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 靜態資料：角色（無動態值）
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "系統管理員", Description = "擁有所有權限", Permissions = "{\"all\": true}" },
            new Role { Id = 2, Name = "一般使用者", Description = "僅能查看產品", Permissions = "{\"products\": true}" }
        );

        // User 資料移到 SeedData，避免 HasData 動態值
    }
}