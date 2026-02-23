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

    public void Delete(SavingsGoal goal)
    {
        _context.SavingsGoals.Remove(goal);
    }

    public async Task AddContributionAsync(SavingsContribution contribution)
    {
        await _context.SavingsContributions.AddAsync(contribution);
    }

    public async Task<List<SavingsContribution>> GetContributionsAsync(Guid goalId)
    {
        return await _context.SavingsContributions
            .Where(c => c.SavingsGoalId == goalId)
            .OrderByDescending(c => c.ContributedOn)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
