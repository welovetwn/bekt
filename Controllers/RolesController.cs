using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using bektApi.Models;
using bektApi.Services;
using bektApi.DTOs;

namespace bektApi.Controllers;

/// <summary>
/// 角色管理控制器 - 提供角色 CRUD API
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IRoleService _service;

    public RolesController(IRoleService service) => _service = service;

    /// <summary>
    /// 取得所有角色
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetAll()
        => Ok(await _service.GetAllAsync());

    /// <summary>
    /// 依 ID 取得單一角色
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<RoleDto>> Get(int id)
    {
        var role = await _service.GetByIdAsync(id);
        return role == null ? NotFound("找不到該角色") : Ok(role);
    }

    /// <summary>
    /// 建立新角色
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RoleDto>> Create([FromBody] Role role)
    {
        var created = await _service.CreateAsync(role);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// 更新角色
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Role role)
    {
        if (id != role.Id) return BadRequest("ID 不一致");
        await _service.UpdateAsync(id, role);
        return NoContent();
    }

    /// <summary>
    /// 刪除角色
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}