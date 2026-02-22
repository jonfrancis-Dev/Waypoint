import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-monthly-summary-card',
  imports: [CurrencyPipe, MatCardModule],
  template: `
    <div class="summary-cards">
      <mat-card>
        <mat-card-content>
          <div class="label">Income</div>
          <div class="amount income">{{ totalIncome | currency }}</div>
        </mat-card-content>
      </mat-card>
      <mat-card>
        <mat-card-content>
          <div class="label">Spending</div>
          <div class="amount spending">{{ totalSpending | currency }}</div>
        </mat-card-content>
      </mat-card>
      <mat-card>
        <mat-card-content>
          <div class="label">Net</div>
          <div class="amount" [class.positive]="netAmount >= 0" [class.negative]="netAmount < 0">
            {{ netAmount | currency }}
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .label { font-size: 14px; color: #666; margin-bottom: 4px; }
    .amount { font-size: 24px; font-weight: 500; }
    .income { color: #2e7d32; }
    .spending { color: #c62828; }
    .positive { color: #2e7d32; }
    .negative { color: #c62828; }
  `],
})
export class MonthlySummaryCardComponent {
  @Input() totalIncome = 0;
  @Input() totalSpending = 0;
  @Input() netAmount = 0;
}
