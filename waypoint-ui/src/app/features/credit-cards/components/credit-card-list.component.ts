import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreditCardService } from '../services/credit-card.service';
import { CreditCardFormComponent } from './credit-card-form.component';
import { PaymentLoggerComponent } from './payment-logger.component';
import { CreditCardMetrics } from '../../../models/credit-card.model';

@Component({
  selector: 'app-credit-card-list',
  imports: [
    CurrencyPipe, DecimalPipe,
    MatCardModule, MatButtonModule, MatProgressBarModule,
    MatIconModule, MatChipsModule, MatDialogModule, MatSnackBarModule,
  ],
  template: `
    <div class="header">
      <h2>Credit Cards</h2>
      <div class="actions">
        <button mat-stroked-button (click)="openComparison()">
          <mat-icon>compare_arrows</mat-icon> Payoff Comparison
        </button>
        <button mat-flat-button color="primary" (click)="addCard()">
          <mat-icon>add</mat-icon> Add Card
        </button>
      </div>
    </div>

    @if (metrics.length === 0) {
      <mat-card><mat-card-content><p class="empty">No credit cards yet. Add one to get started.</p></mat-card-content></mat-card>
    }

    <div class="card-grid">
      @for (m of metrics; track m.cardId) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ m.name }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip [class]="m.healthStatus.toLowerCase()" size="small">{{ m.healthStatus }}</mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="balance-row">
              <span>{{ m.currentBalance | currency }} / {{ m.creditLimit | currency }}</span>
              <span>{{ m.utilizationPercentage | number:'1.1-1' }}%</span>
            </div>
            <mat-progress-bar
              [value]="m.utilizationPercentage"
              [color]="getUtilColor(m.utilizationPercentage)">
            </mat-progress-bar>
            <div class="details">
              <div><strong>APR:</strong> {{ m.apr }}%</div>
              <div><strong>Min Payment:</strong> {{ m.minimumPayment | currency }}</div>
              <div><strong>Daily Interest:</strong> {{ m.dailyInterest | currency }}</div>
              <div><strong>Payoff (min):</strong> {{ m.monthsToPayoffAtMinimum }} mo</div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button (click)="viewMetrics(m.cardId)">
              <mat-icon>analytics</mat-icon> Details
            </button>
            <button mat-button (click)="logPayment(m)">
              <mat-icon>payment</mat-icon> Pay
            </button>
            <button mat-button (click)="viewPayoff(m.cardId)">
              <mat-icon>trending_down</mat-icon> Payoff
            </button>
            <button mat-button (click)="editCard(m)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-button color="warn" (click)="deleteCard(m.cardId, m.name)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .actions { display: flex; gap: 8px; }
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    .balance-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin-top: 12px; font-size: 13px; }
    .empty { color: #999; font-style: italic; }
    .good { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .warning { background-color: #fff3e0 !important; color: #e65100 !important; }
    .critical { background-color: #ffebee !important; color: #c62828 !important; }
  `],
})
export class CreditCardListComponent implements OnInit {
  private readonly svc = inject(CreditCardService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  metrics: CreditCardMetrics[] = [];

  ngOnInit() {
    this.loadMetrics();
  }

  loadMetrics() {
    this.svc.getAllMetrics().subscribe(m => this.metrics = m);
  }

  getUtilColor(pct: number): 'primary' | 'accent' | 'warn' {
    if (pct <= 30) return 'primary';
    if (pct <= 70) return 'accent';
    return 'warn';
  }

  addCard() {
    const ref = this.dialog.open(CreditCardFormComponent, { width: '500px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.svc.createCard(result).subscribe(() => {
          this.snackBar.open('Card added!', 'OK', { duration: 3000 });
          this.loadMetrics();
        });
      }
    });
  }

  editCard(m: CreditCardMetrics) {
    this.svc.getCard(m.cardId).subscribe(card => {
      const ref = this.dialog.open(CreditCardFormComponent, { width: '500px', data: card });
      ref.afterClosed().subscribe(result => {
        if (result) {
          this.svc.updateCard(m.cardId, result).subscribe(() => {
            this.snackBar.open('Card updated!', 'OK', { duration: 3000 });
            this.loadMetrics();
          });
        }
      });
    });
  }

  deleteCard(id: string, name: string) {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      this.svc.deleteCard(id).subscribe(() => {
        this.snackBar.open('Card deleted', 'OK', { duration: 3000 });
        this.loadMetrics();
      });
    }
  }

  logPayment(m: CreditCardMetrics) {
    const ref = this.dialog.open(PaymentLoggerComponent, {
      width: '450px',
      data: { cardName: m.name },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.svc.logPayment(m.cardId, result).subscribe(() => {
          this.snackBar.open('Payment logged!', 'OK', { duration: 3000 });
          this.loadMetrics();
        });
      }
    });
  }

  viewMetrics(id: string) {
    this.router.navigate(['/credit-cards', id, 'metrics']);
  }

  viewPayoff(id: string) {
    this.router.navigate(['/credit-cards', id, 'payoff']);
  }

  openComparison() {
    this.router.navigate(['/credit-cards', 'compare']);
  }
}
