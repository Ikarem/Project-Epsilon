using System;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/timeline")]
public class TimelineController : ControllerBase
{
    private readonly ITimelineService _timelineService;

    public TimelineController(ITimelineService timelineService)
    {
        _timelineService = timelineService;
    }

    [HttpGet]
    public IActionResult GetTimeline([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var timeline = _timelineService.GetMasterTimeline(
                startDate ?? DateTime.Now.AddMonths(-1), 
                endDate ?? DateTime.Now.AddMonths(3)
            );
            return Ok(timeline);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{projectId}")]
    public IActionResult GetProjectTimeline(int projectId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var timeline = _timelineService.GetProjectTimeline(
                projectId,
                startDate ?? DateTime.Now.AddMonths(-1), 
                endDate ?? DateTime.Now.AddMonths(3)
            );
            return Ok(timeline);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}