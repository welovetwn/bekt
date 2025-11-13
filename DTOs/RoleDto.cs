// backend/bektApi/DTOs/RoleDto.cs
namespace bektApi.DTOs;

public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Permissions { get; set; } = "{}";
    public int UserCount { get; set; }
}