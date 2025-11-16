// backend/bektApi/DTOs/RoleDto.cs
using System.ComponentModel.DataAnnotations;
namespace bektApi.DTOs;

public class RoleDto
{
    public int Id { get; set; }
    [Display(Name = "角色名稱")]
    public string Name { get; set; } = string.Empty;
    [Display(Name = "角色內容")]
    public string? Description { get; set; }
    [Display(Name = "權控")]
    public string Permissions { get; set; } = "{}";
    [Display(Name = "使用者數量")]
    public int UserCount { get; set; }
}