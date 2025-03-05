using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/{projectId}/milestones")]
public class MilestonesController : ControllerBase
{
    private readonly ProjectManagerService _projectManager;

    public MilestonesController(ProjectManagerService projectManager)
    {
        _projectManager = projectManager;
    }

    [HttpGet]
    public IActionResult GetMilestones(int projectId)
    {
        try
        {
            var milestones = _projectManager.GetMilestonesByProjectId(projectId);
            return Ok(milestones);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    public IActionResult AddMilestone(int projectId, [FromBody] MilestoneDto milestoneDto)
    {
        try
        {
            _projectManager.AddMilestone(projectId, milestoneDto.Name, milestoneDto.Description, milestoneDto.DueDate);
            return Ok(new { message = "Milestone added successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
    
    [HttpPatch("{milestoneId}/complete")]
    public IActionResult CompleteMilestone(int projectId, int milestoneId)
    {
        try
        {
            _projectManager.CompleteMilestone(projectId, milestoneId);
            return Ok(new { message = "Milestone completed" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
    
    
    [HttpDelete("{milestoneId}")]
    public IActionResult DeleteMilestone(int projectId, int milestoneId)
    {
        try
        {
            _projectManager.DeleteMilestone(projectId, milestoneId);
            return Ok(new { message = "Milestone deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class MilestoneDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public DateTime DueDate { get; set; }
}