import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { CategorySpending } from '../../../models/dashboard.model';

@Component({
  selector: 'app-spending-chart',
  imports: [BaseChartDirective],
  template: `
    <div class="chart-container">
      <canvas baseChart
        [data]="chartData"
        [options]="chartOptions"
        type="doughnut">
      </canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      max-width: 400px;
      margin: 0 auto;
    }
  `],
})
export class SpendingChartComponent implements OnChanges {
  @Input() categories: CategorySpending[] = [];

  chartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
    },
  };

  private readonly colors = [
    '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c62828',
    '#00838f', '#4e342e', '#546e7a', '#f9a825', '#ad1457',
  ];

  ngOnChanges() {
    this.chartData = {
      labels: this.categories.map(c => c.categoryName),
      datasets: [{
        data: this.categories.map(c => c.amount),
        backgroundColor: this.colors.slice(0, this.categories.length),
      }],
    };
  }
}
