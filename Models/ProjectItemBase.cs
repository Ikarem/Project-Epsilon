using System;

public abstract class ProjectItemBase : IProjectItem
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public abstract string GetItemType();
    public abstract bool IsOverdue();
    public abstract DateTime GetDueDate();
    public abstract string GetStatus();
    
    public virtual TimelineEvent ToTimelineEvent(string projectName, string projectColor)
    {
        return new TimelineEvent
        {
            Id = Id,
            ProjectId = ProjectId,
            ProjectName = projectName,
            ProjectColor = projectColor,
            Date = GetDueDate(),
            Status = GetStatus(),
            Type = GetItemType()
        };
    }
}