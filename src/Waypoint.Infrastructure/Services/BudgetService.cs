using Waypoint.Core.DTOs;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;

namespace Waypoint.Infrastructure.Services;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _budgetRepo;
    private readonly ITransactionRepository _transactionRepo;

    public BudgetService(IBudgetRepository budgetRepo, ITransactionRepository transactionRepo)
    {
        _budgetRepo = budgetRepo;
        _transactionRepo = transactionRepo;
    }

    public async Task<BudgetPlanSummary> CreateOrUpdateBudgetAsync(int month, int year, List<BudgetLineItemDto> lineItems)
    {
        var existing = await _budgetRepo.GetByMonthAndYearAsync(month, year);

        if (existing is not null)
        {
            _budgetRepo.Delete(existing);
            await _budgetRepo.SaveChangesAsync();
        }

        var plan = new BudgetPlan
        {
            Id = Guid.NewGuid(),
            Month = month,
            Year = year,
            CreatedAt = DateTime.UtcNow,
            LineItems = lineItems.Select(li => new BudgetLineItem
            {
                Id = Guid.NewGuid(),
                CategoryName = li.CategoryName,
                LimitAmount = li.LimitAmount
            }).ToList()
        };

        await _budgetRepo.AddAsync(plan);
        await _budgetRepo.SaveChangesAsync();
        return ToPlanSummary(plan);
    }

    public async Task<BudgetPlanSummary?> GetBudgetAsync(int month, int year)
    {
        var plan = await _budgetRepo.GetByMonthAndYearAsync(month, year);
        return plan is null ? null : ToPlanSummary(plan);
    }

    public async Task<BudgetSummary?> GetBudgetSummaryAsync(int month, int year)
    {
        var plan = await _budgetRepo.GetByMonthAndYearAsync(month, year);
        if (plan is null) return null;

        var transactions = await _transactionRepo.GetByMonthAndYearAsync(month, year);
        var spendingByCategory = transactions
            .Where(t => t.IsDebit)
            .GroupBy(t => t.NormalizedCategory)
            .ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));

        var categories = plan.LineItems.Select(li =>
        {
            var actual = spendingByCategory.GetValueOrDefault(li.CategoryName, 0m);
            var variance = li.LimitAmount - actual;
            var percentUsed = li.LimitAmount > 0 ? (actual / li.LimitAmount) * 100 : 0;
            return new BudgetCategorySummary(li.CategoryName, li.LimitAmount, actual, variance, Math.Round(percentUsed, 1));
        }).ToList();

        return new BudgetSummary(
            plan.Id,
            plan.Month,
            plan.Year,
            categories.Sum(c => c.Budgeted),
            categories.Sum(c => c.Actual),
            categories);
    }

    public async Task<bool> DeleteBudgetAsync(Guid id)
    {
        var plan = await _budgetRepo.GetByIdAsync(id);
        if (plan is null) return false;

        _budgetRepo.Delete(plan);
        await _budgetRepo.SaveChangesAsync();
        return true;
    }

    private static BudgetPlanSummary ToPlanSummary(BudgetPlan plan) =>
        new(plan.Id, plan.Month, plan.Year, plan.CreatedAt,
            plan.LineItems.Select(li => new BudgetLineItemDto(li.CategoryName, li.LimitAmount)).ToList());
}
