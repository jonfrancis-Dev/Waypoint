using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface ICreditCardRepository
{
    Task<List<CreditCard>> GetAllAsync();
    Task<CreditCard?> GetByIdAsync(Guid id);
    Task<CreditCard?> GetByIdWithRelatedAsync(Guid id);
    Task AddAsync(CreditCard creditCard);
    void Delete(CreditCard creditCard);
    Task AddPaymentAsync(CreditCardPayment payment);
    Task<List<CreditCardPayment>> GetPaymentsAsync(Guid cardId);
    Task AddStatementAsync(CreditCardStatement statement);
    Task<List<CreditCardStatement>> GetStatementsAsync(Guid cardId);
    Task SaveChangesAsync();
}
