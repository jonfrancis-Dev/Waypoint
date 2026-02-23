export interface Debt {
  id: string;
  name: string;
  debtType: DebtType;
  originalBalance: number;
  currentBalance: number;
  apr: number;
  minimumPayment: number;
  startDate: string;
  createdAt: string;
}

export type DebtType = 'PersonalLoan' | 'StudentLoan' | 'AutoLoan' | 'Medical' | 'Other';

export interface CreateDebtDto {
  name: string;
  debtType: DebtType;
  originalBalance: number;
  currentBalance: number;
  apr: number;
  minimumPayment: number;
  startDate: string;
}

export interface UpdateDebtDto extends CreateDebtDto {}

export interface LogDebtPaymentDto {
  amount: number;
  paidOn: string;
  note?: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  paidOn: string;
  note?: string;
}

export interface DebtMetrics {
  debtId: string;
  name: string;
  type: DebtType;
  currentBalance: number;
  originalBalance: number;
  percentagePaid: number;
  apr: number;
  monthlyPayment: number;
  monthlyInterest: number;
  monthsRemaining: number;
  totalInterestRemaining: number;
  estimatedPayoffDate: string;
  totalPaid: number;
}

export interface DebtPayoffMonth {
  monthNumber: number;
  month: number;
  year: number;
  openingBalance: number;
  interestCharged: number;
  paymentMade: number;
  principalApplied: number;
  closingBalance: number;
  cumulativeInterestPaid: number;
}

export interface DebtPayoffProjection {
  schedule: DebtPayoffMonth[];
  totalMonths: number;
  totalInterestPaid: number;
  payoffDate: string;
  totalPaid: number;
}

export interface DebtSummary {
  totalDebts: number;
  totalBalance: number;
  totalMonthlyPayments: number;
  weightedAverageAPR: number;
  totalInterestRemaining: number;
  debts: DebtMetrics[];
}

export interface CreditCardSummary {
  totalCards: number;
  totalBalance: number;
  totalCreditLimit: number;
  overallUtilization: number;
  totalMinimumPayments: number;
  weightedAverageAPR: number;
  cards: import('./credit-card.model').CreditCardMetrics[];
}

export interface OverallDebtSummary {
  totalAccounts: number;
  totalBalance: number;
  totalMonthlyPayments: number;
  weightedAverageAPR: number;
  totalInterestRemaining: number;
  debtToIncomeRatio: number;
}

export interface UnifiedDebtDashboard {
  creditCards: CreditCardSummary;
  otherDebts: DebtSummary;
  overall: OverallDebtSummary;
}

export type AccountType = 'CreditCard' | 'Debt';

export interface AccountPayoffSchedule {
  accountId: string;
  accountName: string;
  type: AccountType;
  schedule: DebtPayoffMonth[];
  payoffDate: string;
}

export interface UnifiedStrategyResult {
  accountSchedules: AccountPayoffSchedule[];
  totalMonths: number;
  totalInterestPaid: number;
  payoffDate: string;
}

export interface UnifiedPayoffComparison {
  recommendedStrategy: 'Avalanche' | 'Snowball';
  avalanche: UnifiedStrategyResult;
  snowball: UnifiedStrategyResult;
  summary: import('./credit-card.model').ComparisonSummary;
}
