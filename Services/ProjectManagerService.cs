using System;
using System.Collections.Generic;
using System.Linq;

public class ProjectManagerService : IProjectService
{
    private readonly List<Project> _projects = new();
    private readonly List<Tag> _tags = new();
    private int _nextProjectId = 1;
    private int _nextTaskId = 1;
    private int _nextRiskId = 1;
    private int _nextMilestoneId = 1;
    private int _nextTagId = 1;

    public ProjectManagerService()
    {
        
        _tags.AddRange(new[]
        {
            new Tag { Id = _nextTagId++, Name = "bug" },
            new Tag { Id = _nextTagId++, Name = "feature" },
            new Tag { Id = _nextTagId++, Name = "documentation" },
            new Tag { Id = _nextTagId++, Name = "enhancement" }
        });
    }

    
    public void AddProject(string name, string description, string color)
    {
        var project = new Project
        {
            Id = _nextProjectId++,
            Name = name,
            Description = description,
            Color = color
        };
        _projects.Add(project);
    }

    public void DeleteProject(int id)
    {
        _projects.RemoveAll(p => p.Id == id);
    }

    public List<Project> GetProjects()
    {
        return _projects;
    }

    public Project GetProjectById(int id)
    {
        return _projects.FirstOrDefault(p => p.Id == id)!;
    }

    
    public void AddTask(int projectId, string taskName, string description, string priority, DateTime dueDate, string assignedTo)
    {
        var project = _projects.FirstOrDefault(p => p.Id == projectId);
        if (project == null)
        {
            throw new Exception($"Project with ID {projectId} not found");
        }

        var task = new Task
        {
            Id = _nextTaskId++,
            ProjectId = projectId,
            Name = taskName,
            Description = description,
            Priority = priority,
            DueDate = dueDate,
            AssignedTo = assignedTo,
            Status = "pending"
        };

        project.AddTask(task);
    }

    public void UpdateTaskStatus(int projectId, int taskId, string status)
    {
        var project = _projects.FirstOrDefault(p => p.Id == projectId);
        var task = project?.Tasks.FirstOrDefault(t => t.Id == taskId);
        if (task != null)
        {
            task.Status = status;
            if (status == "completed")
            {
                task.CompletedAt = DateTime.Now;
            }
            else
            {
                task.CompletedAt = null;
            }
        }
    }

    public void EditTask(int projectId, int taskId, string name, string description, string priority, DateTime dueDate, string assignedTo)
    {
        var project = _projects.FirstOrDefault(p => p.Id == projectId);
        var task = project?.Tasks.FirstOrDefault(t => t.Id == taskId);
        if (task != null)
        {
            task.Name = name;
            task.Description = description;
            task.Priority = priority;
            task.DueDate = dueDate;
            task.AssignedTo = assignedTo;
        }
    }

    public void DeleteTask(int projectId, int taskId)
    {
        var project = _projects.FirstOrDefault(p => p.Id == projectId);
        if (project != null)
        {
            project.Tasks.RemoveAll(t => t.Id == taskId);
        }
    }

    public void AddComment(int projectId, int taskId, string commentText)
    {
        var project = _projects.FirstOrDefault(p => p.Id == projectId);
        var task = project?.Tasks.FirstOrDefault(t => t.Id == taskId);
        if (task != null && !string.IsNullOrWhiteSpace(commentText))
        {
            task.AddComment(commentText);
        }
    }
    
    
    public void AddRisk(int projectId, string description, string impact, string probability, string mitigation)
    {
        var project = _projects.FirstOrDefault(p => p.Id == projectId);
        if (project == null)
            throw new Exception($"Project with ID {projectId} not found");
            
        var risk = new Risk
        {
            Id = _nextRiskId++,
            ProjectId = projectId,
            Description = description,
            Impact = Enum.Parse<RiskImpact>(impact, true),
            Probability = Enum.Parse<RiskProbability>(probability, true),
            MitigationStrategy = mitigation
        };
        
        project.AddRisk(risk);
    }
    
    public List<Risk> GetRisksByProjectId(int projectId)
    {
        var project = _projects.FirstOrDefault(p => p.Id == projectId);
        return project?.Risks ?? new List<Risk>();
    }
    
    public void DeleteRisk(int projectId, int riskId)
    {
        var project = GetProjectById(projectId);
        if (project == null)
        {
            throw new Exception($"Project with ID {projectId} not found");
        }

        var risk = project.Risks.FirstOrDefault(r => r.Id == riskId);
        if (risk == null)
        {
            throw new Exception($"Risk with ID {riskId} not found in project {projectId}");
        }

        project.Risks.Remove(risk);
    }
    
    
    public void AddMilestone(int projectId, string name, string description, DateTime dueDate)
    {
        var project = _projects.FirstOrDefault(p => p.Id == projectId);
        if (project == null)
            throw new Exception($"Project with ID {projectId} not found");
            
        var milestone = new Milestone
        {
            Id = _nextMilestoneId++,
            ProjectId = projectId,
            Name = name,
            Description = description,
            DueDate = dueDate
        };
        
        project.AddMilestone(milestone);
    }
    
    public List<Milestone> GetMilestonesByProjectId(int projectId)
    {
        var project = _projects.FirstOrDefault(p => p.Id == projectId);
        return project?.Milestones ?? new List<Milestone>();
    }
    
    public void CompleteMilestone(int projectId, int milestoneId)
    {
        var project = _projects.FirstOrDefault(p => p.Id == projectId);
        if (project != null)
        {
            project.CompleteMilestone(milestoneId);
        }
    }
    
    public void DeleteMilestone(int projectId, int milestoneId)
    {
        var project = GetProjectById(projectId);
        if (project == null)
        {
            throw new Exception($"Project with ID {projectId} not found");
        }

        var milestone = project.Milestones.FirstOrDefault(m => m.Id == milestoneId);
        if (milestone == null)
        {
            throw new Exception($"Milestone with ID {milestoneId} not found in project {projectId}");
        }

        
        foreach (var task in project.Tasks.Where(t => t.MilestoneId == milestoneId))
        {
            task.MilestoneId = null;
        }

        project.Milestones.Remove(milestone);
    }
    
    
    public List<Tag> GetAllTags()
    {
        return _tags;
    }
    
    public Tag AddTag(string name)
    {
        var existingTag = _tags.FirstOrDefault(t => t.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
        if (existingTag != null)
            return existingTag;
            
        var newTag = new Tag { Id = _nextTagId++, Name = name };
        _tags.Add(newTag);
        return newTag;
    }
    
    public void AddTagToTask(int projectId, int taskId, string tagName)
    {
        var project = _projects.FirstOrDefault(p => p.Id == projectId);
        var task = project?.Tasks.FirstOrDefault(t => t.Id == taskId);
        
        if (task != null)
        {
            task.AddTag(tagName);
            
            
            var tag = _tags.FirstOrDefault(t => t.Name.Equals(tagName, StringComparison.OrdinalIgnoreCase));
            if (tag == null)
            {
                tag = new Tag { Id = _nextTagId++, Name = tagName };
                _tags.Add(tag);
            }
            
            tag.AssociateWithProject(projectId);
        }
    }

    
    public TimelineData GetTimeline(DateTime startDate, DateTime endDate)
    {
        var timelineData = new TimelineData
        {
            StartDate = startDate,
            EndDate = endDate,
            Events = new List<TimelineEvent>()
        };

        foreach (var project in _projects)
        {
            
            foreach (var task in project.Tasks.Where(t => 
                (t.DueDate >= startDate && t.DueDate <= endDate) ||
                (t.CompletedAt.HasValue && t.CompletedAt.Value >= startDate && t.CompletedAt.Value <= endDate)))
            {
                timelineData.Events.Add(new TimelineEvent
                {
                    Id = task.Id,
                    Type = "task",
                    Title = task.Name,
                    Description = task.Description,
                    Date = task.DueDate,
                    Status = task.Status,
                    ProjectId = project.Id,
                    ProjectName = project.Name,
                    ProjectColor = project.Color,
                    AdditionalData = new Dictionary<string, object>
                    {
                        { "priority", task.Priority },
                        { "assignedTo", task.AssignedTo },
                        { "completedAt", task.CompletedAt ?? (object)DBNull.Value }
                    }
                });
            }

            
            foreach (var milestone in project.Milestones.Where(m => 
                (m.DueDate >= startDate && m.DueDate <= endDate) ||
                (m.CompletedAt.HasValue && m.CompletedAt.Value >= startDate && m.CompletedAt.Value <= endDate)))
            {
                timelineData.Events.Add(new TimelineEvent
                {
                    Id = milestone.Id,
                    Type = "milestone",
                    Title = milestone.Name,
                    Description = milestone.Description,
                    Date = milestone.DueDate,
                    Status = milestone.Completed ? "completed" : "pending",
                    ProjectId = project.Id,
                    ProjectName = project.Name,
                    ProjectColor = project.Color,
                    AdditionalData = new Dictionary<string, object>
                    {
                        { "completedAt", milestone.CompletedAt ?? (object)DBNull.Value }
                    }
                });
            }

            
            foreach (var risk in project.Risks.Where(r => 
                r.IdentifiedDate >= startDate && r.IdentifiedDate <= endDate))
            {
                timelineData.Events.Add(new TimelineEvent
                {
                    Id = risk.Id,
                    Type = "risk",
                    Title = risk.Description,
                    Description = risk.MitigationStrategy,
                    Date = risk.IdentifiedDate,
                    Status = risk.Status,
                    ProjectId = project.Id,
                    ProjectName = project.Name,
                    ProjectColor = project.Color,
                    AdditionalData = new Dictionary<string, object>
                    {
                        { "impact", risk.Impact.ToString() },
                        { "probability", risk.Probability.ToString() },
                        { "riskScore", risk.CalculateRiskScore() }
                    }
                });
            }
        }

        
        timelineData.Events = timelineData.Events.OrderBy(e => e.Date).ToList();

        return timelineData;
    }
    
    public ProjectTimelineData GetProjectTimeline(int projectId, DateTime startDate, DateTime endDate)
    {
        var project = GetProjectById(projectId);
        if (project == null)
        {
            throw new Exception($"Project with ID {projectId} not found");
        }

        var timelineData = new ProjectTimelineData
        {
            ProjectId = project.Id,
            ProjectName = project.Name,
            ProjectColor = project.Color,
            Events = new List<TimelineEvent>()
        };

        
        foreach (var task in project.Tasks.Where(t => 
            t.DueDate >= startDate && t.DueDate <= endDate ||
            t.CompletedAt.HasValue && t.CompletedAt.Value >= startDate && t.CompletedAt.Value <= endDate))
        {
            timelineData.Events.Add(new TimelineEvent
            {
                Id = task.Id,
                Type = "task",
                Title = task.Name,
                Description = task.Description,
                Date = task.DueDate,
                Status = task.Status,
                ProjectId = project.Id,
                ProjectName = project.Name,
                ProjectColor = project.Color,
                AdditionalData = new Dictionary<string, object>
                {
                    { "priority", task.Priority },
                    { "assignedTo", task.AssignedTo },
                    { "completedAt", task.CompletedAt ?? (object)DBNull.Value }
                }
            });
        }

        
        foreach (var milestone in project.Milestones.Where(m => 
            m.DueDate >= startDate && m.DueDate <= endDate ||
            m.CompletedAt.HasValue && m.CompletedAt.Value >= startDate && m.CompletedAt.Value <= endDate))
        {
            timelineData.Events.Add(new TimelineEvent
            {
                Id = milestone.Id,
                Type = "milestone",
                Title = milestone.Name,
                Description = milestone.Description,
                Date = milestone.DueDate,
                Status = milestone.Completed ? "completed" : "pending",
                ProjectId = project.Id,
                ProjectName = project.Name,
                ProjectColor = project.Color,
                AdditionalData = new Dictionary<string, object>
                {
                    { "completedAt", milestone.CompletedAt ?? (object)DBNull.Value }
                }
            });
        }

        
        foreach (var risk in project.Risks.Where(r => 
            r.IdentifiedDate >= startDate && r.IdentifiedDate <= endDate))
        {
            timelineData.Events.Add(new TimelineEvent
            {
                Id = risk.Id,
                Type = "risk",
                Title = risk.Description,
                Description = risk.MitigationStrategy,
                Date = risk.IdentifiedDate,
                Status = risk.Status,
                ProjectId = project.Id,
                ProjectName = project.Name,
                ProjectColor = project.Color,
                AdditionalData = new Dictionary<string, object>
                {
                    { "impact", risk.Impact.ToString() },
                    { "probability", risk.Probability.ToString() },
                    { "riskScore", risk.CalculateRiskScore() }
                }
            });
        }

        
        timelineData.Events = timelineData.Events.OrderBy(e => e.Date).ToList();

        return timelineData;
    }
    
    
    public Dictionary<string, int> GetTaskPriorityDistribution(int projectId)
    {
        var project = GetProjectById(projectId);
        if (project == null) 
            return new Dictionary<string, int>();
        
        return new Dictionary<string, int>
        {
            { "high", project.Tasks.Count(t => t.Priority.ToLower() == "high") },
            { "medium", project.Tasks.Count(t => t.Priority.ToLower() == "medium") },
            { "low", project.Tasks.Count(t => t.Priority.ToLower() == "low") }
        };
    }
        
    public Dictionary<string, WorkloadStats> GetWorkloadDistribution(int projectId)
    {
        var project = GetProjectById(projectId);
        return project?.GetWorkloadDistribution() ?? new Dictionary<string, WorkloadStats>();
    }
    
    
    public void ProcessProjectItem(IProjectItem item)
    {
        Console.WriteLine($"Processing {item.GetItemType()} (ID: {item.Id})");
        
        if (item.IsOverdue())
        {
            Console.WriteLine($"Warning: Item is overdue! Due date was {item.GetDueDate():yyyy-MM-dd}");
        }
        
        Console.WriteLine($"Current status: {item.GetStatus()}");
    }

    
    public IEnumerable<IProjectItem> GetAllProjectItems(int projectId)
    {
        var project = GetProjectById(projectId);
        if (project == null) return new List<IProjectItem>();
        
        var items = new List<IProjectItem>();
        
        
        items.AddRange(project.Tasks);
        
        
        items.AddRange(project.Milestones);
        
        
        items.AddRange(project.Risks);
        
        return items;
    }
}

