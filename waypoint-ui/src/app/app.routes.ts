import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'transactions', pathMatch: 'full' },
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
];
