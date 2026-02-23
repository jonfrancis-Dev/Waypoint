namespace Waypoint.Core.DTOs;

// Request DTOs
public record CreateSavingsGoalDto(string Name, decimal TargetAmount, decimal CurrentAmount, DateTime TargetDate);
public record UpdateSavingsGoalDto(string Name, decimal TargetAmount, decimal CurrentAmount, DateTime TargetDate);
public record LogContributionDto(decimal Amount, DateTime ContributedOn, string? Note);

// Response DTOs
public record SavingsGoalProgress
{
    public Guid GoalId { get; init; }
    public string Name { get; init; } = string.Empty;
    public decimal TargetAmount { get; init; }
    public decimal CurrentAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public decimal PercentageComplete { get; init; }
    public DateTime TargetDate { get; init; }
    public int DaysRemaining { get; init; }
    public int MonthsRemaining { get; init; }
    public GoalStatus Status { get; init; }
    public decimal RequiredMonthlyContribution { get; init; }
    public decimal AverageMonthlyContribution { get; init; }
    public DateTime ProjectedCompletionDate { get; init; }
    public bool IsAchievable { get; init; }
    public string StatusMessage { get; init; } = string.Empty;
}

public enum GoalStatus
{
    OnTrack,
    AtRisk,
    Behind,
    Achieved
}

public record SavingsProjection
{
    public List<SavingsProjectionMonth> Schedule { get; init; } = [];
    public DateTime ProjectedCompletionDate { get; init; }
    public int MonthsToCompletion { get; init; }
    public decimal TotalContributions { get; init; }
    public bool WillMeetTargetDate { get; init; }
}

public record SavingsProjectionMonth
{
    public int MonthNumber { get; init; }
    public int Month { get; init; }
    public int Year { get; init; }
    public decimal OpeningBalance { get; init; }
    public decimal ContributionMade { get; init; }
    public decimal ClosingBalance { get; init; }
    public decimal PercentageComplete { get; init; }
}

public record SavingsSummary
{
    public int TotalGoals { get; init; }
    public int ActiveGoals { get; init; }
    public int AchievedGoals { get; init; }
    public decimal TotalTargetAmount { get; init; }
    public decimal TotalCurrentAmount { get; init; }
    public decimal TotalRemainingAmount { get; init; }
    public decimal OverallPercentageComplete { get; init; }
    public List<SavingsGoalProgress> Goals { get; init; } = [];
    public SavingsGoalProgress? NextMilestone { get; init; }
}

public record SavingsRecommendation
{
    public Guid GoalId { get; init; }
    public string GoalName { get; init; } = string.Empty;
    public RecommendationType Type { get; init; }
    public decimal SuggestedMonthlyAmount { get; init; }
    public string Reasoning { get; init; } = string.Empty;
    public decimal Impact { get; init; }
}

public enum RecommendationType
{
    IncreaseContribution,
    ExtendTargetDate,
    ReduceTargetAmount,
    OnTrack,
    PrioritizeThisGoal,
    ConsiderPausingForDebt
}
