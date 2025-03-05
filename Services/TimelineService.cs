using System;
using System.Collections.Generic;
using System.Linq;

public class TimelineService : ITimelineService
{
    private readonly IProjectService _projectManager;

    public TimelineService(IProjectService projectManager)
    {
        _projectManager = projectManager;
    }

    
    public TimelineData GetMasterTimeline(DateTime startDate, DateTime endDate)
    {
        var timelineData = new TimelineData
        {
            StartDate = startDate,
            EndDate = endDate,
            Events = new List<TimelineEvent>()
        };

        
        var projects = _projectManager.GetProjects();
        
        foreach (var project in projects)
        {
            
            var projectItems = _projectManager.GetAllProjectItems(project.Id);
            
            foreach (var item in projectItems)
            {
                
                var dueDate = item.GetDueDate();
                if (dueDate >= startDate && dueDate <= endDate)
                {
                    
                    timelineData.Events.Add(item.ToTimelineEvent(project.Name, project.Color));
                }
            }
        }

        
        timelineData.Events = timelineData.Events.OrderBy(e => e.Date).ToList();
        
        return timelineData;
    }

    public ProjectTimelineData GetProjectTimeline(int projectId, DateTime startDate, DateTime endDate)
    {
        var project = _projectManager.GetProjectById(projectId);
        if (project == null)
        {
            throw new ArgumentException($"Project with ID {projectId} not found");
        }

        var timelineData = new ProjectTimelineData
        {
            ProjectId = project.Id,
            ProjectName = project.Name,
            ProjectColor = project.Color,
            Events = new List<TimelineEvent>()
        };

        
        var projectItems = _projectManager.GetAllProjectItems(project.Id);
        
        foreach (var item in projectItems)
        {
            
            var dueDate = item.GetDueDate();
            if (dueDate >= startDate && dueDate <= endDate)
            {
                
                timelineData.Events.Add(item.ToTimelineEvent(project.Name, project.Color));
            }
        }

        
        timelineData.Events = timelineData.Events.OrderBy(e => e.Date).ToList();
        
        return timelineData;
    }
}