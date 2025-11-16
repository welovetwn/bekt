// backend/bektApi/DTOs/ProductDto.cs
using System.ComponentModel.DataAnnotations;
namespace bektApi.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    [Display(Name = "產品名稱")]
    public string Name { get; set; } = string.Empty;
    [Display(Name = "產品內容")]
    public string? Description { get; set; }
    [Display(Name = "庫存數量")]
    public int Quantity { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}