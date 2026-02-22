using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface ISavingsRepository
{
    Task<List<SavingsGoal>> GetAllAsync();
    Task<SavingsGoal?> GetByIdAsync(Guid id);
    Task AddAsync(SavingsGoal goal);
    Task SaveChangesAsync();
}
