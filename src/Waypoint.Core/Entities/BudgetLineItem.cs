namespace Waypoint.Core.Entities;

public class BudgetLineItem
{
    public Guid Id { get; set; }
    public Guid BudgetPlanId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal LimitAmount { get; set; }

    public BudgetPlan BudgetPlan { get; set; } = null!;
}
