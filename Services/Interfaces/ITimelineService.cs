using System;

public interface ITimelineService
{
    TimelineData GetMasterTimeline(DateTime startDate, DateTime endDate);
    ProjectTimelineData GetProjectTimeline(int projectId, DateTime startDate, DateTime endDate);
}