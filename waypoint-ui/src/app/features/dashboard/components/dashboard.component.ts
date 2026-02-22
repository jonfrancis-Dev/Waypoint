import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { DashboardService } from '../services/dashboard.service';
import { FinanceStateService } from '../../../shared/services/finance-state.service';
import { DashboardSummary } from '../../../models/dashboard.model';
import { MonthlySummaryCardComponent } from './monthly-summary-card.component';
import { SpendingChartComponent } from './spending-chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe, DatePipe, FormsModule,
    MatCardModule, MatFormFieldModule, MatSelectModule, MatTableModule,
    MonthlySummaryCardComponent, SpendingChartComponent,
  ],
  template: `
    <h2>Dashboard</h2>

    <div class="controls">
      <mat-form-field>
        <mat-label>Month</mat-label>
        <mat-select [(value)]="selectedMonth" (selectionChange)="onMonthYearChange()">
          @for (m of months; track m.value) {
            <mat-option [value]="m.value">{{ m.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Year</mat-label>
        <mat-select [(value)]="selectedYear" (selectionChange)="onMonthYearChange()">
          @for (y of years; track y) {
            <mat-option [value]="y">{{ y }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    @if (summary) {
      <app-monthly-summary-card
        [totalIncome]="summary.totalIncome"
        [totalSpending]="summary.totalSpending"
        [netAmount]="summary.netAmount" />

      <div class="dashboard-grid">
        <mat-card>
          <mat-card-header><mat-card-title>Spending by Category</mat-card-title></mat-card-header>
          <mat-card-content>
            <app-spending-chart [categories]="summary.spendingByCategory" />
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Top 5 Transactions</mat-card-title></mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="summary.topTransactions" class="full-width">
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
                <td mat-cell *matCellDef="let t">{{ t.amount | currency }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>

      @if (summary.budgetComparisons) {
        <mat-card class="budget-comparison">
          <mat-card-header><mat-card-title>Budget vs Actual</mat-card-title></mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="summary.budgetComparisons" class="full-width">
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let b">{{ b.categoryName }}</td>
              </ng-container>
              <ng-container matColumnDef="budgeted">
                <th mat-header-cell *matHeaderCellDef>Budgeted</th>
                <td mat-cell *matCellDef="let b">{{ b.budgeted | currency }}</td>
              </ng-container>
              <ng-container matColumnDef="actual">
                <th mat-header-cell *matHeaderCellDef>Actual</th>
                <td mat-cell *matCellDef="let b">{{ b.actual | currency }}</td>
              </ng-container>
              <ng-container matColumnDef="difference">
                <th mat-header-cell *matHeaderCellDef>Difference</th>
                <td mat-cell *matCellDef="let b"
                    [class.positive]="b.budgeted - b.actual >= 0"
                    [class.negative]="b.budgeted - b.actual < 0">
                  {{ b.budgeted - b.actual | currency }}
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="budgetColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: budgetColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    }
  `,
  styles: [`
    .controls { display: flex; gap: 16px; margin-bottom: 16px; }
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .full-width { width: 100%; }
    .budget-comparison { margin-top: 24px; }
    .positive { color: #2e7d32; }
    .negative { color: #c62828; }
  `],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly stateService = inject(FinanceStateService);
  private readonly destroy$ = new Subject<void>();

  summary: DashboardSummary | null = null;
  selectedMonth: number;
  selectedYear: number;
  displayedColumns = ['date', 'description', 'category', 'amount'];
  budgetColumns = ['category', 'budgeted', 'actual', 'difference'];

  months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
  }));
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  constructor() {
    const current = this.stateService.getValue();
    this.selectedMonth = current.month;
    this.selectedYear = current.year;
  }

  ngOnInit() {
    this.stateService.getSelectedMonthYear()
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({ month, year }) =>
          this.dashboardService.getDashboardSummary(month, year)),
      )
      .subscribe(summary => this.summary = summary);
  }

  onMonthYearChange() {
    this.stateService.setSelectedMonthYear(this.selectedMonth, this.selectedYear);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
