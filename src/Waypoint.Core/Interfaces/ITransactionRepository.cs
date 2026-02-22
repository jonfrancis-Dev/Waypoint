using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface ITransactionRepository
{
    Task<List<Transaction>> GetByMonthAndYearAsync(int month, int year);
    Task<bool> ExistsAsync(DateTime date, decimal amount, string description);
    Task AddRangeAsync(IEnumerable<Transaction> transactions);
    Task SaveChangesAsync();
}
