using Waypoint.Core.DTOs;

namespace Waypoint.Core.Interfaces;

public interface IBudgetService
{
    Task<BudgetPlanSummary> CreateOrUpdateBudgetAsync(int month, int year, List<BudgetLineItemDto> lineItems);
    Task<BudgetPlanSummary?> GetBudgetAsync(int month, int year);
    Task<BudgetSummary?> GetBudgetSummaryAsync(int month, int year);
    Task<bool> DeleteBudgetAsync(Guid id);
}
