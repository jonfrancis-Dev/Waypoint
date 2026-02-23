import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/components/dashboard.component')
        .then(m => m.DashboardComponent),
  },
  {
    path: 'transactions',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/transactions/components/transaction-list.component')
            .then(m => m.TransactionListComponent),
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('./features/transactions/components/transaction-upload.component')
            .then(m => m.TransactionUploadComponent),
      },
    ],
  },
  {
    path: 'budget',
    loadComponent: () =>
      import('./features/budget/components/budget-planner.component')
        .then(m => m.BudgetPlannerComponent),
  },
  {
    path: 'credit-cards',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/credit-cards/components/credit-card-list.component')
            .then(m => m.CreditCardListComponent),
      },
      {
        path: 'compare',
        loadComponent: () =>
          import('./features/credit-cards/components/payoff-comparison.component')
            .then(m => m.PayoffComparisonComponent),
      },
      {
        path: ':id/metrics',
        loadComponent: () =>
          import('./features/credit-cards/components/credit-card-metrics.component')
            .then(m => m.CreditCardMetricsComponent),
      },
      {
        path: ':id/payoff',
        loadComponent: () =>
          import('./features/credit-cards/components/payoff-calculator.component')
            .then(m => m.PayoffCalculatorComponent),
      },
    ],
  },
  {
    path: 'debts',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/debts/components/debt-list.component')
            .then(m => m.DebtListComponent),
      },
      {
        path: ':id/metrics',
        loadComponent: () =>
          import('./features/debts/components/debt-metrics.component')
            .then(m => m.DebtMetricsComponent),
      },
      {
        path: ':id/payoff',
        loadComponent: () =>
          import('./features/debts/components/debt-payoff-calculator.component')
            .then(m => m.DebtPayoffCalculatorComponent),
      },
    ],
  },
  {
    path: 'debt-overview',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/unified-debt/components/unified-debt-dashboard.component')
            .then(m => m.UnifiedDebtDashboardComponent),
      },
      {
        path: 'payoff-comparison',
        loadComponent: () =>
          import('./features/unified-debt/components/unified-payoff-comparison.component')
            .then(m => m.UnifiedPayoffComparisonComponent),
      },
    ],
  },
  {
    path: 'savings',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/savings/components/savings-dashboard.component')
            .then(m => m.SavingsDashboardComponent),
      },
      {
        path: 'recommendations',
        loadComponent: () =>
          import('./features/savings/components/savings-recommendations.component')
            .then(m => m.SavingsRecommendationsComponent),
      },
      {
        path: ':id/details',
        loadComponent: () =>
          import('./features/savings/components/savings-projection-chart.component')
            .then(m => m.SavingsProjectionChartComponent),
      },
    ],
  },
];
