using System;

public interface IProjectItem
{
    int Id { get; set; }
    int ProjectId { get; set; }
    string GetItemType();
    bool IsOverdue();
    DateTime GetDueDate();
    string GetStatus();
    TimelineEvent ToTimelineEvent(string projectName, string projectColor);
}