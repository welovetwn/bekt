using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using bektApi.Models;
using bektApi.Services;
using bektApi.DTOs;

namespace bektApi.Controllers;

/// <summary>
/// 產品管理控制器 - 提供產品 CRUD API
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service) => _service = service;

    /// <summary>
    /// 取得所有產品
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
        => Ok(await _service.GetAllAsync());

    /// <summary>
    /// 依 ID 取得單一產品
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> Get(int id)
    {
        var product = await _service.GetByIdAsync(id);
        return product == null ? NotFound("找不到該產品") : Ok(product);
    }

    /// <summary>
    /// 建立新產品
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] Product product)
    {
        var created = await _service.CreateAsync(product);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// 更新產品
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Product product)
    {
        if (id != product.Id) return BadRequest("ID 不一致");
        await _service.UpdateAsync(id, product);
        return NoContent();
    }

    /// <summary>
    /// 刪除產品
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}