import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Subject, debounceTime } from 'rxjs';
import { CreditCardService } from '../services/credit-card.service';
import { CreditCard, PayoffProjection } from '../../../models/credit-card.model';

@Component({
  selector: 'app-payoff-calculator',
  imports: [
    CurrencyPipe, DatePipe, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSliderModule,
    MatButtonModule, MatExpansionModule, MatTableModule, MatIconModule,
    BaseChartDirective,
  ],
  template: `
    @if (card) {
      <h2>Payoff Calculator — {{ card.name }}</h2>
      <p>Balance: {{ card.currentBalance | currency }} | APR: {{ card.apr }}%</p>

      <div class="slider-row">
        <mat-label>Monthly Payment: {{ monthlyPayment | currency }}</mat-label>
        <mat-slider min="25" [max]="card.currentBalance" step="25" class="full-width">
          <input matSliderThumb [(ngModel)]="monthlyPayment" (ngModelChange)="onPaymentChange($event)">
        </mat-slider>
      </div>

      @if (projection) {
        <div class="summary-cards">
          <mat-card>
            <mat-card-content>
              <div class="label">Months to Payoff</div>
              <div class="value">{{ projection.totalMonths }}</div>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <div class="label">Total Interest</div>
              <div class="value negative">{{ projection.totalInterestPaid | currency }}</div>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <div class="label">Payoff Date</div>
              <div class="value">{{ projection.payoffDate | date:'MMM yyyy' }}</div>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <div class="label">Total Paid</div>
              <div class="value">{{ projection.totalPaid | currency }}</div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="chart-card">
          <mat-card-content>
            <canvas baseChart [data]="chartData" [options]="chartOptions" type="line"></canvas>
          </mat-card-content>
        </mat-card>

        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>Month-by-Month Schedule ({{ projection.schedule.length }} months)</mat-panel-title>
          </mat-expansion-panel-header>
          <table mat-table [dataSource]="projection.schedule" class="full-width">
            <ng-container matColumnDef="monthNumber">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let r">{{ r.monthNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="opening">
              <th mat-header-cell *matHeaderCellDef>Opening</th>
              <td mat-cell *matCellDef="let r">{{ r.openingBalance | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="interest">
              <th mat-header-cell *matHeaderCellDef>Interest</th>
              <td mat-cell *matCellDef="let r">{{ r.interestCharged | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="payment">
              <th mat-header-cell *matHeaderCellDef>Payment</th>
              <td mat-cell *matCellDef="let r">{{ r.paymentMade | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="principal">
              <th mat-header-cell *matHeaderCellDef>Principal</th>
              <td mat-cell *matCellDef="let r">{{ r.principalApplied | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="closing">
              <th mat-header-cell *matHeaderCellDef>Closing</th>
              <td mat-cell *matCellDef="let r">{{ r.closingBalance | currency }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="scheduleCols"></tr>
            <tr mat-row *matRowDef="let row; columns: scheduleCols;"></tr>
          </table>
        </mat-expansion-panel>
      }

      <button mat-stroked-button (click)="goBack()" style="margin-top:16px">
        <mat-icon>arrow_back</mat-icon> Back to Cards
      </button>
    }
  `,
  styles: [`
    .slider-row { margin: 16px 0 24px; }
    .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .label { font-size: 13px; color: #666; }
    .value { font-size: 22px; font-weight: 500; margin-top: 4px; }
    .negative { color: #c62828; }
    .chart-card { margin-bottom: 24px; }
    .full-width { width: 100%; }
  `],
})
export class PayoffCalculatorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(CreditCardService);
  private readonly paymentChange$ = new Subject<number>();

  card: CreditCard | null = null;
  projection: PayoffProjection | null = null;
  monthlyPayment = 100;
  scheduleCols = ['monthNumber', 'opening', 'interest', 'payment', 'principal', 'closing'];

  chartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => '$' + v } } },
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getCard(id).subscribe(card => {
      this.card = card;
      this.monthlyPayment = Math.max(50, Math.round(card.currentBalance * 0.03));
      this.loadProjection(id, this.monthlyPayment);
    });

    this.paymentChange$.pipe(debounceTime(300)).subscribe(amount => {
      if (this.card) this.loadProjection(this.card.id, amount);
    });
  }

  onPaymentChange(amount: number) {
    this.paymentChange$.next(amount);
  }

  private loadProjection(cardId: string, amount: number) {
    this.svc.getPayoffProjection(cardId, amount).subscribe(proj => {
      this.projection = proj;
      this.updateChart(proj);
    });
  }

  private updateChart(proj: PayoffProjection) {
    this.chartData = {
      labels: proj.schedule.map(s => `${s.month}/${s.year}`),
      datasets: [{
        data: proj.schedule.map(s => s.closingBalance),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.3,
      }],
    };
  }

  goBack() {
    this.router.navigate(['/credit-cards']);
  }
}
