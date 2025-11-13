using bektApi.DTOs;
using bektApi.Models;

namespace bektApi.Services;

/// <summary>
/// 角色服務介面 - 定義角色相關 CRUD 作業
/// </summary>
public interface IRoleService
{
    /// <summary>
    /// 取得所有角色
    /// </summary>
    Task<IEnumerable<RoleDto>> GetAllAsync();

    /// <summary>
    /// 依 ID 取得單一角色
    /// </summary>
    Task<RoleDto?> GetByIdAsync(int id);

    /// <summary>
    /// 建立新角色
    /// </summary>
    Task<RoleDto> CreateAsync(Role role);

    /// <summary>
    /// 更新角色
    /// </summary>
    Task UpdateAsync(int id, Role role);

    /// <summary>
    /// 刪除角色
    /// </summary>
    Task DeleteAsync(int id);
}