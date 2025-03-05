using System;
using System.Collections.Generic;

public class Risk : ProjectItemBase
{
    public new int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public RiskImpact Impact { get; set; }
    public RiskProbability Probability { get; set; }
    public string MitigationStrategy { get; set; } = string.Empty;
    public string Status { get; set; } = "identified";
    public new int ProjectId { get; set; }
    public DateTime IdentifiedDate { get; set; } = DateTime.Now;
    
    public int CalculateRiskScore()
    {
        
        int impactScore = Impact == RiskImpact.Low ? 1 : Impact == RiskImpact.Medium ? 2 : 3;
        int probabilityScore = Probability == RiskProbability.Low ? 1 : Probability == RiskProbability.Medium ? 2 : 3;
        
        return impactScore * probabilityScore;
    }
    
    public override string GetItemType() => "risk";
    public override bool IsOverdue() => false; 
    public override DateTime GetDueDate() => IdentifiedDate;
    public override string GetStatus() => Status;
    
    public override TimelineEvent ToTimelineEvent(string projectName, string projectColor)
    {
        var timelineEvent = base.ToTimelineEvent(projectName, projectColor);
        timelineEvent.Title = "Risk";
        timelineEvent.Description = Description;
        timelineEvent.AdditionalData = new Dictionary<string, object>
        {
            { "impact", Impact.ToString() },
            { "probability", Probability.ToString() },
            { "riskScore", CalculateRiskScore() }
        };
        return timelineEvent;
    }
}

public enum RiskImpact
{
    Low,
    Medium,
    High
}

public enum RiskProbability
{
    Low,
    Medium,
    High
}