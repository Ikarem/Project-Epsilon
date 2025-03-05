using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly ProjectManagerService _projectManager;

    public ProjectsController(ProjectManagerService projectManager)
    {
        _projectManager = projectManager;
    }

    [HttpGet]
    public IActionResult GetProjects()
    {
        var projects = _projectManager.GetProjects();
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public IActionResult GetProject(int id)
    {
        try
        {
            var project = _projectManager.GetProjectById(id);
            if (project == null)
            {
                return NotFound("Project not found.");
            }

            return Ok(project);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching project: {ex.Message}");
            return StatusCode(500, new { error = "An error occurred while fetching the project." });
        }
    }

    [HttpPost]
    public IActionResult AddProject([FromBody] ProjectDto projectDto)
    {
        try
        {
            if (projectDto == null || string.IsNullOrWhiteSpace(projectDto.Name))
            {
                return BadRequest("Invalid project data.");
            }

            _projectManager.AddProject(projectDto.Name, projectDto.Description, projectDto.Color);
            var updatedProjects = _projectManager.GetProjects(); 
            return Ok(updatedProjects); 
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error adding project: {ex.Message}");
            return StatusCode(500, new { error = "An error occurred while adding the project." });
        }
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteProject(int id)
    {
        _projectManager.DeleteProject(id);
        return Ok();
    }
}

public class ProjectDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}