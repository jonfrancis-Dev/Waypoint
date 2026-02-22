using Waypoint.Core.DTOs;
using Waypoint.Core.Interfaces;

namespace Waypoint.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly IBudgetRepository _budgetRepo;

    public DashboardService(ITransactionRepository transactionRepo, IBudgetRepository budgetRepo)
    {
        _transactionRepo = transactionRepo;
        _budgetRepo = budgetRepo;
    }

    public async Task<DashboardSummary> GetDashboardSummaryAsync(int month, int year)
    {
        var transactions = await _transactionRepo.GetByMonthAndYearAsync(month, year);

        var totalIncome = transactions.Where(t => !t.IsDebit).Sum(t => t.Amount);
        var totalSpending = transactions.Where(t => t.IsDebit).Sum(t => t.Amount);

        var spendingByCategory = transactions
            .Where(t => t.IsDebit)
            .GroupBy(t => t.NormalizedCategory)
            .Select(g => new { Category = g.Key, Amount = g.Sum(t => t.Amount) })
            .OrderByDescending(x => x.Amount)
            .ToList();

        var categorySpending = spendingByCategory.Select(x =>
            new CategorySpending(x.Category, x.Amount,
                totalSpending > 0 ? Math.Round((x.Amount / totalSpending) * 100, 1) : 0))
            .ToList();

        var topTransactions = transactions
            .Where(t => t.IsDebit)
            .OrderByDescending(t => t.Amount)
            .Take(5)
            .Select(t => new TopTransaction(t.Id, t.Date, t.Description, t.NormalizedCategory, t.Amount))
            .ToList();

        // Budget comparisons if a budget exists for this month
        List<BudgetComparison>? budgetComparisons = null;
        var budget = await _budgetRepo.GetByMonthAndYearAsync(month, year);
        if (budget is not null)
        {
            var spendingLookup = spendingByCategory.ToDictionary(x => x.Category, x => x.Amount);
            budgetComparisons = budget.LineItems.Select(li =>
                new BudgetComparison(li.CategoryName, li.LimitAmount,
                    spendingLookup.GetValueOrDefault(li.CategoryName, 0m)))
                .ToList();
        }

        return new DashboardSummary(totalIncome, totalSpending, totalIncome - totalSpending,
            categorySpending, topTransactions, budgetComparisons);
    }

    public async Task<List<MonthlyTrend>> GetTrendsAsync(int months)
    {
        var trends = new List<MonthlyTrend>();
        var now = DateTime.Now;

        for (int i = months - 1; i >= 0; i--)
        {
            var date = now.AddMonths(-i);
            var transactions = await _transactionRepo.GetByMonthAndYearAsync(date.Month, date.Year);

            var categoryAmounts = transactions
                .Where(t => t.IsDebit)
                .GroupBy(t => t.NormalizedCategory)
                .OrderByDescending(g => g.Sum(t => t.Amount))
                .Take(7)
                .ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));

            var total = transactions.Where(t => t.IsDebit).Sum(t => t.Amount);
            var topTotal = categoryAmounts.Values.Sum();
            if (total > topTotal)
                categoryAmounts["Other"] = total - topTotal;

            trends.Add(new MonthlyTrend(date.Month, date.Year, categoryAmounts, total));
        }

        return trends;
    }
}
