using System;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/{projectId}/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly ProjectManagerService _projectManager;

    public AnalyticsController(ProjectManagerService projectManager)
    {
        _projectManager = projectManager;
    }

    [HttpGet("priority-distribution")]
    public IActionResult GetPriorityDistribution(int projectId)
    {
        try
        {
            var distribution = _projectManager.GetTaskPriorityDistribution(projectId);
            return Ok(distribution);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
    
    [HttpGet("workload")]
    public IActionResult GetWorkloadDistribution(int projectId)
    {
        try
        {
            var workload = _projectManager.GetWorkloadDistribution(projectId);
            return Ok(workload);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}