using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface IBudgetRepository
{
    Task<BudgetPlan?> GetByMonthAndYearAsync(int month, int year);
    Task AddAsync(BudgetPlan plan);
    Task SaveChangesAsync();
}
