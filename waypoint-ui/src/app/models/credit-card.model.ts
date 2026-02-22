export interface CreditCard {
  id: string;
  name: string;
  currentBalance: number;
  creditLimit: number;
  apr: number;
  minimumPayment: number;
  statementClosingDay: number;
  dueDay: number;
  createdAt: string;
}

export interface CreateCreditCardDto {
  name: string;
  creditLimit: number;
  currentBalance: number;
  apr: number;
  statementClosingDay: number;
  dueDay: number;
}

export interface UpdateCreditCardDto extends CreateCreditCardDto {}

export interface LogPaymentDto {
  amount: number;
  paidOn: string;
  note?: string;
}

export interface CreditCardPayment {
  id: string;
  creditCardId: string;
  amount: number;
  principalApplied: number;
  interestApplied: number;
  paidOn: string;
  note?: string;
}

export interface CreditCardStatement {
  id: string;
  creditCardId: string;
  statementMonth: number;
  statementYear: number;
  openingBalance: number;
  closingBalance: number;
  interestCharged: number;
  minimumDue: number;
}

export interface CreditCardMetrics {
  cardId: string;
  name: string;
  currentBalance: number;
  creditLimit: number;
  utilizationPercentage: number;
  apr: number;
  minimumPayment: number;
  dailyInterest: number;
  monthsToPayoffAtMinimum: number;
  totalInterestAtMinimum: number;
  healthStatus: 'Good' | 'Warning' | 'Critical';
}

export interface PayoffMonth {
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

export interface PayoffProjection {
  schedule: PayoffMonth[];
  totalMonths: number;
  totalInterestPaid: number;
  payoffDate: string;
  totalPaid: number;
}

export interface CardPayoffSchedule {
  cardId: string;
  cardName: string;
  schedule: PayoffMonth[];
  payoffDate: string;
}

export interface StrategyResult {
  cardSchedules: CardPayoffSchedule[];
  totalMonths: number;
  totalInterestPaid: number;
  payoffDate: string;
}

export interface ComparisonSummary {
  interestSaved: number;
  monthsSaved: number;
  recommendation: string;
}

export interface MultiCardPayoffComparison {
  recommendedStrategy: 'Avalanche' | 'Snowball';
  avalanche: StrategyResult;
  snowball: StrategyResult;
  summary: ComparisonSummary;
}
