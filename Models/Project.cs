public class Project
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Color { get; set; } = "#4361ee";
    public List<Task> Tasks { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public List<Risk> Risks { get; set; } = new();
    public List<Milestone> Milestones { get; set; } = new();

    public void AddTask(Task task)
    {
        Tasks.Add(task);
    }

    public void AddRisk(Risk risk)
    {
        Risks.Add(risk);
    }
    
    public void AddMilestone(Milestone milestone)
    {
        milestone.ProjectId = Id;
        Milestones.Add(milestone);
    }
    
    public void CompleteMilestone(int milestoneId)
    {
        var milestone = Milestones.FirstOrDefault(m => m.Id == milestoneId);
        if (milestone != null)
        {
            milestone.Completed = true;
            milestone.CompletedAt = DateTime.Now;
        }
    }

    public int GetProgress()
    {
        if (Tasks == null || Tasks.Count == 0) return 0;
        var completed = Tasks.Count(t => t.Status == "completed");
        return (int)Math.Round((double)(completed * 100) / Tasks.Count);
    }

    public int GetHighestRiskScore()
    {
        if (Risks == null || Risks.Count == 0) return 0;
        return Risks.Max(r => r.CalculateRiskScore());
    }
    public Dictionary<string, WorkloadStats> GetWorkloadDistribution()
    {
        var distribution = new Dictionary<string, WorkloadStats>();
        
        foreach (var task in Tasks)
        {
            string assignee = string.IsNullOrEmpty(task.AssignedTo) ? "Unassigned" : task.AssignedTo;
            
            if (!distribution.ContainsKey(assignee))
            {
                distribution[assignee] = new WorkloadStats();
            }
            
            distribution[assignee].Total++;
            
            if (task.Status == "pending")
                distribution[assignee].Pending++;
            else if (task.Status == "in-progress")
                distribution[assignee].InProgress++;
            else if (task.Status == "completed")
                distribution[assignee].Completed++;
        }
        
        return distribution;
    }
}

public class WorkloadStats
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int InProgress { get; set; }
    public int Completed { get; set; }
}