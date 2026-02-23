using Waypoint.Core.DTOs;

namespace Waypoint.Core.Interfaces;

public interface IUnifiedDebtService
{
    Task<UnifiedDebtDashboard> GetUnifiedDashboardAsync();
    Task<UnifiedPayoffComparison> GetUnifiedPayoffComparisonAsync(decimal extraMonthlyPayment);
}
