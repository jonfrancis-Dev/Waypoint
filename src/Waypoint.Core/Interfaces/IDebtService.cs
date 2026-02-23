using Waypoint.Core.DTOs;
using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface IDebtService
{
    Task<Debt> CreateDebtAsync(CreateDebtDto dto);
    Task<Debt> UpdateDebtAsync(Guid id, UpdateDebtDto dto);
    Task<Debt?> GetDebtAsync(Guid id);
    Task<List<Debt>> GetAllDebtsAsync();
    Task<bool> DeleteDebtAsync(Guid id);

    Task<DebtPayment> LogPaymentAsync(Guid debtId, LogDebtPaymentDto dto);
    Task<List<DebtPayment>> GetPaymentHistoryAsync(Guid debtId);

    Task<DebtMetrics> GetDebtMetricsAsync(Guid id);
    Task<List<DebtMetrics>> GetAllDebtMetricsAsync();
    Task<DebtSummary> GetDebtSummaryAsync();
}
