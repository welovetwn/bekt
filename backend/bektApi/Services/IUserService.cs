using bektApi.DTOs;
using bektApi.Models;

namespace bektApi.Services;

/// <summary>
/// 使用者服務介面 - 定義使用者相關 CRUD 作業
/// </summary>
public interface IUserService
{
    /// <summary>
    /// 取得所有使用者
    /// </summary>
    Task<IEnumerable<UserDto>> GetAllAsync();

    /// <summary>
    /// 依 ID 取得單一使用者
    /// </summary>
    Task<UserDto?> GetByIdAsync(int id);

    /// <summary>
    /// 建立新使用者（含密碼雜湊）
    /// </summary>
    Task<UserDto> CreateAsync(User user, string password);

    /// <summary>
    /// 更新使用者（密碼為選填）
    /// </summary>
    Task UpdateAsync(int id, User user, string? password = null);

    /// <summary>
    /// 刪除使用者
    /// </summary>
    Task DeleteAsync(int id);
}