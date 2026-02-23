import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { SavingsService } from '../services/savings.service';
import { SavingsRecommendation, RecommendationType } from '../../../models/savings.model';

@Component({
  selector: 'app-savings-recommendations',
  imports: [
    CurrencyPipe, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
  ],
  template: `
    <button mat-button [routerLink]="['/savings']">
      <mat-icon>arrow_back</mat-icon> Back to Goals
    </button>

    <h2>Savings Recommendations</h2>

    @if (recommendations.length > 0) {
      <div class="rec-grid">
        @for (r of recommendations; track r.goalId) {
          <mat-card [class]="getCardClass(r.type)">
            <mat-card-header>
              <mat-icon mat-card-avatar class="rec-icon" [class]="getIconClass(r.type)">
                {{ getIcon(r.type) }}
              </mat-icon>
              <mat-card-title>{{ r.goalName }}</mat-card-title>
              <mat-card-subtitle>
                <mat-chip [class]="getChipClass(r.type)" size="small">{{ getTypeLabel(r.type) }}</mat-chip>
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="reasoning">{{ r.reasoning }}</p>

              @if (r.suggestedMonthlyAmount > 0) {
                <div class="suggestion">
                  <mat-icon>trending_up</mat-icon>
                  <span>Suggested: <strong>{{ r.suggestedMonthlyAmount | currency }}/mo</strong></span>
                </div>
              }

              @if (r.impact > 0) {
                <div class="impact">
                  <mat-icon>speed</mat-icon>
                  <span>Impact: <strong>{{ getImpactText(r) }}</strong></span>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
      </div>
    } @else if (loaded) {
      <mat-card>
        <mat-card-content>
          <p class="empty">No recommendations at this time. Create some savings goals to get personalized suggestions.</p>
        </mat-card-content>
      </mat-card>
    } @else {
      <p class="empty">Loading recommendations...</p>
    }
  `,
  styles: [`
    h2 { margin: 16px 0; }
    .rec-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
    .rec-icon { font-size: 28px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .icon-green { color: #4caf50; background: #e8f5e9; }
    .icon-blue { color: #1976d2; background: #e3f2fd; }
    .icon-orange { color: #e65100; background: #fff3e0; }
    .icon-red { color: #c62828; background: #ffebee; }
    .reasoning { font-size: 14px; color: #555; line-height: 1.5; }
    .suggestion, .impact { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 14px; }
    .suggestion mat-icon { color: #1976d2; }
    .impact mat-icon { color: #ff9800; }
    .card-on-track { border-left: 4px solid #4caf50; }
    .card-increase { border-left: 4px solid #1976d2; }
    .card-warning { border-left: 4px solid #ff9800; }
    .card-debt { border-left: 4px solid #f44336; }
    .chip-on-track { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-increase { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .chip-warning { background-color: #fff3e0 !important; color: #e65100 !important; }
    .chip-debt { background-color: #ffebee !important; color: #c62828 !important; }
    .empty { color: #999; font-style: italic; }
  `],
})
export class SavingsRecommendationsComponent implements OnInit {
  private readonly svc = inject(SavingsService);

  recommendations: SavingsRecommendation[] = [];
  loaded = false;

  ngOnInit() {
    this.svc.getRecommendations().subscribe(r => {
      this.recommendations = r;
      this.loaded = true;
    });
  }

  getIcon(type: RecommendationType): string {
    const map: Record<RecommendationType, string> = {
      OnTrack: 'check_circle',
      IncreaseContribution: 'trending_up',
      ExtendTargetDate: 'event',
      ReduceTargetAmount: 'tune',
      PrioritizeThisGoal: 'priority_high',
      ConsiderPausingForDebt: 'warning',
    };
    return map[type] || 'lightbulb';
  }

  getIconClass(type: RecommendationType): string {
    if (type === 'OnTrack') return 'icon-green';
    if (type === 'IncreaseContribution' || type === 'PrioritizeThisGoal') return 'icon-blue';
    if (type === 'ExtendTargetDate' || type === 'ReduceTargetAmount') return 'icon-orange';
    return 'icon-red';
  }

  getCardClass(type: RecommendationType): string {
    if (type === 'OnTrack') return 'card-on-track';
    if (type === 'IncreaseContribution' || type === 'PrioritizeThisGoal') return 'card-increase';
    if (type === 'ConsiderPausingForDebt') return 'card-debt';
    return 'card-warning';
  }

  getChipClass(type: RecommendationType): string {
    if (type === 'OnTrack') return 'chip-on-track';
    if (type === 'IncreaseContribution' || type === 'PrioritizeThisGoal') return 'chip-increase';
    if (type === 'ConsiderPausingForDebt') return 'chip-debt';
    return 'chip-warning';
  }

  getTypeLabel(type: RecommendationType): string {
    const map: Record<RecommendationType, string> = {
      OnTrack: 'On Track',
      IncreaseContribution: 'Increase Savings',
      ExtendTargetDate: 'Extend Date',
      ReduceTargetAmount: 'Adjust Target',
      PrioritizeThisGoal: 'Prioritize',
      ConsiderPausingForDebt: 'Debt First',
    };
    return map[type] || type;
  }

  getImpactText(r: SavingsRecommendation): string {
    if (r.type === 'OnTrack') return 'On schedule';
    if (r.type === 'IncreaseContribution') return `+${r.impact.toFixed(0)}/mo needed`;
    return `${r.impact.toFixed(0)} months`;
  }
}
