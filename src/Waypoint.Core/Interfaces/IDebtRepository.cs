using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface IDebtRepository
{
    Task<List<Debt>> GetAllAsync();
    Task<Debt?> GetByIdAsync(Guid id);
    Task AddAsync(Debt debt);
    Task SaveChangesAsync();
}
