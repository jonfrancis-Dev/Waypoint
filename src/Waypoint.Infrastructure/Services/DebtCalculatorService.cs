using Waypoint.Core.DTOs;
using Waypoint.Core.Interfaces;

namespace Waypoint.Infrastructure.Services;

public class DebtCalculatorService : IDebtCalculatorService
{
    public decimal CalculateMonthlyInterest(decimal balance, decimal apr)
    {
        if (balance <= 0 || apr <= 0) return 0;
        var monthlyRate = apr / 100m / 12m;
        return Math.Round(balance * monthlyRate, 2);
    }

    public decimal CalculateRemainingMonths(decimal balance, decimal apr, decimal monthlyPayment)
    {
        if (balance <= 0) return 0;
        var projection = ProjectDebtPayoff(balance, apr, monthlyPayment);
        return projection.TotalMonths;
    }

    public decimal CalculateTotalInterest(decimal balance, decimal apr, decimal monthlyPayment)
    {
        if (balance <= 0) return 0;
        var projection = ProjectDebtPayoff(balance, apr, monthlyPayment);
        return projection.TotalInterestPaid;
    }

    public decimal CalculateAmortizedPayment(decimal principal, decimal apr, int months)
    {
        if (principal <= 0 || months <= 0) return 0;
        if (apr == 0) return Math.Round(principal / months, 2);

        var monthlyRate = apr / 100m / 12m;
        var payment = principal * (monthlyRate * (decimal)Math.Pow((double)(1 + monthlyRate), months))
                      / ((decimal)Math.Pow((double)(1 + monthlyRate), months) - 1);
        return Math.Round(payment, 2);
    }

    public DebtPayoffProjection ProjectDebtPayoff(decimal balance, decimal apr, decimal monthlyPayment, int maxMonths = 360)
    {
        var schedule = new List<DebtPayoffMonth>();
        var currentBalance = balance;
        decimal cumulativeInterest = 0;
        var monthNumber = 0;
        var currentDate = DateTime.Today;

        // If payment can't cover interest, it'll never pay off
        var firstMonthInterest = CalculateMonthlyInterest(currentBalance, apr);
        if (monthlyPayment <= firstMonthInterest && apr > 0)
        {
            return new DebtPayoffProjection
            {
                Schedule = [],
                TotalMonths = maxMonths,
                TotalInterestPaid = 0,
                PayoffDate = currentDate.AddMonths(maxMonths),
                TotalPaid = 0
            };
        }

        while (currentBalance > 0.01m && monthNumber < maxMonths)
        {
            monthNumber++;
            currentDate = currentDate.AddMonths(1);

            var openingBalance = currentBalance;
            var monthlyInterest = CalculateMonthlyInterest(currentBalance, apr);
            var payment = Math.Min(monthlyPayment, currentBalance + monthlyInterest);
            var principalApplied = payment - monthlyInterest;
            var closingBalance = Math.Max(0, currentBalance - principalApplied);

            cumulativeInterest += monthlyInterest;

            schedule.Add(new DebtPayoffMonth
            {
                MonthNumber = monthNumber,
                Month = currentDate.Month,
                Year = currentDate.Year,
                OpeningBalance = Math.Round(openingBalance, 2),
                InterestCharged = Math.Round(monthlyInterest, 2),
                PaymentMade = Math.Round(payment, 2),
                PrincipalApplied = Math.Round(principalApplied, 2),
                ClosingBalance = Math.Round(closingBalance, 2),
                CumulativeInterestPaid = Math.Round(cumulativeInterest, 2)
            });

            currentBalance = closingBalance;
        }

        return new DebtPayoffProjection
        {
            Schedule = schedule,
            TotalMonths = monthNumber,
            TotalInterestPaid = Math.Round(cumulativeInterest, 2),
            PayoffDate = currentDate,
            TotalPaid = Math.Round(balance + cumulativeInterest, 2)
        };
    }
}
