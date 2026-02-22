using Microsoft.EntityFrameworkCore;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;
using Waypoint.Infrastructure.Data;

namespace Waypoint.Infrastructure.Repositories;

public class BudgetRepository : IBudgetRepository
{
    private readonly WaypointDbContext _context;

    public BudgetRepository(WaypointDbContext context)
    {
        _context = context;
    }

    public async Task<BudgetPlan?> GetByMonthAndYearAsync(int month, int year)
    {
        return await _context.BudgetPlans
            .Include(bp => bp.LineItems)
            .FirstOrDefaultAsync(bp => bp.Month == month && bp.Year == year);
    }

    public async Task AddAsync(BudgetPlan plan)
    {
        await _context.BudgetPlans.AddAsync(plan);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
