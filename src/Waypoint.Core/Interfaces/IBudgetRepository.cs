using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface IBudgetRepository
{
    Task<BudgetPlan?> GetByMonthAndYearAsync(int month, int year);
    Task<BudgetPlan?> GetByIdAsync(Guid id);
    Task AddAsync(BudgetPlan plan);
    void Delete(BudgetPlan plan);
    void RemoveLineItems(IEnumerable<BudgetLineItem> lineItems);
    Task SaveChangesAsync();
}
