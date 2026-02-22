namespace Waypoint.Core.DTOs;

public record CategorySpending(string CategoryName, decimal Amount, decimal Percentage);

public record TopTransaction(Guid Id, DateTime Date, string Description, string Category, decimal Amount);

public record BudgetComparison(string CategoryName, decimal Budgeted, decimal Actual);

public record DashboardSummary(
    decimal TotalIncome,
    decimal TotalSpending,
    decimal NetAmount,
    List<CategorySpending> SpendingByCategory,
    List<TopTransaction> TopTransactions,
    List<BudgetComparison>? BudgetComparisons);

public record MonthlyTrend(int Month, int Year, Dictionary<string, decimal> CategoryAmounts, decimal Total);
