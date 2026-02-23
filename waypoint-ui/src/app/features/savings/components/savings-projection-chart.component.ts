import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { SavingsService } from '../services/savings.service';
import {
  SavingsGoalProgress, SavingsProjection, SavingsContribution,
} from '../../../models/savings.model';

@Component({
  selector: 'app-savings-projection-chart',
  imports: [
    CurrencyPipe, DatePipe, DecimalPipe, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatSliderModule,
    MatChipsModule, MatProgressSpinnerModule, MatTableModule, MatExpansionModule,
    BaseChartDirective,
  ],
  template: `
    <button mat-button [routerLink]="['/savings']">
      <mat-icon>arrow_back</mat-icon> Back to Goals
    </button>

    @if (progress) {
      <div class="header">
        <h2>{{ progress.name }}</h2>
        <mat-chip [class]="getStatusClass()">{{ progress.status }}</mat-chip>
      </div>

      <!-- Progress Section -->
      <div class="progress-overview">
        <mat-card>
          <mat-card-content class="progress-ring-section">
            <mat-progress-spinner
              mode="determinate"
              [value]="progress.percentageComplete"
              [diameter]="120"
              [strokeWidth]="10"
              [color]="getSpinnerColor()">
            </mat-progress-spinner>
            <div class="ring-text">{{ progress.percentageComplete | number:'1.0-0' }}%</div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="stat-grid">
              <div class="stat">
                <span class="stat-label">Current</span>
                <span class="stat-value">{{ progress.currentAmount | currency }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Target</span>
                <span class="stat-value">{{ progress.targetAmount | currency }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Remaining</span>
                <span class="stat-value">{{ progress.remainingAmount | currency }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Target Date</span>
                <span class="stat-value">{{ progress.targetDate | date:'MMM yyyy' }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Days Left</span>
                <span class="stat-value">{{ progress.daysRemaining }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Need/mo</span>
                <span class="stat-value">{{ progress.requiredMonthlyContribution | currency }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Avg/mo</span>
                <span class="stat-value">{{ progress.averageMonthlyContribution | currency }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Status</span>
                <span class="stat-value">{{ progress.statusMessage }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Milestones -->
      <mat-card class="milestones-card">
        <mat-card-content>
          <h3>Milestones</h3>
          <div class="milestones">
            @for (m of milestones; track m.label) {
              <div class="milestone" [class.achieved]="progress.percentageComplete >= m.pct">
                <mat-icon>{{ progress.percentageComplete >= m.pct ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                <span>{{ m.label }} — {{ m.pct }}% ({{ m.amount | currency }})</span>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Projection Chart -->
      <mat-card>
        <mat-card-content>
          <h3>Savings Projection</h3>
          <div class="slider-row">
            <span>Monthly Contribution: <strong>{{ monthlyContribution | currency }}</strong></span>
            <mat-slider min="0" [max]="sliderMax" [step]="sliderStep" discrete>
              <input matSliderThumb [value]="monthlyContribution" (valueChange)="onSliderChange($event)">
            </mat-slider>
          </div>

          @if (projection) {
            <div class="chart-container">
              <canvas baseChart
                [data]="chartData"
                [options]="chartOptions"
                type="line">
              </canvas>
            </div>

            <div class="projection-summary">
              <div class="summary-item">
                <mat-icon [class]="projection.willMeetTargetDate ? 'green' : 'red'">
                  {{ projection.willMeetTargetDate ? 'check_circle' : 'warning' }}
                </mat-icon>
                <span>
                  At {{ monthlyContribution | currency }}/mo: Complete by
                  {{ projection.projectedCompletionDate | date:'MMM yyyy' }}
                  ({{ projection.monthsToCompletion }} months)
                </span>
              </div>
              <div class="summary-item">
                <mat-icon>info</mat-icon>
                <span>To meet target date: {{ progress.requiredMonthlyContribution | currency }}/mo</span>
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Contribution History -->
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>Contribution History ({{ contributions.length }})</mat-panel-title>
          <mat-panel-description>{{ totalContributed | currency }} contributed</mat-panel-description>
        </mat-expansion-panel-header>

        @if (contributions.length > 0) {
          <table mat-table [dataSource]="contributions" class="full-width">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let c">{{ c.contributedOn | date:'MMM d, yyyy' }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let c">{{ c.amount | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="note">
              <th mat-header-cell *matHeaderCellDef>Note</th>
              <td mat-cell *matCellDef="let c">{{ c.note || '—' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="contributionColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: contributionColumns;"></tr>
          </table>
        } @else {
          <p class="empty">No contributions yet.</p>
        }
      </mat-expansion-panel>
    } @else {
      <p class="empty">Loading goal details...</p>
    }
  `,
  styles: [`
    .header { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
    .progress-overview { display: grid; grid-template-columns: auto 1fr; gap: 16px; margin-bottom: 16px; }
    .progress-ring-section { display: flex; align-items: center; justify-content: center; position: relative; padding: 24px; }
    .ring-text { position: absolute; font-size: 24px; font-weight: 600; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .stat { display: flex; flex-direction: column; }
    .stat-label { font-size: 12px; color: #666; }
    .stat-value { font-size: 15px; font-weight: 600; }
    .milestones-card { margin-bottom: 16px; }
    .milestones { display: flex; gap: 24px; flex-wrap: wrap; }
    .milestone { display: flex; align-items: center; gap: 6px; color: #999; }
    .milestone.achieved { color: #2e7d32; }
    .milestone.achieved mat-icon { color: #4caf50; }
    .slider-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .slider-row mat-slider { flex: 1; }
    .chart-container { height: 350px; position: relative; }
    .projection-summary { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
    .summary-item { display: flex; align-items: center; gap: 8px; }
    .green { color: #4caf50; }
    .red { color: #f44336; }
    .full-width { width: 100%; }
    .empty { color: #999; font-style: italic; }
    mat-expansion-panel { margin-top: 16px; }
    .on-track { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .at-risk { background-color: #fff3e0 !important; color: #e65100 !important; }
    .behind { background-color: #ffebee !important; color: #c62828 !important; }
    .achieved { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
  `],
})
export class SavingsProjectionChartComponent implements OnInit {
  private readonly svc = inject(SavingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  progress: SavingsGoalProgress | null = null;
  projection: SavingsProjection | null = null;
  contributions: SavingsContribution[] = [];
  totalContributed = 0;
  monthlyContribution = 0;
  sliderMax = 2000;
  sliderStep = 25;
  milestones: { label: string; pct: number; amount: number }[] = [];
  contributionColumns = ['date', 'amount', 'note'];

  private slider$ = new Subject<number>();

  chartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => '$' + Number(v).toLocaleString(),
        },
      },
    },
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.slider$.pipe(
      debounceTime(300),
      switchMap(amount => {
        this.monthlyContribution = amount;
        return this.svc.getProjection(id, amount);
      }),
    ).subscribe(proj => {
      this.projection = proj;
      this.buildChart(proj);
    });

    this.svc.getGoalProgress(id).subscribe(p => {
      this.progress = p;
      this.monthlyContribution = Math.ceil(p.requiredMonthlyContribution / this.sliderStep) * this.sliderStep || 100;
      this.sliderMax = Math.max(2000, this.monthlyContribution * 3);
      this.milestones = [
        { label: '25%', pct: 25, amount: p.targetAmount * 0.25 },
        { label: '50%', pct: 50, amount: p.targetAmount * 0.50 },
        { label: '75%', pct: 75, amount: p.targetAmount * 0.75 },
        { label: '100%', pct: 100, amount: p.targetAmount },
      ];
      this.slider$.next(this.monthlyContribution);
    });

    this.svc.getContributions(id).subscribe(c => {
      this.contributions = c;
      this.totalContributed = c.reduce((sum, x) => sum + x.amount, 0);
    });
  }

  onSliderChange(value: number) {
    this.monthlyContribution = value;
    this.slider$.next(value);
  }

  private buildChart(proj: SavingsProjection) {
    if (!this.progress) return;

    const labels = proj.schedule.map(m => `${m.month}/${m.year}`);
    const balances = proj.schedule.map(m => m.closingBalance);
    const targetLine = proj.schedule.map(() => this.progress!.targetAmount);

    // Required pace line
    const remaining = this.progress.remainingAmount;
    const months = this.progress.monthsRemaining;
    const requiredPace = proj.schedule.map((m, i) =>
      Math.min(this.progress!.targetAmount, this.progress!.currentAmount + (remaining / Math.max(1, months)) * (i + 1))
    );

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Projected Balance',
          data: balances,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Required Pace',
          data: requiredPace,
          borderColor: '#4caf50',
          borderDash: [5, 5],
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Target Amount',
          data: targetLine,
          borderColor: '#f44336',
          borderDash: [10, 5],
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  }

  getStatusClass(): string {
    const map: Record<string, string> = {
      OnTrack: 'on-track', AtRisk: 'at-risk', Behind: 'behind', Achieved: 'achieved',
    };
    return map[this.progress?.status ?? ''] || '';
  }

  getSpinnerColor(): 'primary' | 'accent' | 'warn' {
    if (this.progress?.status === 'Achieved' || this.progress?.status === 'OnTrack') return 'primary';
    if (this.progress?.status === 'AtRisk') return 'accent';
    return 'warn';
  }
}
