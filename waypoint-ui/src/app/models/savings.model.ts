export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
}

export interface CreateSavingsGoalDto {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface UpdateSavingsGoalDto extends CreateSavingsGoalDto {}

export interface LogContributionDto {
  amount: number;
  contributedOn: string;
  note?: string;
}

export interface SavingsContribution {
  id: string;
  savingsGoalId: string;
  amount: number;
  contributedOn: string;
  note?: string;
}

export type GoalStatus = 'OnTrack' | 'AtRisk' | 'Behind' | 'Achieved';

export interface SavingsGoalProgress {
  goalId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentageComplete: number;
  targetDate: string;
  daysRemaining: number;
  monthsRemaining: number;
  status: GoalStatus;
  requiredMonthlyContribution: number;
  averageMonthlyContribution: number;
  projectedCompletionDate: string;
  isAchievable: boolean;
  statusMessage: string;
}

export interface SavingsProjectionMonth {
  monthNumber: number;
  month: number;
  year: number;
  openingBalance: number;
  contributionMade: number;
  closingBalance: number;
  percentageComplete: number;
}

export interface SavingsProjection {
  schedule: SavingsProjectionMonth[];
  projectedCompletionDate: string;
  monthsToCompletion: number;
  totalContributions: number;
  willMeetTargetDate: boolean;
}

export interface SavingsSummary {
  totalGoals: number;
  activeGoals: number;
  achievedGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalRemainingAmount: number;
  overallPercentageComplete: number;
  goals: SavingsGoalProgress[];
  nextMilestone?: SavingsGoalProgress;
}

export type RecommendationType = 'IncreaseContribution' | 'ExtendTargetDate' | 'ReduceTargetAmount' | 'OnTrack' | 'PrioritizeThisGoal' | 'ConsiderPausingForDebt';

export interface SavingsRecommendation {
  goalId: string;
  goalName: string;
  type: RecommendationType;
  suggestedMonthlyAmount: number;
  reasoning: string;
  impact: number;
}
