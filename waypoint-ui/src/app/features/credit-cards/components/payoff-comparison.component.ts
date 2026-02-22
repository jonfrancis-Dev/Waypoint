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
import { CreditCardService } from '../services/credit-card.service';
import { MultiCardPayoffComparison } from '../../../models/credit-card.model';

@Component({
  selector: 'app-payoff-comparison',
  imports: [
    CurrencyPipe, DatePipe, FormsModule,
    MatCardModule, MatFormFieldModule, MatSliderModule, MatChipsModule, MatIconModule, MatButtonModule,
  ],
  template: `
    <h2>Payoff Strategy Comparison</h2>

    <div class="slider-row">
      <mat-label>Extra Monthly Payment: {{ extraPayment | currency }}</mat-label>
      <mat-slider min="0" max="1000" step="25" class="full-width">
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
              <span class="stat-label">Payoff Date</span>
              <span class="stat-value">{{ comparison.avalanche.payoffDate | date:'MMM yyyy' }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Time to Payoff</span>
              <span class="stat-value">{{ comparison.avalanche.totalMonths }} months</span>
            </div>
            <div class="timeline">
              @for (cs of comparison.avalanche.cardSchedules; track cs.cardId) {
                <div class="timeline-bar">
                  <span class="bar-label">{{ cs.cardName }}</span>
                  <div class="bar" [style.width.%]="getBarWidth(cs.schedule.length, comparison.avalanche.totalMonths)"></div>
                  <span class="bar-months">{{ cs.schedule.length }}mo</span>
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
              <span class="stat-label">Payoff Date</span>
              <span class="stat-value">{{ comparison.snowball.payoffDate | date:'MMM yyyy' }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Time to Payoff</span>
              <span class="stat-value">{{ comparison.snowball.totalMonths }} months</span>
            </div>
            <div class="timeline">
              @for (cs of comparison.snowball.cardSchedules; track cs.cardId) {
                <div class="timeline-bar">
                  <span class="bar-label">{{ cs.cardName }}</span>
                  <div class="bar snowball-bar" [style.width.%]="getBarWidth(cs.schedule.length, comparison.snowball.totalMonths)"></div>
                  <span class="bar-months">{{ cs.schedule.length }}mo</span>
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
      <p class="empty">Add at least one credit card to see payoff comparisons.</p>
    }

    <button mat-stroked-button routerLink="/credit-cards" style="margin-top:16px">
      <mat-icon>arrow_back</mat-icon> Back to Cards
    </button>
  `,
  styles: [`
    .slider-row { margin: 16px 0 24px; }
    .full-width { width: 100%; }
    .strategies { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .recommended { border: 2px solid #f9a825; }
    .rec-chip { background: #f9a825 !important; color: #000 !important; font-size: 11px; margin-left: 8px; }
    .stat { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
    .stat-label { color: #666; }
    .stat-value { font-weight: 500; }
    .timeline { margin-top: 16px; }
    .timeline-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .bar-label { width: 100px; font-size: 13px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
    .bar { height: 16px; background: #1976d2; border-radius: 4px; min-width: 8px; }
    .snowball-bar { background: #388e3c; }
    .bar-months { font-size: 12px; color: #666; }
    .summary-card { background: #f5f5f5; }
    .summary-icon { color: #f9a825; vertical-align: middle; margin-right: 8px; }
    .recommendation { font-size: 15px; margin: 8px 0; }
    .savings-row { display: flex; gap: 32px; }
    .empty { color: #999; font-style: italic; }
  `],
})
export class PayoffComparisonComponent implements OnInit {
  private readonly svc = inject(CreditCardService);
  private readonly router = inject(Router);
  private readonly extraChange$ = new Subject<number>();

  comparison: MultiCardPayoffComparison | null = null;
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

  private loadComparison(extra: number) {
    this.svc.getPayoffComparison(extra).subscribe({
      next: c => this.comparison = c,
      error: () => this.comparison = null,
    });
  }
}
