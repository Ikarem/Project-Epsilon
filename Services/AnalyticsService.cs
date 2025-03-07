using System;
using System.Collections.Generic;
using System.Linq;

public class AnalyticsService : IAnalyticsService
{
    private readonly IProjectService _projectManager;

    public AnalyticsService(IProjectService projectManager)
    {
        _projectManager = projectManager;
    }

    public Dictionary<string, double> GetCompletionRateStats()
    {
        var projects = _projectManager.GetProjects();
        var completionRates = new Dictionary<string, double>();

        foreach (var project in projects)
        {
            double completionRate = 0;
            if (project.Tasks.Count > 0)
            {
                int completedTasks = project.Tasks.Count(t => t.Status == "completed");
                completionRate = Math.Round((double)(completedTasks * 100) / project.Tasks.Count);
            }
            completionRates[project.Name] = completionRate;
        }

        return completionRates;
    }

    public Dictionary<string, int> GetTaskVelocityData(int days = 30)
    {
        var projects = _projectManager.GetProjects();
        var taskVelocityData = new Dictionary<string, int>();

        var startDate = DateTime.Now.AddDays(-days);
        var endDate = DateTime.Now;

        
        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            taskVelocityData[date.ToString("yyyy-MM-dd")] = 0;
        }

        
        foreach (var project in projects)
        {
            foreach (var task in project.Tasks)
            {
                if (task.Status == "completed" && task.CompletedAt.HasValue)
                {
                    var completionDate = task.CompletedAt.Value.ToString("yyyy-MM-dd");
                    if (taskVelocityData.ContainsKey(completionDate))
                    {
                        taskVelocityData[completionDate]++;
                    }
                }
            }
        }

        return taskVelocityData;
    }

    public Dictionary<string, int> GetCompletionTimeDistribution()
    {
        var projects = _projectManager.GetProjects();
        var completionTimeDistribution = new Dictionary<string, int>
        {
            { "within1Day", 0 },
            { "within3Days", 0 },
            { "within1Week", 0 },
            { "within2Weeks", 0 },
            { "moreThan2Weeks", 0 }
        };

        foreach (var project in projects)
        {
            foreach (var task in project.Tasks)
            {
                if (task.Status == "completed" && task.CompletedAt.HasValue)
                {
                    
                    TimeSpan completionTime = task.CompletedAt.Value - task.DueDate;
                    int daysToComplete = Math.Abs(completionTime.Days);

                    if (daysToComplete <= 1)
                        completionTimeDistribution["within1Day"]++;
                    else if (daysToComplete <= 3)
                        completionTimeDistribution["within3Days"]++;
                    else if (daysToComplete <= 7)
                        completionTimeDistribution["within1Week"]++;
                    else if (daysToComplete <= 14)
                        completionTimeDistribution["within2Weeks"]++;
                    else
                        completionTimeDistribution["moreThan2Weeks"]++;
                }
            }
        }

        return completionTimeDistribution;
    }

    public List<ProjectHealthData> GetProjectHealthOverview()
    {
        var projects = _projectManager.GetProjects();
        var healthData = new List<ProjectHealthData>();

        foreach (var project in projects)
        {
            var tasks = project.Tasks;
            
            
            int totalTasks = tasks.Count;
            int completedTasks = tasks.Count(t => t.Status == "completed");
            int overdueTasks = tasks.Count(t => t.IsOverdue());
            int progress = totalTasks > 0 ? (completedTasks * 100) / totalTasks : 0;
            
            
            int riskScore = project.Risks.Count > 0 ? 
                project.Risks.Max(r => r.CalculateRiskScore()) : 0;
                
            
            int healthScore = 100;
            
            
            if (totalTasks > 0)
            {
                int overduePercentage = (overdueTasks * 100) / totalTasks;
                healthScore -= overduePercentage * 2; 
            }
            
            
            healthScore -= (100 - progress) / 3;
            
            
            healthScore -= riskScore * 3;
            
            
            healthScore = Math.Max(0, Math.Min(100, healthScore));
            
            healthData.Add(new ProjectHealthData
            {
                Id = project.Id,
                Name = project.Name,
                Score = healthScore,
                Progress = progress,
                CompletedTasks = completedTasks,
                TotalTasks = totalTasks,
                OverdueTasks = overdueTasks,
                RiskScore = riskScore,
                Color = project.Color
            });
        }

        
        return healthData.OrderByDescending(p => p.Score).ToList();
    }
}

public class ProjectHealthData
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Score { get; set; }
    public int Progress { get; set; }
    public int CompletedTasks { get; set; }
    public int TotalTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int RiskScore { get; set; }
    public string Color { get; set; } = string.Empty;
    
    public string GetHealthStatus()
    {
        if (Score >= 80) return "Excellent";
        if (Score >= 60) return "Good";
        if (Score >= 40) return "Average";
        return "Poor";
    }
}