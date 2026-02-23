using Waypoint.Core.DTOs;

namespace Waypoint.Core.Interfaces;

public interface IDebtCalculatorService
{
    DebtPayoffProjection ProjectDebtPayoff(decimal balance, decimal apr, decimal monthlyPayment, int maxMonths = 360);
    decimal CalculateMonthlyInterest(decimal balance, decimal apr);
    decimal CalculateRemainingMonths(decimal balance, decimal apr, decimal monthlyPayment);
    decimal CalculateTotalInterest(decimal balance, decimal apr, decimal monthlyPayment);
    decimal CalculateAmortizedPayment(decimal principal, decimal apr, int months);
}
