using Waypoint.Core.DTOs;
using Waypoint.Core.Interfaces;

namespace Waypoint.Infrastructure.Services;

public class SavingsCalculatorService : ISavingsCalculatorService
{
    public int CalculateMonthsRemaining(DateTime targetDate)
    {
        var today = DateTime.Today;
        int months = (targetDate.Year - today.Year) * 12 + (targetDate.Month - today.Month);
        return Math.Max(0, months);
    }

    public decimal CalculateRequiredMonthlyContribution(decimal currentAmount, decimal targetAmount, DateTime targetDate)
    {
        int monthsRemaining = CalculateMonthsRemaining(targetDate);
        if (monthsRemaining <= 0) return 0;

        var remaining = targetAmount - currentAmount;
        return Math.Max(0, Math.Round(remaining / monthsRemaining, 2));
    }

    public SavingsProjection ProjectGoalCompletion(decimal currentAmount, decimal targetAmount, decimal monthlyContribution, DateTime targetDate)
    {
        var schedule = new List<SavingsProjectionMonth>();
        var balance = currentAmount;
        var monthNumber = 0;
        var currentDate = DateTime.Today;

        if (monthlyContribution <= 0 || currentAmount >= targetAmount)
        {
            return new SavingsProjection
            {
                Schedule = [],
                ProjectedCompletionDate = currentAmount >= targetAmount ? DateTime.Today : DateTime.MaxValue,
                MonthsToCompletion = 0,
                TotalContributions = 0,
                WillMeetTargetDate = currentAmount >= targetAmount
            };
        }

        while (balance < targetAmount && monthNumber < 600)
        {
            monthNumber++;
            currentDate = currentDate.AddMonths(1);

            var openingBalance = balance;
            var contribution = monthlyContribution;
            var closingBalance = balance + contribution;

            schedule.Add(new SavingsProjectionMonth
            {
                MonthNumber = monthNumber,
                Month = currentDate.Month,
                Year = currentDate.Year,
                OpeningBalance = Math.Round(openingBalance, 2),
                ContributionMade = Math.Round(contribution, 2),
                ClosingBalance = Math.Round(closingBalance, 2),
                PercentageComplete = Math.Round(Math.Min(100, closingBalance / targetAmount * 100), 1)
            });

            balance = closingBalance;
        }

        return new SavingsProjection
        {
            Schedule = schedule,
            ProjectedCompletionDate = currentDate,
            MonthsToCompletion = monthNumber,
            TotalContributions = Math.Round(monthlyContribution * monthNumber, 2),
            WillMeetTargetDate = currentDate <= targetDate
        };
    }

    public GoalStatus DetermineGoalStatus(decimal currentAmount, decimal targetAmount, DateTime targetDate, decimal averageMonthlyContribution)
    {
        if (currentAmount >= targetAmount)
            return GoalStatus.Achieved;

        int monthsRemaining = CalculateMonthsRemaining(targetDate);
        var requiredMonthly = CalculateRequiredMonthlyContribution(currentAmount, targetAmount, targetDate);

        if (monthsRemaining <= 0)
            return GoalStatus.Behind;

        if (averageMonthlyContribution >= requiredMonthly)
            return GoalStatus.OnTrack;

        var shortfall = requiredMonthly - averageMonthlyContribution;
        var shortfallPercentage = requiredMonthly > 0 ? (shortfall / requiredMonthly) * 100 : 100;

        if (shortfallPercentage < 20)
            return GoalStatus.AtRisk;

        return GoalStatus.Behind;
    }

    public List<SavingsRecommendation> GenerateRecommendations(List<SavingsGoalProgress> goalProgressList, decimal availableMonthlyIncome, decimal currentDebtPayments)
    {
        var recommendations = new List<SavingsRecommendation>();

        foreach (var progress in goalProgressList.Where(p => p.Status != GoalStatus.Achieved))
        {
            switch (progress.Status)
            {
                case GoalStatus.Behind:
                    if (currentDebtPayments > availableMonthlyIncome * 0.3m)
                    {
                        recommendations.Add(new SavingsRecommendation
                        {
                            GoalId = progress.GoalId,
                            GoalName = progress.Name,
                            Type = RecommendationType.ConsiderPausingForDebt,
                            SuggestedMonthlyAmount = 0,
                            Reasoning = "Your debt payments are high. Consider focusing on debt reduction before aggressive savings.",
                            Impact = 0
                        });
                    }
                    else
                    {
                        recommendations.Add(new SavingsRecommendation
                        {
                            GoalId = progress.GoalId,
                            GoalName = progress.Name,
                            Type = RecommendationType.IncreaseContribution,
                            SuggestedMonthlyAmount = progress.RequiredMonthlyContribution,
                            Reasoning = $"Increase to ${progress.RequiredMonthlyContribution:F2}/month to meet your target date.",
                            Impact = progress.MonthsRemaining
                        });
                    }
                    break;

                case GoalStatus.AtRisk:
                    var increase = progress.RequiredMonthlyContribution - progress.AverageMonthlyContribution;
                    recommendations.Add(new SavingsRecommendation
                    {
                        GoalId = progress.GoalId,
                        GoalName = progress.Name,
                        Type = RecommendationType.IncreaseContribution,
                        SuggestedMonthlyAmount = progress.RequiredMonthlyContribution,
                        Reasoning = $"Slightly behind. Add ${increase:F2}/month to stay on track.",
                        Impact = increase
                    });
                    break;

                case GoalStatus.OnTrack:
                    recommendations.Add(new SavingsRecommendation
                    {
                        GoalId = progress.GoalId,
                        GoalName = progress.Name,
                        Type = RecommendationType.OnTrack,
                        SuggestedMonthlyAmount = progress.AverageMonthlyContribution,
                        Reasoning = "You're on track! Keep up the current pace.",
                        Impact = 0
                    });
                    break;
            }
        }

        return recommendations;
    }
}
