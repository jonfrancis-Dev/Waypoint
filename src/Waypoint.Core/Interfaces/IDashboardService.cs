using Waypoint.Core.DTOs;

namespace Waypoint.Core.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummary> GetDashboardSummaryAsync(int month, int year);
    Task<List<MonthlyTrend>> GetTrendsAsync(int months);
}
