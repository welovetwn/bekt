using bektApi.DTOs;
using bektApi.Models;

namespace bektApi.Services;

/// <summary>
/// 產品服務介面 - 定義產品相關 CRUD 作業
/// </summary>
public interface IProductService
{
    /// <summary>
    /// 取得所有產品
    /// </summary>
    Task<IEnumerable<ProductDto>> GetAllAsync();

    /// <summary>
    /// 依 ID 取得單一產品
    /// </summary>
    Task<ProductDto?> GetByIdAsync(int id);

    /// <summary>
    /// 建立新產品
    /// </summary>
    Task<ProductDto> CreateAsync(Product product);

    /// <summary>
    /// 更新產品
    /// </summary>
    Task UpdateAsync(int id, Product product);

    /// <summary>
    /// 刪除產品
    /// </summary>
    Task DeleteAsync(int id);
}