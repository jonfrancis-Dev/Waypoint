import { Component, Input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BudgetCategorySummary } from '../../../models/budget.model';

@Component({
  selector: 'app-budget-progress',
  imports: [CurrencyPipe, DecimalPipe, MatProgressBarModule],
  template: `
    @for (cat of categories; track cat.categoryName) {
      <div class="category-row">
        <div class="category-header">
          <span class="name">{{ cat.categoryName }}</span>
          <span class="amounts">
            {{ cat.actual | currency }} / {{ cat.budgeted | currency }}
            <span class="percent">({{ cat.percentUsed | number:'1.0-1' }}%)</span>
          </span>
        </div>
        <mat-progress-bar
          [mode]="'determinate'"
          [value]="Math.min(cat.percentUsed, 100)"
          [color]="getColor(cat.percentUsed)">
        </mat-progress-bar>
        @if (cat.variance < 0) {
          <div class="over-budget">Over budget by {{ -cat.variance | currency }}</div>
        }
      </div>
    }
  `,
  styles: [`
    .category-row { margin-bottom: 16px; }
    .category-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .name { font-weight: 500; }
    .amounts { font-size: 13px; color: #666; }
    .percent { font-size: 12px; }
    .over-budget { font-size: 12px; color: #c62828; margin-top: 2px; }
  `],
})
export class BudgetProgressComponent {
  @Input() categories: BudgetCategorySummary[] = [];

  Math = Math;

  getColor(percentUsed: number): 'primary' | 'accent' | 'warn' {
    if (percentUsed < 75) return 'primary';
    if (percentUsed < 100) return 'accent';
    return 'warn';
  }
}
