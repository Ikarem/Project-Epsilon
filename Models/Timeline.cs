using System;
using System.Collections.Generic;

public class TimelineEvent
{
    public int Id { get; set; }
    public string Type { get; set; }  = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectColor { get; set; } = string.Empty;
    public Dictionary<string, object> AdditionalData { get; set; } = new Dictionary<string, object>();
}

public class TimelineData
{
    public List<TimelineEvent> Events { get; set; } = new List<TimelineEvent>();
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class ProjectTimelineData
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectColor { get; set; } = string.Empty;
    public List<TimelineEvent> Events { get; set; } = new List<TimelineEvent>();
}