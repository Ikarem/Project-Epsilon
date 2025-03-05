using System;

public class Milestone : ProjectItemBase
{
    public new int Id { get; set; }
    public new int ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public bool Completed { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
    
    public override string GetItemType() => "milestone";
    public override bool IsOverdue() => !Completed && DueDate < DateTime.Today;
    public override DateTime GetDueDate() => DueDate;
    public override string GetStatus() => Completed ? "completed" : "pending";
    
    public override TimelineEvent ToTimelineEvent(string projectName, string projectColor)
    {
        var timelineEvent = base.ToTimelineEvent(projectName, projectColor);
        timelineEvent.Title = Name;
        timelineEvent.Description = Description;
        return timelineEvent;
    }
    
    public int DaysRemaining() => Completed ? 0 : (DueDate - DateTime.Today).Days;
}