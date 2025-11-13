using Microsoft.EntityFrameworkCore;
using bektApi.Data;
using bektApi.DTOs;
using bektApi.Models;

namespace bektApi.Services;

/// <summary>
/// 角色服務實作 - 處理角色 CRUD
/// </summary>
public class RoleService : IRoleService
{
    private readonly AppDbContext _db;

    public RoleService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<RoleDto>> GetAllAsync() =>
        await _db.Roles
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                Permissions = r.Permissions
            })
            .ToListAsync();

    public async Task<RoleDto?> GetByIdAsync(int id) =>
        await _db.Roles
            .Where(r => r.Id == id)
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                Permissions = r.Permissions
            })
            .FirstOrDefaultAsync();

    public async Task<RoleDto> CreateAsync(Role role)
    {
        _db.Roles.Add(role);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(role.Id))!;
    }

    public async Task UpdateAsync(int id, Role role)
    {
        var existing = await _db.Roles.FindAsync(id) ?? throw new KeyNotFoundException("找不到角色");
        existing.Name = role.Name;
        existing.Description = role.Description;
        existing.Permissions = role.Permissions;
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var role = await _db.Roles.FindAsync(id);
        if (role != null)
        {
            // 檢查是否有使用者使用此角色
            if (await _db.Users.AnyAsync(u => u.RoleId == id))
                throw new InvalidOperationException("此角色尚有使用者使用，無法刪除");
            
            _db.Roles.Remove(role);
            await _db.SaveChangesAsync();
        }
    }
}