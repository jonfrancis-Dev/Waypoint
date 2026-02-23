using Waypoint.Core.DTOs;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;

namespace Waypoint.Infrastructure.Services;

public class SavingsService : ISavingsService
{
    private readonly ISavingsRepository _repo;
    private readonly ISavingsCalculatorService _calculator;

    public SavingsService(ISavingsRepository repo, ISavingsCalculatorService calculator)
    {
        _repo = repo;
        _calculator = calculator;
    }

    public async Task<SavingsGoal> CreateGoalAsync(CreateSavingsGoalDto dto)
    {
        var goal = new SavingsGoal
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            TargetAmount = dto.TargetAmount,
            CurrentAmount = dto.CurrentAmount,
            TargetDate = dto.TargetDate,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(goal);
        await _repo.SaveChangesAsync();
        return goal;
    }

    public async Task<SavingsGoal> UpdateGoalAsync(Guid id, UpdateSavingsGoalDto dto)
    {
        var goal = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Savings goal {id} not found");

        goal.Name = dto.Name;
        goal.TargetAmount = dto.TargetAmount;
        goal.CurrentAmount = dto.CurrentAmount;
        goal.TargetDate = dto.TargetDate;

        await _repo.SaveChangesAsync();
        return goal;
    }

    public async Task<SavingsGoal?> GetGoalAsync(Guid id)
    {
        return await _repo.GetByIdAsync(id);
    }

    public async Task<List<SavingsGoal>> GetAllGoalsAsync()
    {
        return await _repo.GetAllAsync();
    }

    public async Task<bool> DeleteGoalAsync(Guid id)
    {
        var goal = await _repo.GetByIdAsync(id);
        if (goal is null) return false;

        _repo.Delete(goal);
        await _repo.SaveChangesAsync();
        return true;
    }

    public async Task<SavingsContribution> LogContributionAsync(Guid goalId, LogContributionDto dto)
    {
        var goal = await _repo.GetByIdAsync(goalId)
            ?? throw new KeyNotFoundException($"Savings goal {goalId} not found");

        var contribution = new SavingsContribution
        {
            Id = Guid.NewGuid(),
            SavingsGoalId = goalId,
            Amount = dto.Amount,
            ContributedOn = dto.ContributedOn,
            Note = dto.Note
        };

        goal.CurrentAmount += dto.Amount;

        await _repo.AddContributionAsync(contribution);
        await _repo.SaveChangesAsync();
        return contribution;
    }

    public async Task<List<SavingsContribution>> GetContributionHistoryAsync(Guid goalId)
    {
        return await _repo.GetContributionsAsync(goalId);
    }

    public async Task<SavingsGoalProgress> GetGoalProgressAsync(Guid id)
    {
        var goal = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Savings goal {id} not found");

        return await BuildProgress(goal);
    }

    public async Task<List<SavingsGoalProgress>> GetAllGoalProgressAsync()
    {
        var goals = await _repo.GetAllAsync();
        var progressList = new List<SavingsGoalProgress>();
        foreach (var goal in goals)
        {
            progressList.Add(await BuildProgress(goal));
        }
        return progressList;
    }

    public async Task<SavingsSummary> GetSavingsSummaryAsync()
    {
        var goals = await _repo.GetAllAsync();
        var progressList = new List<SavingsGoalProgress>();
        foreach (var goal in goals)
        {
            progressList.Add(await BuildProgress(goal));
        }

        var totalTarget = progressList.Sum(p => p.TargetAmount);
        var totalCurrent = progressList.Sum(p => p.CurrentAmount);

        var nextMilestone = progressList
            .Where(p => p.Status != GoalStatus.Achieved)
            .OrderByDescending(p => p.PercentageComplete)
            .FirstOrDefault();

        return new SavingsSummary
        {
            TotalGoals = progressList.Count,
            ActiveGoals = progressList.Count(p => p.Status != GoalStatus.Achieved),
            AchievedGoals = progressList.Count(p => p.Status == GoalStatus.Achieved),
            TotalTargetAmount = Math.Round(totalTarget, 2),
            TotalCurrentAmount = Math.Round(totalCurrent, 2),
            TotalRemainingAmount = Math.Round(totalTarget - totalCurrent, 2),
            OverallPercentageComplete = totalTarget > 0
                ? Math.Round(totalCurrent / totalTarget * 100, 1)
                : 0,
            Goals = progressList,
            NextMilestone = nextMilestone
        };
    }

    private async Task<SavingsGoalProgress> BuildProgress(SavingsGoal goal)
    {
        var contributions = await _repo.GetContributionsAsync(goal.Id);

        var avgMonthly = CalculateAverageMonthly(contributions, goal.CreatedAt);
        var remaining = Math.Max(0, goal.TargetAmount - goal.CurrentAmount);
        var pctComplete = goal.TargetAmount > 0
            ? Math.Round(goal.CurrentAmount / goal.TargetAmount * 100, 1)
            : 0;

        var monthsRemaining = _calculator.CalculateMonthsRemaining(goal.TargetDate);
        var daysRemaining = Math.Max(0, (goal.TargetDate.Date - DateTime.Today).Days);
        var requiredMonthly = _calculator.CalculateRequiredMonthlyContribution(
            goal.CurrentAmount, goal.TargetAmount, goal.TargetDate);
        var status = _calculator.DetermineGoalStatus(
            goal.CurrentAmount, goal.TargetAmount, goal.TargetDate, avgMonthly);

        // Project completion at average monthly rate
        DateTime projectedDate;
        bool isAchievable;
        if (goal.CurrentAmount >= goal.TargetAmount)
        {
            projectedDate = DateTime.Today;
            isAchievable = true;
        }
        else if (avgMonthly > 0)
        {
            var monthsNeeded = (int)Math.Ceiling((double)(remaining / avgMonthly));
            projectedDate = DateTime.Today.AddMonths(monthsNeeded);
            isAchievable = true;
        }
        else
        {
            projectedDate = DateTime.MaxValue;
            isAchievable = false;
        }

        var statusMessage = status switch
        {
            GoalStatus.Achieved => "Goal achieved! Congratulations!",
            GoalStatus.OnTrack => $"On track to reach your goal by {goal.TargetDate:MMM yyyy}.",
            GoalStatus.AtRisk => $"Slightly behind. Increase contributions by ${requiredMonthly - avgMonthly:F2}/month.",
            GoalStatus.Behind => monthsRemaining <= 0
                ? "Target date has passed. Consider updating your goal."
                : $"Behind schedule. Need ${requiredMonthly:F2}/month to catch up.",
            _ => ""
        };

        return new SavingsGoalProgress
        {
            GoalId = goal.Id,
            Name = goal.Name,
            TargetAmount = goal.TargetAmount,
            CurrentAmount = goal.CurrentAmount,
            RemainingAmount = Math.Round(remaining, 2),
            PercentageComplete = pctComplete,
            TargetDate = goal.TargetDate,
            DaysRemaining = daysRemaining,
            MonthsRemaining = monthsRemaining,
            Status = status,
            RequiredMonthlyContribution = Math.Round(requiredMonthly, 2),
            AverageMonthlyContribution = Math.Round(avgMonthly, 2),
            ProjectedCompletionDate = projectedDate,
            IsAchievable = isAchievable,
            StatusMessage = statusMessage
        };
    }

    private static decimal CalculateAverageMonthly(List<SavingsContribution> contributions, DateTime createdAt)
    {
        if (contributions.Count == 0) return 0;

        var totalContributed = contributions.Sum(c => c.Amount);
        var monthsActive = Math.Max(1,
            (DateTime.Today.Year - createdAt.Year) * 12 + (DateTime.Today.Month - createdAt.Month));

        return Math.Round(totalContributed / monthsActive, 2);
    }
}
