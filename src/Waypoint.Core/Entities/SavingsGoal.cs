namespace Waypoint.Core.Entities;

public class SavingsGoal
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public DateTime TargetDate { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<SavingsContribution> Contributions { get; set; } = new List<SavingsContribution>();
}
