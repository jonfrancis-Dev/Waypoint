import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, debounceTime } from 'rxjs';
import { UnifiedDebtService } from '../services/unified-debt.service';
import { UnifiedPayoffComparison, AccountPayoffSchedule } from '../../../models/debt.model';

@Component({
  selector: 'app-unified-payoff-comparison',
  imports: [
    CurrencyPipe, DatePipe, FormsModule,
    MatCardModule, MatFormFieldModule, MatSliderModule, MatChipsModule, MatIconModule, MatButtonModule,
  ],
  template: `
    <h2>Unified Payoff Strategy Comparison</h2>
    <p class="subtitle">Comparing payoff strategies across all credit cards and debts</p>

    <div class="slider-row">
      <mat-label>Extra Monthly Payment: {{ extraPayment | currency }}</mat-label>
      <mat-slider min="0" max="2000" step="25" class="full-width">
        <input matSliderThumb [(ngModel)]="extraPayment" (ngModelChange)="onExtraChange($event)">
      </mat-slider>
    </div>

    @if (comparison) {
      <div class="strategies">
        <mat-card [class.recommended]="comparison.recommendedStrategy === 'Avalanche'">
          <mat-card-header>
            <mat-card-title>
              Avalanche
              @if (comparison.recommendedStrategy === 'Avalanche') {
                <mat-chip class="rec-chip">Recommended</mat-chip>
              }
            </mat-card-title>
            <mat-card-subtitle>Highest APR First</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="stat">
              <span class="stat-label">Total Interest</span>
              <span class="stat-value">{{ comparison.avalanche.totalInterestPaid | currency }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Debt-Free Date</span>
              <span class="stat-value">{{ comparison.avalanche.payoffDate | date:'MMM yyyy' }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Time to Freedom</span>
              <span class="stat-value">{{ comparison.avalanche.totalMonths }} months</span>
            </div>
            <div class="timeline">
              <div class="timeline-header">Accounts paid in order:</div>
              @for (s of comparison.avalanche.accountSchedules; track s.accountId) {
                <div class="timeline-bar">
                  <span class="bar-label" [title]="s.accountName">{{ s.accountName }}</span>
                  <div class="bar" [class]="getBarClass(s)"
                    [style.width.%]="getBarWidth(s.schedule.length, comparison.avalanche.totalMonths)">
                  </div>
                  <span class="bar-months">{{ s.schedule.length }}mo</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card [class.recommended]="comparison.recommendedStrategy === 'Snowball'">
          <mat-card-header>
            <mat-card-title>
              Snowball
              @if (comparison.recommendedStrategy === 'Snowball') {
                <mat-chip class="rec-chip">Recommended</mat-chip>
              }
            </mat-card-title>
            <mat-card-subtitle>Lowest Balance First</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="stat">
              <span class="stat-label">Total Interest</span>
              <span class="stat-value">{{ comparison.snowball.totalInterestPaid | currency }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Debt-Free Date</span>
              <span class="stat-value">{{ comparison.snowball.payoffDate | date:'MMM yyyy' }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Time to Freedom</span>
              <span class="stat-value">{{ comparison.snowball.totalMonths }} months</span>
            </div>
            <div class="timeline">
              <div class="timeline-header">Accounts paid in order:</div>
              @for (s of comparison.snowball.accountSchedules; track s.accountId) {
                <div class="timeline-bar">
                  <span class="bar-label" [title]="s.accountName">{{ s.accountName }}</span>
                  <div class="bar snowball-bar" [class]="getBarClass(s, true)"
                    [style.width.%]="getBarWidth(s.schedule.length, comparison.snowball.totalMonths)">
                  </div>
                  <span class="bar-months">{{ s.schedule.length }}mo</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="summary-card">
        <mat-card-content>
          <mat-icon class="summary-icon">lightbulb</mat-icon>
          <p class="recommendation">{{ comparison.summary.recommendation }}</p>
          <div class="savings-row">
            <span>Interest Saved: <strong>{{ comparison.summary.interestSaved | currency }}</strong></span>
            <span>Months Saved: <strong>{{ comparison.summary.monthsSaved }}</strong></span>
          </div>
        </mat-card-content>
      </mat-card>
    } @else {
      <p class="empty">Add credit cards or debts to see payoff comparisons.</p>
    }

    <button mat-stroked-button (click)="goBack()" style="margin-top:16px">
      <mat-icon>arrow_back</mat-icon> Back to Debt Overview
    </button>
  `,
  styles: [`
    .subtitle { color: #666; margin-top: -8px; margin-bottom: 16px; }
    .slider-row { margin: 16px 0 24px; }
    .full-width { width: 100%; }
    .strategies { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .recommended { border: 2px solid #f9a825; }
    .rec-chip { background: #f9a825 !important; color: #000 !important; font-size: 11px; margin-left: 8px; }
    .stat { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
    .stat-label { color: #666; }
    .stat-value { font-weight: 500; }
    .timeline { margin-top: 16px; }
    .timeline-header { font-size: 12px; color: #666; margin-bottom: 8px; }
    .timeline-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .bar-label { width: 120px; font-size: 13px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
    .bar { height: 16px; border-radius: 4px; min-width: 8px; }
    .bar-cc { background: #f44336; }
    .bar-student { background: #2196f3; }
    .bar-auto { background: #4caf50; }
    .bar-personal { background: #ff9800; }
    .bar-medical { background: #9c27b0; }
    .bar-other { background: #757575; }
    .snowball-bar.bar-cc { background: #ef9a9a; }
    .snowball-bar.bar-student { background: #90caf9; }
    .snowball-bar.bar-auto { background: #a5d6a7; }
    .snowball-bar.bar-personal { background: #ffcc80; }
    .snowball-bar.bar-medical { background: #ce93d8; }
    .snowball-bar.bar-other { background: #bdbdbd; }
    .bar-months { font-size: 12px; color: #666; }
    .summary-card { background: #f5f5f5; }
    .summary-icon { color: #f9a825; vertical-align: middle; margin-right: 8px; }
    .recommendation { font-size: 15px; margin: 8px 0; }
    .savings-row { display: flex; gap: 32px; }
    .empty { color: #999; font-style: italic; }
  `],
})
export class UnifiedPayoffComparisonComponent implements OnInit {
  private readonly svc = inject(UnifiedDebtService);
  private readonly router = inject(Router);
  private readonly extraChange$ = new Subject<number>();

  comparison: UnifiedPayoffComparison | null = null;
  extraPayment = 100;

  ngOnInit() {
    this.loadComparison(this.extraPayment);
    this.extraChange$.pipe(debounceTime(300)).subscribe(amount => this.loadComparison(amount));
  }

  onExtraChange(amount: number) {
    this.extraChange$.next(amount);
  }

  getBarWidth(months: number, maxMonths: number): number {
    return maxMonths > 0 ? (months / maxMonths) * 100 : 0;
  }

  getBarClass(s: AccountPayoffSchedule, snowball = false): string {
    const prefix = snowball ? 'snowball-bar bar' : 'bar';
    if (s.type === 'CreditCard') return `${prefix}-cc`;
    // Infer debt type from name pattern (simplified)
    const name = s.accountName.toLowerCase();
    if (name.includes('student')) return `${prefix}-student`;
    if (name.includes('auto') || name.includes('car')) return `${prefix}-auto`;
    if (name.includes('personal')) return `${prefix}-personal`;
    if (name.includes('medical')) return `${prefix}-medical`;
    return `${prefix}-other`;
  }

  goBack() {
    this.router.navigate(['/debt-overview']);
  }

  private loadComparison(extra: number) {
    this.svc.getPayoffComparison(extra).subscribe({
      next: c => this.comparison = c,
      error: () => this.comparison = null,
    });
  }
}
