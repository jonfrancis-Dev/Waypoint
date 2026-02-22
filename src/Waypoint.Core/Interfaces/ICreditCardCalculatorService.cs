using Waypoint.Core.DTOs;
using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface ICreditCardCalculatorService
{
    PayoffProjection ProjectSingleCardPayoff(decimal balance, decimal apr, decimal monthlyPayment, int maxMonths = 360);
    MultiCardPayoffComparison ProjectMultiCardPayoff(List<CreditCard> cards, decimal extraMonthlyPayment);
    decimal CalculateDailyInterest(decimal balance, decimal apr);
    decimal CalculateMinimumPayment(decimal balance);
    int CalculateMonthsToPayoff(decimal balance, decimal apr, decimal monthlyPayment);
    decimal CalculateTotalInterest(decimal balance, decimal apr, decimal monthlyPayment);
}
