import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SavingsGoalProgress } from '../../../models/savings.model';

@Component({
  selector: 'app-savings-goal-card',
  imports: [
    CurrencyPipe, DatePipe, DecimalPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ progress.name }}</mat-card-title>
        <mat-card-subtitle>
          <mat-chip [class]="getStatusClass()" size="small">{{ progress.status }}</mat-chip>
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="progress-section">
          <mat-progress-spinner
            mode="determinate"
            [value]="progress.percentageComplete"
            [diameter]="80"
            [strokeWidth]="8"
            [color]="getSpinnerColor()">
          </mat-progress-spinner>
          <div class="progress-text">{{ progress.percentageComplete | number:'1.0-0' }}%</div>
        </div>

        <div class="amounts">
          <span class="current">{{ progress.currentAmount | currency }}</span>
          <span class="separator">/</span>
          <span class="target">{{ progress.targetAmount | currency }}</span>
        </div>

        <div class="details">
          <div><strong>Target:</strong> {{ progress.targetDate | date:'MMM yyyy' }}</div>
          <div><strong>Remaining:</strong> {{ progress.remainingAmount | currency }}</div>
          <div><strong>Need/mo:</strong> {{ progress.requiredMonthlyContribution | currency }}</div>
          <div><strong>Avg/mo:</strong> {{ progress.averageMonthlyContribution | currency }}</div>
        </div>

        <p class="status-msg">{{ progress.statusMessage }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button (click)="contribute.emit()">
          <mat-icon>add_circle</mat-icon> Add $
        </button>
        <button mat-button (click)="viewDetails.emit()">
          <mat-icon>analytics</mat-icon> Details
        </button>
        <button mat-button (click)="edit.emit()">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-button color="warn" (click)="remove.emit()">
          <mat-icon>delete</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .progress-section { display: flex; align-items: center; justify-content: center; position: relative; margin: 16px 0; }
    .progress-text { position: absolute; font-size: 18px; font-weight: 600; }
    .amounts { text-align: center; font-size: 16px; margin-bottom: 12px; }
    .current { font-weight: 600; }
    .separator { margin: 0 4px; color: #999; }
    .target { color: #666; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 13px; }
    .status-msg { font-size: 12px; color: #666; margin-top: 8px; font-style: italic; }
    .on-track { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .at-risk { background-color: #fff3e0 !important; color: #e65100 !important; }
    .behind { background-color: #ffebee !important; color: #c62828 !important; }
    .achieved { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
  `],
})
export class SavingsGoalCardComponent {
  @Input({ required: true }) progress!: SavingsGoalProgress;
  @Output() contribute = new EventEmitter<void>();
  @Output() viewDetails = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  getStatusClass(): string {
    const map: Record<string, string> = {
      OnTrack: 'on-track', AtRisk: 'at-risk', Behind: 'behind', Achieved: 'achieved',
    };
    return map[this.progress.status] || '';
  }

  getSpinnerColor(): 'primary' | 'accent' | 'warn' {
    if (this.progress.status === 'Achieved' || this.progress.status === 'OnTrack') return 'primary';
    if (this.progress.status === 'AtRisk') return 'accent';
    return 'warn';
  }
}
