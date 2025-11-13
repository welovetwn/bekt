using Microsoft.EntityFrameworkCore;
using bektApi.Data;
using bektApi.DTOs;
using bektApi.Models;

namespace bektApi.Services;

/// <summary>
/// 產品服務實作 - 處理產品 CRUD 與時間戳記
/// </summary>
public class ProductService : IProductService
{
    private readonly AppDbContext _db;

    public ProductService(AppDbContext db) => _db = db;

    /// <summary>
    /// 取得所有產品
    /// </summary>
    public async Task<IEnumerable<ProductDto>> GetAllAsync() =>
        await _db.Products
            .OrderBy(p => p.Name)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Quantity = p.Quantity
            })
            .ToListAsync();

    /// <summary>
    /// 依 ID 取得單一產品
    /// </summary>
    public async Task<ProductDto?> GetByIdAsync(int id) =>
        await _db.Products
            .Where(p => p.Id == id)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Quantity = p.Quantity
            })
            .FirstOrDefaultAsync();

    /// <summary>
    /// 建立新產品（自動填入建立時間）
    /// </summary>
    public async Task<ProductDto> CreateAsync(Product product)
    {
        product.CreatedAt = DateTime.UtcNow;
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(product.Id))!;
    }

    /// <summary>
    /// 更新產品（自動更新修改時間）
    /// </summary>
    public async Task UpdateAsync(int id, Product product)
    {
        var existing = await _db.Products.FindAsync(id) 
            ?? throw new KeyNotFoundException("找不到產品");

        existing.Name = product.Name;
        existing.Description = product.Description;
        existing.Quantity = product.Quantity;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    /// <summary>
    /// 刪除產品
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product != null)
        {
            _db.Products.Remove(product);
            await _db.SaveChangesAsync();
        }
    }
}