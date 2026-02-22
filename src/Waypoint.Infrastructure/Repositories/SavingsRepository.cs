using Microsoft.EntityFrameworkCore;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;
using Waypoint.Infrastructure.Data;

namespace Waypoint.Infrastructure.Repositories;

public class SavingsRepository : ISavingsRepository
{
    private readonly WaypointDbContext _context;

    public SavingsRepository(WaypointDbContext context)
    {
        _context = context;
    }

    public async Task<List<SavingsGoal>> GetAllAsync()
    {
        return await _context.SavingsGoals.ToListAsync();
    }

    public async Task<SavingsGoal?> GetByIdAsync(Guid id)
    {
        return await _context.SavingsGoals.FindAsync(id);
    }

    public async Task AddAsync(SavingsGoal goal)
    {
        await _context.SavingsGoals.AddAsync(goal);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
