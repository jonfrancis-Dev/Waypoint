using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface IDebtRepository
{
    Task<List<Debt>> GetAllAsync();
    Task<Debt?> GetByIdAsync(Guid id);
    Task AddAsync(Debt debt);
    void Delete(Debt debt);
    Task AddPaymentAsync(DebtPayment payment);
    Task<List<DebtPayment>> GetPaymentsAsync(Guid debtId);
    Task SaveChangesAsync();
}
