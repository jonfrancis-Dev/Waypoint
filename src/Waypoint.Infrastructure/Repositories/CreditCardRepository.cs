using Microsoft.EntityFrameworkCore;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;
using Waypoint.Infrastructure.Data;

namespace Waypoint.Infrastructure.Repositories;

public class CreditCardRepository : ICreditCardRepository
{
    private readonly WaypointDbContext _context;

    public CreditCardRepository(WaypointDbContext context)
    {
        _context = context;
    }

    public async Task<List<CreditCard>> GetAllAsync()
    {
        return await _context.CreditCards.ToListAsync();
    }

    public async Task<CreditCard?> GetByIdAsync(Guid id)
    {
        return await _context.CreditCards.FindAsync(id);
    }

    public async Task AddAsync(CreditCard creditCard)
    {
        await _context.CreditCards.AddAsync(creditCard);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
