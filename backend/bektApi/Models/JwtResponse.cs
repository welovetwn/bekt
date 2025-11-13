// Models/JwtResponse.cs
using bektApi.DTOs;

namespace bektApi.Models;

public class JwtResponse
{
    public string Token { get; set; } = string.Empty;
    public UserResponseDto User { get; set; } = null!;
}