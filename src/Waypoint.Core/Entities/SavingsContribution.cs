namespace Waypoint.Core.Entities;

public class SavingsContribution
{
    public Guid Id { get; set; }
    public Guid SavingsGoalId { get; set; }
    public decimal Amount { get; set; }
    public DateTime ContributedOn { get; set; }
    public string? Note { get; set; }

    public SavingsGoal SavingsGoal { get; set; } = null!;
}
