using Microsoft.AspNetCore.Mvc;
using bektApi.Models;
using bektApi.Services;

namespace bektApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("login")]
    public async Task<ActionResult<JwtResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _auth.LoginAsync(request);
        if (result == null) return Unauthorized("帳號或密碼錯誤");
        return Ok(result);
    }
}