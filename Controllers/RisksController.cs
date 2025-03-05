using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/{projectId}/risks")]
public class RisksController : ControllerBase
{
    private readonly ProjectManagerService _projectManager;

    public RisksController(ProjectManagerService projectManager)
    {
        _projectManager = projectManager;
    }

    [HttpGet]
    public IActionResult GetRisks(int projectId)
    {
        try
        {
            var risks = _projectManager.GetRisksByProjectId(projectId);
            return Ok(risks);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    public IActionResult AddRisk(int projectId, [FromBody] RiskDto riskDto)
    {
        try
        {
            _projectManager.AddRisk(
                projectId, 
                riskDto.Description, 
                riskDto.Impact, 
                riskDto.Probability, 
                riskDto.MitigationStrategy);
                
            return Ok(new { message = "Risk added successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
    
    
    [HttpDelete("{riskId}")]
    public IActionResult DeleteRisk(int projectId, int riskId)
    {
        try
        {
            _projectManager.DeleteRisk(projectId, riskId);
            return Ok(new { message = "Risk deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class RiskDto
{
    [Required]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public string Impact { get; set; } = string.Empty;
    
    [Required]
    public string Probability { get; set; } = string.Empty;
    
    public string MitigationStrategy { get; set; } = string.Empty;
}