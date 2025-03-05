using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

[ApiController]
[Route("api/projects/{projectId}/tasks")]
public class TasksController : ControllerBase
{
    private readonly ProjectManagerService _projectManager;

    public TasksController(ProjectManagerService projectManager)
    {
        _projectManager = projectManager;
    }

    [HttpPost]
    public IActionResult AddTask(int projectId, [FromBody] TaskDto taskDto)
    {
        try
        {
            taskDto.ProjectId = projectId;
            _projectManager.AddTask(
                taskDto.ProjectId, 
                taskDto.Name, 
                taskDto.Description,
                taskDto.Priority, 
                taskDto.DueDate,
                taskDto.AssignedTo);
            return Ok(new { message = "Task added successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPatch("{taskId}/status")]
    public IActionResult UpdateTaskStatus(int projectId, int taskId, [FromBody] StatusUpdateDto statusUpdate)
    {
        try
        {
            _projectManager.UpdateTaskStatus(projectId, taskId, statusUpdate.Status);
            return Ok(new { message = "Status updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPut("{taskId}")]
    public IActionResult UpdateTask(int projectId, int taskId, [FromBody] TaskUpdateDto taskDto)
    {
        try
        {
            _projectManager.EditTask(projectId, taskId, taskDto.Name, taskDto.Description, taskDto.Priority, taskDto.DueDate, taskDto.AssignedTo);
            return Ok(new { message = "Task updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("{taskId}/comments")]
    public IActionResult AddComment(int projectId, int taskId, [FromBody] CommentDto commentDto)
    {
        try
        {
            _projectManager.AddComment(projectId, taskId, commentDto.Text);
            return Ok(new { message = "Comment added successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("{taskId}")]
    public IActionResult DeleteTask(int projectId, int taskId)
    {
        try
        {
            _projectManager.DeleteTask(projectId, taskId);
            return Ok(new { message = "Task deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class TaskDto
{
    [Required]
    public int ProjectId { get; set; }

    [Required]
    public string Name { get; set; }

    public string Description { get; set; }

    [Required]
    public string Priority { get; set; } = "low";

    [Required]
    public DateTime DueDate { get; set; }

    public string AssignedTo { get; set; } 
}

public class StatusUpdateDto
{
    [Required]
    public string Status { get; set; }
}

public class TaskUpdateDto
{
    [Required]
    public string Name { get; set; }
    public string Description { get; set; }
    [Required]
    public string Priority { get; set; }
    [Required]
    public DateTime DueDate { get; set; }
    public string AssignedTo { get; set; }
}

public class CommentDto
{
    [Required]
    public string Text { get; set; }
}
