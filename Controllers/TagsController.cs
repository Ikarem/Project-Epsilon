using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/tags")]
public class TagsController : ControllerBase
{
    private readonly ProjectManagerService _projectManager;

    public TagsController(ProjectManagerService projectManager)
    {
        _projectManager = projectManager;
    }

    [HttpGet]
    public IActionResult GetAllTags()
    {
        try
        {
            var tags = _projectManager.GetAllTags();
            return Ok(tags);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    public IActionResult AddTag([FromBody] TagDto tagDto)
    {
        try
        {
            var tag = _projectManager.AddTag(tagDto.Name);
            return Ok(tag);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
    
    [HttpPost("tasks/{taskId}")]
    public IActionResult AddTagToTask(int taskId, [FromBody] TagDto tagDto, [FromQuery] int projectId)
    {
        try
        {
            _projectManager.AddTagToTask(projectId, taskId, tagDto.Name);
            return Ok(new { message = "Tag added to task" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class TagDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
}