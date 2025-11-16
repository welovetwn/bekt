// DTOs/UserResponseDto.cs
using System.ComponentModel.DataAnnotations;
namespace bektApi.DTOs;

public class UserResponseDto
{
    public int Id { get; set; }
    [Display(Name = "帳號")]
    public string Username { get; set; } = string.Empty;
    [Display(Name = "使用者名稱")]
    public string DisplayName { get; set; } = string.Empty;
    [Display(Name = "角色")]
    public int RoleId { get; set; }
    [Display(Name = "角色名稱")]
    public string RoleName { get; set; } = string.Empty;
    [Display(Name = "生效")]
    public bool IsActive { get; set; }
}