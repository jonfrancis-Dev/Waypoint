import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { BudgetService } from '../services/budget.service';
import { FinanceStateService } from '../../../shared/services/finance-state.service';
import { BudgetLineItem, BudgetPlan, BudgetSummary } from '../../../models/budget.model';
import { CategoryLimitFormComponent } from './category-limit-form.component';
import { BudgetProgressComponent } from './budget-progress.component';

@Component({
  selector: 'app-budget-planner',
  imports: [
    FormsModule, MatCardModule, MatFormFieldModule, MatSelectModule,
    MatButtonModule, MatSnackBarModule,
    CategoryLimitFormComponent, BudgetProgressComponent,
  ],
  template: `
    <h2>Budget Planner</h2>

    <div class="controls">
      <mat-form-field>
        <mat-label>Month</mat-label>
        <mat-select [(value)]="selectedMonth" (selectionChange)="onMonthYearChange()">
          @for (m of months; track m.value) {
            <mat-option [value]="m.value">{{ m.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Year</mat-label>
        <mat-select [(value)]="selectedYear" (selectionChange)="onMonthYearChange()">
          @for (y of years; track y) {
            <mat-option [value]="y">{{ y }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      @if (existingPlan) {
        <button mat-stroked-button color="warn" (click)="deleteBudget()">Delete Budget</button>
      }
    </div>

    <div class="planner-grid">
      <mat-card>
        <mat-card-header><mat-card-title>Set Category Limits</mat-card-title></mat-card-header>
        <mat-card-content>
          <app-category-limit-form
            [existingItems]="existingPlan?.lineItems ?? null"
            (save)="saveBudget($event)" />
        </mat-card-content>
      </mat-card>

      @if (budgetSummary) {
        <mat-card>
          <mat-card-header><mat-card-title>Budget Progress</mat-card-title></mat-card-header>
          <mat-card-content>
            <app-budget-progress [categories]="budgetSummary.categories" />
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .controls { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
    .planner-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 900px) { .planner-grid { grid-template-columns: 1fr; } }
  `],
})
export class BudgetPlannerComponent implements OnInit, OnDestroy {
  private readonly budgetService = inject(BudgetService);
  private readonly stateService = inject(FinanceStateService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  existingPlan: BudgetPlan | null = null;
  budgetSummary: BudgetSummary | null = null;
  selectedMonth: number;
  selectedYear: number;

  months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
  }));
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  constructor() {
    const current = this.stateService.getValue();
    this.selectedMonth = current.month;
    this.selectedYear = current.year;
  }

  ngOnInit() {
    this.stateService.getSelectedMonthYear()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ month, year }) => this.loadBudget(month, year));
  }

  onMonthYearChange() {
    this.stateService.setSelectedMonthYear(this.selectedMonth, this.selectedYear);
  }

  loadBudget(month: number, year: number) {
    this.existingPlan = null;
    this.budgetSummary = null;

    this.budgetService.getBudget(month, year).subscribe({
      next: plan => {
        this.existingPlan = plan;
        this.loadSummary(month, year);
      },
      error: () => { /* 404 = no budget yet */ },
    });
  }

  loadSummary(month: number, year: number) {
    this.budgetService.getBudgetSummary(month, year).subscribe({
      next: summary => this.budgetSummary = summary,
      error: () => {},
    });
  }

  saveBudget(lineItems: BudgetLineItem[]) {
    this.budgetService.createOrUpdateBudget(this.selectedMonth, this.selectedYear, lineItems)
      .subscribe({
        next: plan => {
          this.existingPlan = plan;
          this.snackBar.open('Budget saved!', 'OK', { duration: 3000 });
          this.loadSummary(this.selectedMonth, this.selectedYear);
        },
        error: () => this.snackBar.open('Error saving budget', 'OK', { duration: 3000 }),
      });
  }

  deleteBudget() {
    if (!this.existingPlan) return;
    this.budgetService.deleteBudget(this.existingPlan.id).subscribe({
      next: () => {
        this.existingPlan = null;
        this.budgetSummary = null;
        this.snackBar.open('Budget deleted', 'OK', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error deleting budget', 'OK', { duration: 3000 }),
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
