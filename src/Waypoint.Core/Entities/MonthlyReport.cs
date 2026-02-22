namespace Waypoint.Core.Entities;

public class MonthlyReport
{
    public Guid Id { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public string ReportContent { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
}
