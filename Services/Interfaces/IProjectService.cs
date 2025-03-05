using System;
using System.Collections.Generic;

public interface IProjectService
{
    void AddProject(string name, string description, string color);
    void DeleteProject(int id);
    List<Project> GetProjects();
    Project GetProjectById(int id);
    void AddTask(int projectId, string taskName, string description, string priority, DateTime dueDate, string assignedTo);
    void UpdateTaskStatus(int projectId, int taskId, string status);
    void EditTask(int projectId, int taskId, string name, string description, string priority, DateTime dueDate, string assignedTo);
    void DeleteTask(int projectId, int taskId);
    void AddComment(int projectId, int taskId, string commentText);
    
    
    void AddRisk(int projectId, string description, string impact, string probability, string mitigation);
    List<Risk> GetRisksByProjectId(int projectId);
    void DeleteRisk(int projectId, int riskId);
    
    
    void AddMilestone(int projectId, string name, string description, DateTime dueDate);
    List<Milestone> GetMilestonesByProjectId(int projectId);
    void CompleteMilestone(int projectId, int milestoneId);
    void DeleteMilestone(int projectId, int milestoneId);
    
    
    List<Tag> GetAllTags();
    Tag AddTag(string name);
    void AddTagToTask(int projectId, int taskId, string tagName);
    
    
    TimelineData GetTimeline(DateTime startDate, DateTime endDate);
    ProjectTimelineData GetProjectTimeline(int projectId, DateTime startDate, DateTime endDate);
    
    
    Dictionary<string, int> GetTaskPriorityDistribution(int projectId);
    Dictionary<string, WorkloadStats> GetWorkloadDistribution(int projectId);
    
    
    void ProcessProjectItem(IProjectItem item);
    IEnumerable<IProjectItem> GetAllProjectItems(int projectId);
}