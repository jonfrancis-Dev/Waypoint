using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface ICreditCardRepository
{
    Task<List<CreditCard>> GetAllAsync();
    Task<CreditCard?> GetByIdAsync(Guid id);
    Task AddAsync(CreditCard creditCard);
    Task SaveChangesAsync();
}
