import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Subject, debounceTime } from 'rxjs';
import { DebtService } from '../services/debt.service';
import { Debt, DebtPayoffProjection } from '../../../models/debt.model';

@Component({
  selector: 'app-debt-payoff-calculator',
  imports: [
    CurrencyPipe, DatePipe, FormsModule,
    MatCardModule, MatFormFieldModule, MatSliderModule, MatTableModule,
    MatButtonModule, MatIconModule, BaseChartDirective,
  ],
  template: `
    @if (debt) {
      <h2>{{ debt.name }} — Payoff Calculator</h2>

      <div class="slider-row">
        <mat-label>Monthly Payment: {{ monthlyPayment | currency }}</mat-label>
        <mat-slider [min]="minPayment" [max]="maxPayment" [step]="10" class="full-width">
          <input matSliderThumb [(ngModel)]="monthlyPayment" (ngModelChange)="onPaymentChange($event)">
        </mat-slider>
      </div>

      @if (projection) {
        <div class="summary-cards">
          <mat-card>
            <mat-card-content>
              <div class="stat-label">Payoff Date</div>
              <div class="stat-value">{{ projection.payoffDate | date:'MMM yyyy' }}</div>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <div class="stat-label">Total Months</div>
              <div class="stat-value">{{ projection.totalMonths }}</div>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <div class="stat-label">Total Interest</div>
              <div class="stat-value">{{ projection.totalInterestPaid | currency }}</div>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <div class="stat-label">Total Paid</div>
              <div class="stat-value">{{ projection.totalPaid | currency }}</div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="chart-card">
          <mat-card-content>
            <canvas baseChart
              [data]="chartData"
              [options]="chartOptions"
              type="line">
            </canvas>
          </mat-card-content>
        </mat-card>

        @if (projection.schedule.length > 0) {
          <h3>Amortization Schedule</h3>
          <div class="table-scroll">
            <table mat-table [dataSource]="projection.schedule">
              <ng-container matColumnDef="month">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let r">{{ r.monthNumber }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let r">{{ r.month }}/{{ r.year }}</td>
              </ng-container>
              <ng-container matColumnDef="payment">
                <th mat-header-cell *matHeaderCellDef>Payment</th>
                <td mat-cell *matCellDef="let r">{{ r.paymentMade | currency }}</td>
              </ng-container>
              <ng-container matColumnDef="principal">
                <th mat-header-cell *matHeaderCellDef>Principal</th>
                <td mat-cell *matCellDef="let r">{{ r.principalApplied | currency }}</td>
              </ng-container>
              <ng-container matColumnDef="interest">
                <th mat-header-cell *matHeaderCellDef>Interest</th>
                <td mat-cell *matCellDef="let r">{{ r.interestCharged | currency }}</td>
              </ng-container>
              <ng-container matColumnDef="balance">
                <th mat-header-cell *matHeaderCellDef>Balance</th>
                <td mat-cell *matCellDef="let r">{{ r.closingBalance | currency }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="scheduleColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: scheduleColumns;"></tr>
            </table>
          </div>
        }
      }

      <button mat-stroked-button (click)="goBack()" style="margin-top:16px">
        <mat-icon>arrow_back</mat-icon> Back to Debts
      </button>
    }
  `,
  styles: [`
    .slider-row { margin: 16px 0 24px; }
    .full-width { width: 100%; }
    .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-label { color: #666; font-size: 12px; }
    .stat-value { font-size: 20px; font-weight: 500; }
    .chart-card { margin-bottom: 24px; }
    .table-scroll { max-height: 400px; overflow-y: auto; }
    table { width: 100%; }
  `],
})
export class DebtPayoffCalculatorComponent implements OnInit {
  private readonly svc = inject(DebtService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentChange$ = new Subject<number>();

  debt: Debt | null = null;
  projection: DebtPayoffProjection | null = null;
  monthlyPayment = 0;
  minPayment = 0;
  maxPayment = 2000;
  scheduleColumns = ['month', 'date', 'payment', 'principal', 'interest', 'balance'];

  chartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: v => `$${v}` } },
    },
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getDebt(id).subscribe(d => {
      this.debt = d;
      this.monthlyPayment = d.minimumPayment;
      this.minPayment = Math.max(10, Math.floor(d.minimumPayment * 0.5));
      this.maxPayment = Math.max(2000, Math.ceil(d.minimumPayment * 5));
      this.loadProjection(id, d.minimumPayment);
    });

    this.paymentChange$.pipe(debounceTime(300)).subscribe(amount => {
      if (this.debt) this.loadProjection(this.debt.id, amount);
    });
  }

  onPaymentChange(amount: number) {
    this.paymentChange$.next(amount);
  }

  goBack() {
    this.router.navigate(['/debts']);
  }

  private loadProjection(id: string, payment: number) {
    this.svc.getPayoffProjection(id, payment).subscribe(p => {
      this.projection = p;
      this.updateChart(p);
    });
  }

  private updateChart(p: DebtPayoffProjection) {
    this.chartData = {
      labels: p.schedule.map(s => `${s.month}/${s.year}`),
      datasets: [
        {
          label: 'Balance',
          data: p.schedule.map(s => s.closingBalance),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Cumulative Interest',
          data: p.schedule.map(s => s.cumulativeInterestPaid),
          borderColor: '#f44336',
          borderDash: [5, 5],
          fill: false,
          tension: 0.3,
        },
      ],
    };
  }
}
