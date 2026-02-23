import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DebtService } from '../services/debt.service';
import { DebtMetrics, DebtPayment, DebtType } from '../../../models/debt.model';

@Component({
  selector: 'app-debt-metrics',
  imports: [
    CurrencyPipe, DatePipe, DecimalPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressBarModule,
  ],
  template: `
    @if (metrics) {
      <h2>{{ metrics.name }} — Details</h2>

      <div class="metrics-grid">
        <mat-card>
          <mat-card-content>
            <div class="gauge-section">
              <div class="gauge-label">Progress</div>
              <div class="gauge-value">{{ metrics.percentagePaid | number:'1.1-1' }}% paid</div>
              <mat-progress-bar [value]="metrics.percentagePaid" color="primary"></mat-progress-bar>
              <div class="gauge-details">
                {{ metrics.currentBalance | currency }} remaining of {{ metrics.originalBalance | currency }}
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="stat-grid">
              <div class="stat">
                <span class="stat-label">APR</span>
                <span class="stat-value">{{ metrics.apr }}%</span>
              </div>
              <div class="stat">
                <span class="stat-label">Monthly Payment</span>
                <span class="stat-value">{{ metrics.monthlyPayment | currency }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Monthly Interest</span>
                <span class="stat-value">{{ metrics.monthlyInterest | currency }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Months Remaining</span>
                <span class="stat-value">{{ metrics.monthsRemaining }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Total Interest Remaining</span>
                <span class="stat-value">{{ metrics.totalInterestRemaining | currency }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Est. Payoff Date</span>
                <span class="stat-value">{{ metrics.estimatedPayoffDate | date:'MMM yyyy' }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Total Paid</span>
                <span class="stat-value">{{ metrics.totalPaid | currency }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Type</span>
                <span class="stat-value">{{ getTypeLabel(metrics.type) }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      @if (payments.length > 0) {
        <h3>Payment History</h3>
        <table mat-table [dataSource]="payments" class="payment-table">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let p">{{ p.paidOn | date:'mediumDate' }}</td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let p">{{ p.amount | currency }}</td>
          </ng-container>
          <ng-container matColumnDef="note">
            <th mat-header-cell *matHeaderCellDef>Note</th>
            <td mat-cell *matCellDef="let p">{{ p.note || '—' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      } @else {
        <p class="empty">No payments logged yet.</p>
      }

      <button mat-stroked-button (click)="goBack()" style="margin-top:16px">
        <mat-icon>arrow_back</mat-icon> Back to Debts
      </button>
    }
  `,
  styles: [`
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .gauge-section { text-align: center; }
    .gauge-label { color: #666; font-size: 13px; }
    .gauge-value { font-size: 28px; font-weight: 500; margin: 8px 0; }
    .gauge-details { margin-top: 8px; color: #666; font-size: 13px; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .stat { display: flex; flex-direction: column; padding: 8px; }
    .stat-label { color: #666; font-size: 12px; }
    .stat-value { font-weight: 500; font-size: 15px; }
    .payment-table { width: 100%; }
    .empty { color: #999; font-style: italic; }
  `],
})
export class DebtMetricsComponent implements OnInit {
  private readonly svc = inject(DebtService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  metrics: DebtMetrics | null = null;
  payments: DebtPayment[] = [];
  displayedColumns = ['date', 'amount', 'note'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getDebtMetrics(id).subscribe(m => this.metrics = m);
    this.svc.getPaymentHistory(id).subscribe(p => this.payments = p);
  }

  getTypeLabel(type: DebtType): string {
    const map: Record<DebtType, string> = {
      PersonalLoan: 'Personal Loan',
      StudentLoan: 'Student Loan',
      AutoLoan: 'Auto Loan',
      Medical: 'Medical',
      Other: 'Other',
    };
    return map[type] || type;
  }

  goBack() {
    this.router.navigate(['/debts']);
  }
}
