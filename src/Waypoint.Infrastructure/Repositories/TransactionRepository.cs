using Microsoft.EntityFrameworkCore;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;
using Waypoint.Infrastructure.Data;

namespace Waypoint.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly WaypointDbContext _context;

    public TransactionRepository(WaypointDbContext context)
    {
        _context = context;
    }

    public async Task<List<Transaction>> GetByMonthAndYearAsync(int month, int year)
    {
        return await _context.Transactions
            .Where(t => t.Date.Month == month && t.Date.Year == year)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(DateTime date, decimal amount, string description)
    {
        return await _context.Transactions
            .AnyAsync(t => t.Date == date && t.Amount == amount && t.Description == description);
    }

    public async Task AddRangeAsync(IEnumerable<Transaction> transactions)
    {
        await _context.Transactions.AddRangeAsync(transactions);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
