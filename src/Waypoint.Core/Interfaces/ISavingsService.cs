using Waypoint.Core.DTOs;
using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface ISavingsService
{
    Task<SavingsGoal> CreateGoalAsync(CreateSavingsGoalDto dto);
    Task<SavingsGoal> UpdateGoalAsync(Guid id, UpdateSavingsGoalDto dto);
    Task<SavingsGoal?> GetGoalAsync(Guid id);
    Task<List<SavingsGoal>> GetAllGoalsAsync();
    Task<bool> DeleteGoalAsync(Guid id);

    Task<SavingsContribution> LogContributionAsync(Guid goalId, LogContributionDto dto);
    Task<List<SavingsContribution>> GetContributionHistoryAsync(Guid goalId);

    Task<SavingsGoalProgress> GetGoalProgressAsync(Guid id);
    Task<List<SavingsGoalProgress>> GetAllGoalProgressAsync();
    Task<SavingsSummary> GetSavingsSummaryAsync();
}
