using System;
using System.Collections.Generic;

public class Task : ProjectItemBase
{
    public new int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "low";
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = "pending";
    public string AssignedTo { get; set; } = string.Empty;
    public List<Comment> Comments { get; set; } = new();
    public List<int> Dependencies { get; set; } = new();
    public new int ProjectId { get; set;}
    public List<string> Tags { get; set; } = new();
    public int? MilestoneId { get; set; }
    public DateTime? CompletedAt { get; set; }

    public override string GetItemType() => "task";
    public override bool IsOverdue() => Status != "completed" && DueDate < DateTime.Today;
    public override DateTime GetDueDate() => DueDate;
    public override string GetStatus() => Status;

    public override TimelineEvent ToTimelineEvent(string projectName, string projectColor)
    {
        var timelineEvent = base.ToTimelineEvent(projectName, projectColor);
        timelineEvent.Title = Name;
        timelineEvent.Description = Description;
        timelineEvent.AdditionalData = new Dictionary<string, object>
        {
            { "assignedTo", AssignedTo },
            { "priority", Priority }
        };
        return timelineEvent;
    }

    public void AddComment(string comment)
    {
        Comments.Add(new Comment
        {
            Id = DateTime.Now.Ticks,
            Text = comment,
            Date = DateTime.Now
        });
    }

    public void AddDependency(int taskId)
    {
        if (!Dependencies.Contains(taskId))
        {
            Dependencies.Add(taskId);
        }
    }
    
    public void AddTag(string tag)
    {
        if (!Tags.Contains(tag))
        {
            Tags.Add(tag);
        }
    }
    
    public void RemoveTag(string tag)
    {
        Tags.Remove(tag);
    }
    
    public void MarkComplete()
    {
        Status = "completed";
        CompletedAt = DateTime.Now;
    }
}

public class Comment
{
    public long Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}