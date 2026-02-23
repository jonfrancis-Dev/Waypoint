import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SavingsService } from '../services/savings.service';
import { SavingsGoalCardComponent } from './savings-goal-card.component';
import { SavingsGoalFormComponent } from './savings-goal-form.component';
import { SavingsContributionLoggerComponent } from './savings-contribution-logger.component';
import { SavingsSummary, SavingsGoalProgress } from '../../../models/savings.model';

@Component({
  selector: 'app-savings-dashboard',
  imports: [
    CurrencyPipe, DecimalPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule,
    SavingsGoalCardComponent,
  ],
  template: `
    <div class="header">
      <h2>Savings Goals</h2>
      <div class="actions">
        <button mat-stroked-button (click)="viewRecommendations()">
          <mat-icon>lightbulb</mat-icon> Recommendations
        </button>
        <button mat-flat-button color="primary" (click)="addGoal()">
          <mat-icon>add</mat-icon> New Goal
        </button>
      </div>
    </div>

    @if (summary) {
      <div class="summary-cards">
        <mat-card>
          <mat-card-content>
            <div class="stat-label">Total Saved</div>
            <div class="stat-value">{{ summary.totalCurrentAmount | currency }}</div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <div class="stat-label">Total Target</div>
            <div class="stat-value">{{ summary.totalTargetAmount | currency }}</div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <div class="stat-label">Overall Progress</div>
            <div class="stat-value">{{ summary.overallPercentageComplete | number:'1.1-1' }}%</div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <div class="stat-label">Goals</div>
            <div class="stat-value">{{ summary.achievedGoals }}/{{ summary.totalGoals }} done</div>
          </mat-card-content>
        </mat-card>
      </div>

      @if (summary.nextMilestone) {
        <mat-card class="milestone-card">
          <mat-card-content>
            <mat-icon class="milestone-icon">flag</mat-icon>
            <span><strong>Next Milestone:</strong> {{ summary.nextMilestone.name }} — {{ summary.nextMilestone.percentageComplete | number:'1.0-0' }}% complete</span>
          </mat-card-content>
        </mat-card>
      }

      @if (summary.goals.length === 0) {
        <mat-card><mat-card-content><p class="empty">No savings goals yet. Create one to start tracking!</p></mat-card-content></mat-card>
      }

      <div class="goal-grid">
        @for (p of summary.goals; track p.goalId) {
          <app-savings-goal-card
            [progress]="p"
            (contribute)="logContribution(p)"
            (viewDetails)="viewDetails(p.goalId)"
            (edit)="editGoal(p)"
            (remove)="deleteGoal(p.goalId, p.name)">
          </app-savings-goal-card>
        }
      </div>
    } @else {
      <p class="empty">Loading savings goals...</p>
    }
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .actions { display: flex; gap: 8px; }
    .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-label { color: #666; font-size: 12px; }
    .stat-value { font-size: 22px; font-weight: 600; }
    .milestone-card { background: #fff8e1; margin-bottom: 24px; }
    .milestone-icon { color: #f9a825; vertical-align: middle; margin-right: 8px; }
    .goal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .empty { color: #999; font-style: italic; }
  `],
})
export class SavingsDashboardComponent implements OnInit {
  private readonly svc = inject(SavingsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  summary: SavingsSummary | null = null;

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary() {
    this.svc.getSummary().subscribe(s => this.summary = s);
  }

  addGoal() {
    const ref = this.dialog.open(SavingsGoalFormComponent, { width: '500px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.svc.createGoal(result).subscribe(() => {
          this.snackBar.open('Goal created!', 'OK', { duration: 3000 });
          this.loadSummary();
        });
      }
    });
  }

  editGoal(p: SavingsGoalProgress) {
    this.svc.getGoal(p.goalId).subscribe(goal => {
      const ref = this.dialog.open(SavingsGoalFormComponent, { width: '500px', data: goal });
      ref.afterClosed().subscribe(result => {
        if (result) {
          this.svc.updateGoal(p.goalId, result).subscribe(() => {
            this.snackBar.open('Goal updated!', 'OK', { duration: 3000 });
            this.loadSummary();
          });
        }
      });
    });
  }

  deleteGoal(id: string, name: string) {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      this.svc.deleteGoal(id).subscribe(() => {
        this.snackBar.open('Goal deleted', 'OK', { duration: 3000 });
        this.loadSummary();
      });
    }
  }

  logContribution(p: SavingsGoalProgress) {
    const ref = this.dialog.open(SavingsContributionLoggerComponent, {
      width: '450px',
      data: { goalName: p.name, currentAmount: p.currentAmount, targetAmount: p.targetAmount },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.svc.logContribution(p.goalId, result).subscribe(() => {
          this.snackBar.open('Contribution logged!', 'OK', { duration: 3000 });
          this.loadSummary();
        });
      }
    });
  }

  viewDetails(goalId: string) {
    this.router.navigate(['/savings', goalId, 'details']);
  }

  viewRecommendations() {
    this.router.navigate(['/savings', 'recommendations']);
  }
}
