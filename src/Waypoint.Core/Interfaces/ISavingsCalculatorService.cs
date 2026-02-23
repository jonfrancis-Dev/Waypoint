using Waypoint.Core.DTOs;
using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface ISavingsCalculatorService
{
    SavingsProjection ProjectGoalCompletion(decimal currentAmount, decimal targetAmount, decimal monthlyContribution, DateTime targetDate);
    decimal CalculateRequiredMonthlyContribution(decimal currentAmount, decimal targetAmount, DateTime targetDate);
    int CalculateMonthsRemaining(DateTime targetDate);
    GoalStatus DetermineGoalStatus(decimal currentAmount, decimal targetAmount, DateTime targetDate, decimal averageMonthlyContribution);
    List<SavingsRecommendation> GenerateRecommendations(List<SavingsGoalProgress> goalProgressList, decimal availableMonthlyIncome, decimal currentDebtPayments);
}
