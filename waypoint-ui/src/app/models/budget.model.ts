export interface BudgetLineItem {
  categoryName: string;
  limitAmount: number;
}

export interface BudgetPlan {
  id: string;
  month: number;
  year: number;
  createdAt: string;
  lineItems: BudgetLineItem[];
}

export interface BudgetCategorySummary {
  categoryName: string;
  budgeted: number;
  actual: number;
  variance: number;
  percentUsed: number;
}

export interface BudgetSummary {
  planId: string;
  month: number;
  year: number;
  totalBudgeted: number;
  totalSpent: number;
  categories: BudgetCategorySummary[];
}
