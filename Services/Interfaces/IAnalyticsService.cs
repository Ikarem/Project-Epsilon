using System;
using System.Collections.Generic;

public interface IAnalyticsService
{
    Dictionary<string, double> GetCompletionRateStats();
    Dictionary<string, int> GetTaskVelocityData(int days = 30);
    Dictionary<string, int> GetCompletionTimeDistribution();
    List<ProjectHealthData> GetProjectHealthOverview();
}