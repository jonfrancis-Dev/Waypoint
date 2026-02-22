namespace Waypoint.Core.Entities;

public class BudgetPlan
{
    public Guid Id { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<BudgetLineItem> LineItems { get; set; } = new List<BudgetLineItem>();
}
