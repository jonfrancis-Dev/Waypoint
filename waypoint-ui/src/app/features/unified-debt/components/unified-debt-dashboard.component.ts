import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { UnifiedDebtService } from '../services/unified-debt.service';
import { UnifiedDebtDashboard } from '../../../models/debt.model';

interface AccountRow {
  id: string;
  name: string;
  type: string;
  balance: number;
  apr: number;
  monthlyPayment: number;
  route: string;
}

@Component({
  selector: 'app-unified-debt-dashboard',
  imports: [
    CurrencyPipe, DecimalPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule,
    BaseChartDirective,
  ],
  template: `
    <h2>Debt Overview</h2>

    @if (dashboard) {
      <div class="summary-cards">
        <mat-card class="cc-card" (click)="goTo('/credit-cards')">
          <mat-card-header>
            <mat-card-title>Credit Cards</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="big-number">{{ dashboard.creditCards.totalBalance | currency }}</div>
            <div class="stat-row">
              <span>{{ dashboard.creditCards.totalCards }} cards</span>
              <span>{{ dashboard.creditCards.overallUtilization | number:'1.1-1' }}% util</span>
            </div>
            <div class="stat-row">
              <span>Min payments: {{ dashboard.creditCards.totalMinimumPayments | currency }}</span>
            </div>
            <div class="stat-row">
              <span>Avg APR: {{ dashboard.creditCards.weightedAverageAPR | number:'1.2-2' }}%</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="debt-card" (click)="goTo('/debts')">
          <mat-card-header>
            <mat-card-title>Other Debts</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="big-number">{{ dashboard.otherDebts.totalBalance | currency }}</div>
            <div class="stat-row">
              <span>{{ dashboard.otherDebts.totalDebts }} debts</span>
              <span>Monthly: {{ dashboard.otherDebts.totalMonthlyPayments | currency }}</span>
            </div>
            <div class="stat-row">
              <span>Avg APR: {{ dashboard.otherDebts.weightedAverageAPR | number:'1.2-2' }}%</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="overall-card">
          <mat-card-header>
            <mat-card-title>Total Debt</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="big-number total">{{ dashboard.overall.totalBalance | currency }}</div>
            <div class="stat-row">
              <span>{{ dashboard.overall.totalAccounts }} accounts</span>
              <span>Monthly: {{ dashboard.overall.totalMonthlyPayments | currency }}</span>
            </div>
            <div class="stat-row">
              <span>Weighted APR: {{ dashboard.overall.weightedAverageAPR | number:'1.2-2' }}%</span>
            </div>
            <div class="stat-row">
              <span>Interest remaining: {{ dashboard.overall.totalInterestRemaining | currency }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="chart-and-actions">
        <mat-card class="chart-card">
          <mat-card-header><mat-card-title>Debt Breakdown</mat-card-title></mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [data]="chartData"
              [options]="chartOptions"
              type="doughnut">
            </canvas>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card">
          <mat-card-content>
            <button mat-flat-button color="primary" class="full-btn" (click)="goTo('/debt-overview/payoff-comparison')">
              <mat-icon>compare_arrows</mat-icon> Payoff Strategy Comparison
            </button>
            <button mat-stroked-button class="full-btn" (click)="goTo('/credit-cards')">
              <mat-icon>credit_card</mat-icon> Manage Credit Cards
            </button>
            <button mat-stroked-button class="full-btn" (click)="goTo('/debts')">
              <mat-icon>account_balance</mat-icon> Manage Debts
            </button>
          </mat-card-content>
        </mat-card>
      </div>

      @if (accountRows.length > 0) {
        <h3>All Accounts</h3>
        <table mat-table [dataSource]="accountRows" class="accounts-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let r">{{ r.name }}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let r">
              <mat-chip size="small" [class]="r.type === 'Credit Card' ? 'cc-chip' : 'debt-chip'">{{ r.type }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="balance">
            <th mat-header-cell *matHeaderCellDef>Balance</th>
            <td mat-cell *matCellDef="let r">{{ r.balance | currency }}</td>
          </ng-container>
          <ng-container matColumnDef="apr">
            <th mat-header-cell *matHeaderCellDef>APR</th>
            <td mat-cell *matCellDef="let r">{{ r.apr }}%</td>
          </ng-container>
          <ng-container matColumnDef="monthlyPayment">
            <th mat-header-cell *matHeaderCellDef>Monthly</th>
            <td mat-cell *matCellDef="let r">{{ r.monthlyPayment | currency }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row" (click)="goTo(row.route)"></tr>
        </table>
      }
    } @else {
      <p class="empty">Loading debt overview...</p>
    }
  `,
  styles: [`
    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .cc-card, .debt-card { cursor: pointer; transition: box-shadow 0.2s; }
    .cc-card:hover, .debt-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .big-number { font-size: 28px; font-weight: 600; margin: 8px 0; }
    .big-number.total { color: #c62828; }
    .stat-row { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 4px; }
    .chart-and-actions { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
    .chart-card canvas { max-height: 300px; }
    .action-card { display: flex; flex-direction: column; }
    .action-card mat-card-content { display: flex; flex-direction: column; gap: 12px; }
    .full-btn { width: 100%; justify-content: flex-start; }
    .accounts-table { width: 100%; }
    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background: #f5f5f5; }
    .cc-chip { background-color: #ffebee !important; color: #c62828 !important; }
    .debt-chip { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .empty { color: #999; font-style: italic; }
  `],
})
export class UnifiedDebtDashboardComponent implements OnInit {
  private readonly svc = inject(UnifiedDebtService);
  private readonly router = inject(Router);

  dashboard: UnifiedDebtDashboard | null = null;
  accountRows: AccountRow[] = [];
  displayedColumns = ['name', 'type', 'balance', 'apr', 'monthlyPayment'];

  chartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'right' } },
  };

  ngOnInit() {
    this.svc.getDashboard().subscribe(d => {
      this.dashboard = d;
      this.buildChart(d);
      this.buildAccountRows(d);
    });
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  private buildChart(d: UnifiedDebtDashboard) {
    const segments: { label: string; value: number; color: string }[] = [];

    if (d.creditCards.totalBalance > 0) {
      segments.push({ label: 'Credit Cards', value: d.creditCards.totalBalance, color: '#f44336' });
    }

    const typeMap: Record<string, { label: string; color: string }> = {
      StudentLoan: { label: 'Student Loans', color: '#2196f3' },
      AutoLoan: { label: 'Auto Loans', color: '#4caf50' },
      PersonalLoan: { label: 'Personal Loans', color: '#ff9800' },
      Medical: { label: 'Medical', color: '#9c27b0' },
      Other: { label: 'Other', color: '#757575' },
    };

    const debtsByType: Record<string, number> = {};
    for (const debt of d.otherDebts.debts) {
      const key = debt.type;
      debtsByType[key] = (debtsByType[key] || 0) + debt.currentBalance;
    }

    for (const [type, balance] of Object.entries(debtsByType)) {
      const info = typeMap[type] || { label: type, color: '#757575' };
      segments.push({ label: info.label, value: balance, color: info.color });
    }

    this.chartData = {
      labels: segments.map(s => s.label),
      datasets: [{
        data: segments.map(s => s.value),
        backgroundColor: segments.map(s => s.color),
      }],
    };
  }

  private buildAccountRows(d: UnifiedDebtDashboard) {
    const rows: AccountRow[] = [];

    for (const card of d.creditCards.cards) {
      rows.push({
        id: card.cardId,
        name: card.name,
        type: 'Credit Card',
        balance: card.currentBalance,
        apr: card.apr,
        monthlyPayment: card.minimumPayment,
        route: `/credit-cards/${card.cardId}/metrics`,
      });
    }

    for (const debt of d.otherDebts.debts) {
      rows.push({
        id: debt.debtId,
        name: debt.name,
        type: this.getDebtTypeLabel(debt.type),
        balance: debt.currentBalance,
        apr: debt.apr,
        monthlyPayment: debt.monthlyPayment,
        route: `/debts/${debt.debtId}/metrics`,
      });
    }

    this.accountRows = rows.sort((a, b) => b.apr - a.apr);
  }

  private getDebtTypeLabel(type: string): string {
    const map: Record<string, string> = {
      PersonalLoan: 'Personal Loan',
      StudentLoan: 'Student Loan',
      AutoLoan: 'Auto Loan',
      Medical: 'Medical',
      Other: 'Other',
    };
    return map[type] || type;
  }
}
