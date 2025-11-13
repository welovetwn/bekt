using bektApi.Models;

namespace bektApi.Services;

public interface IAuthService
{
    Task<JwtResponse?> LoginAsync(LoginRequest request);
}