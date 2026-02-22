using Microsoft.EntityFrameworkCore;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;
using Waypoint.Infrastructure.Data;

namespace Waypoint.Infrastructure.Repositories;

public class DebtRepository : IDebtRepository
{
    private readonly WaypointDbContext _context;

    public DebtRepository(WaypointDbContext context)
    {
        _context = context;
    }

    public async Task<List<Debt>> GetAllAsync()
    {
        return await _context.Debts.ToListAsync();
    }

    public async Task<Debt?> GetByIdAsync(Guid id)
    {
        return await _context.Debts.FindAsync(id);
    }

    public async Task AddAsync(Debt debt)
    {
        await _context.Debts.AddAsync(debt);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
