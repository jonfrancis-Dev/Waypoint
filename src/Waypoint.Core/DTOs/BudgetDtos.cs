namespace Waypoint.Core.DTOs;

public record BudgetLineItemDto(string CategoryName, decimal LimitAmount);

public record BudgetCategorySummary(
    string CategoryName,
    decimal Budgeted,
    decimal Actual,
    decimal Variance,
    decimal PercentUsed);

public record BudgetPlanSummary(
    Guid Id,
    int Month,
    int Year,
    DateTime CreatedAt,
    List<BudgetLineItemDto> LineItems);

public record BudgetSummary(
    Guid PlanId,
    int Month,
    int Year,
    decimal TotalBudgeted,
    decimal TotalSpent,
    List<BudgetCategorySummary> Categories);
