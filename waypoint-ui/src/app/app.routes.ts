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
];
