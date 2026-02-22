import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CreditCardService } from '../services/credit-card.service';
import { CreditCardMetrics, CreditCardPayment } from '../../../models/credit-card.model';

@Component({
  selector: 'app-credit-card-metrics',
  imports: [
    CurrencyPipe, DatePipe, DecimalPipe,
    MatCardModule, MatButtonModule, MatProgressBarModule,
    MatTableModule, MatChipsModule, MatIconModule,
  ],
  template: `
    @if (metrics) {
      <div class="header">
        <h2>{{ metrics.name }}</h2>
        <mat-chip [class]="metrics.healthStatus.toLowerCase()">
          {{ metrics.healthStatus }}
        </mat-chip>
      </div>

      <div class="metrics-grid">
        <mat-card>
          <mat-card-content>
            <div class="metric-label">Utilization</div>
            <div class="metric-value">{{ metrics.utilizationPercentage | number:'1.1-1' }}%</div>
            <mat-progress-bar
              [value]="metrics.utilizationPercentage"
              [color]="getUtilColor(metrics.utilizationPercentage)">
            </mat-progress-bar>
            <div class="metric-sub">{{ metrics.currentBalance | currency }} / {{ metrics.creditLimit | currency }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="metric-label">Daily Interest</div>
            <div class="metric-value">{{ metrics.dailyInterest | currency }}</div>
            <div class="metric-sub">{{ metrics.apr }}% APR</div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="metric-label">Payoff at Minimum</div>
            <div class="metric-value">{{ metrics.monthsToPayoffAtMinimum }} months</div>
            <div class="metric-sub">Min payment: {{ metrics.minimumPayment | currency }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="metric-label">Total Interest (at minimum)</div>
            <div class="metric-value negative">{{ metrics.totalInterestAtMinimum | currency }}</div>
            <div class="metric-sub">Over the life of the balance</div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="payment-history">
        <mat-card-header><mat-card-title>Payment History</mat-card-title></mat-card-header>
        <mat-card-content>
          @if (payments.length === 0) {
            <p class="empty">No payments recorded yet.</p>
          } @else {
            <table mat-table [dataSource]="payments" class="full-width">
              <ng-container matColumnDef="paidOn">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let p">{{ p.paidOn | date:'shortDate' }}</td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let p">{{ p.amount | currency }}</td>
              </ng-container>
              <ng-container matColumnDef="principal">
                <th mat-header-cell *matHeaderCellDef>Principal</th>
                <td mat-cell *matCellDef="let p">{{ p.principalApplied | currency }}</td>
              </ng-container>
              <ng-container matColumnDef="interest">
                <th mat-header-cell *matHeaderCellDef>Interest</th>
                <td mat-cell *matCellDef="let p">{{ p.interestApplied | currency }}</td>
              </ng-container>
              <ng-container matColumnDef="note">
                <th mat-header-cell *matHeaderCellDef>Note</th>
                <td mat-cell *matCellDef="let p">{{ p.note || '—' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="paymentCols"></tr>
              <tr mat-row *matRowDef="let row; columns: paymentCols;"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>

      <button mat-stroked-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon> Back to Cards
      </button>
    }
  `,
  styles: [`
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .metric-label { font-size: 13px; color: #666; }
    .metric-value { font-size: 22px; font-weight: 500; margin: 4px 0; }
    .metric-sub { font-size: 12px; color: #999; margin-top: 4px; }
    .negative { color: #c62828; }
    .full-width { width: 100%; }
    .payment-history { margin-bottom: 16px; }
    .empty { color: #999; font-style: italic; }
    .good { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .warning { background-color: #fff3e0 !important; color: #e65100 !important; }
    .critical { background-color: #ffebee !important; color: #c62828 !important; }
    @media (max-width: 900px) { .metrics-grid { grid-template-columns: 1fr 1fr; } }
  `],
})
export class CreditCardMetricsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(CreditCardService);

  metrics: CreditCardMetrics | null = null;
  payments: CreditCardPayment[] = [];
  paymentCols = ['paidOn', 'amount', 'principal', 'interest', 'note'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getCardMetrics(id).subscribe(m => this.metrics = m);
    this.svc.getPaymentHistory(id).subscribe(p => this.payments = p);
  }

  getUtilColor(pct: number): 'primary' | 'accent' | 'warn' {
    if (pct <= 30) return 'primary';
    if (pct <= 70) return 'accent';
    return 'warn';
  }

  goBack() {
    this.router.navigate(['/credit-cards']);
  }
}
