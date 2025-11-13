using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using bektApi.Models;
using bektApi.Services;
using bektApi.DTOs;

namespace bektApi.Controllers;

/// <summary>
/// 使用者管理控制器 - 提供使用者 CRUD API
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // 需登入
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service) => _service = service;

    /// <summary>
    /// 取得所有使用者
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
        => Ok(await _service.GetAllAsync());

    /// <summary>
    /// 依 ID 取得單一使用者
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> Get(int id)
    {
        var user = await _service.GetByIdAsync(id);
        return user == null ? NotFound("找不到該使用者") : Ok(user);
    }

    /// <summary>
    /// 建立新使用者
    /// </summary>
    /// <remarks>需提供 password 參數</remarks>
    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] User user, [FromQuery] string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return BadRequest("密碼為必填欄位");
        
        var created = await _service.CreateAsync(user, password);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// 更新使用者
    /// </summary>
    /// <remarks>password 為選填，若提供則更新密碼</remarks>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] User user, [FromQuery] string? password = null)
    {
        if (id != user.Id) return BadRequest("ID 不一致");
        await _service.UpdateAsync(id, user, password);
        return NoContent();
    }

    /// <summary>
    /// 刪除使用者
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}