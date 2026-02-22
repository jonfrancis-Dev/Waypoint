import { Component, inject, signal, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TransactionService } from '../services/transaction.service';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  imports: [
    CurrencyPipe, DatePipe, FormsModule,
    MatTableModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Transactions</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="filters">
          <mat-form-field>
            <mat-label>Month</mat-label>
            <mat-select [(value)]="selectedMonth">
              @for (m of months; track m.value) {
                <mat-option [value]="m.value">{{ m.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Year</mat-label>
            <mat-select [(value)]="selectedYear">
              @for (y of years; track y) {
                <mat-option [value]="y">{{ y }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="loadTransactions()">
            Load
          </button>
        </div>

        @if (transactions().length > 0) {
          <table mat-table [dataSource]="transactions()" class="mat-elevation-z2">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let t">{{ t.date | date:'shortDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let t">{{ t.description }}</td>
            </ng-container>
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let t">{{ t.category }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let t"
                  [class.debit]="t.isDebit"
                  [class.credit]="!t.isDebit">
                {{ t.isDebit ? '-' : '+' }}{{ t.amount | currency }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        } @else {
          <p>No transactions found for the selected period.</p>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .filters { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
    table { width: 100%; }
    .debit { color: #d32f2f; }
    .credit { color: #2e7d32; }
  `],
})
export class TransactionListComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);

  transactions = signal<Transaction[]>([]);
  displayedColumns = ['date', 'description', 'category', 'amount'];

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
  }));

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.getTransactions(this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (data) => this.transactions.set(data),
        error: (err) => console.error('Failed to load transactions', err),
      });
  }
}
