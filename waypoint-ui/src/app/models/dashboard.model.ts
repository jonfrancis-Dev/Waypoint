export interface CategorySpending {
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface TopTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

export interface BudgetComparison {
  categoryName: string;
  budgeted: number;
  actual: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalSpending: number;
  netAmount: number;
  spendingByCategory: CategorySpending[];
  topTransactions: TopTransaction[];
  budgetComparisons: BudgetComparison[] | null;
}

export interface MonthlyTrend {
  month: number;
  year: number;
  categoryAmounts: Record<string, number>;
  total: number;
}
