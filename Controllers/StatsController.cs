using System;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/stats")]
public class StatsController : ControllerBase
{
    private readonly AnalyticsService _analyticsService;

    public StatsController(AnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("completion-rate")]
    public IActionResult GetCompletionRate()
    {
        try
        {
            var stats = _analyticsService.GetCompletionRateStats();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("task-velocity")]
    public IActionResult GetTaskVelocity([FromQuery] int days = 30)
    {
        try
        {
            var velocityData = _analyticsService.GetTaskVelocityData(days);
            return Ok(velocityData);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("completion-time")]
    public IActionResult GetCompletionTimeDistribution()
    {
        try
        {
            var distribution = _analyticsService.GetCompletionTimeDistribution();
            return Ok(distribution);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("project-health")]
    public IActionResult GetProjectHealthOverview()
    {
        try
        {
            var healthData = _analyticsService.GetProjectHealthOverview();
            return Ok(healthData);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}