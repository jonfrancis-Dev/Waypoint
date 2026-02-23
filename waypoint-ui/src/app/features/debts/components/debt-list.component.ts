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
import { DebtService } from '../services/debt.service';
import { DebtFormComponent } from './debt-form.component';
import { DebtPaymentLoggerComponent } from './debt-payment-logger.component';
import { DebtMetrics, DebtType } from '../../../models/debt.model';

@Component({
  selector: 'app-debt-list',
  imports: [
    CurrencyPipe, DecimalPipe,
    MatCardModule, MatButtonModule, MatProgressBarModule,
    MatIconModule, MatChipsModule, MatDialogModule, MatSnackBarModule,
  ],
  template: `
    <div class="header">
      <h2>Debts</h2>
      <button mat-flat-button color="primary" (click)="addDebt()">
        <mat-icon>add</mat-icon> Add Debt
      </button>
    </div>

    @if (metrics.length === 0) {
      <mat-card><mat-card-content><p class="empty">No debts yet. Add one to get started.</p></mat-card-content></mat-card>
    }

    <div class="card-grid">
      @for (m of metrics; track m.debtId) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ m.name }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip [class]="getTypeClass(m.type)" size="small">{{ getTypeLabel(m.type) }}</mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="balance-row">
              <span>{{ m.currentBalance | currency }} / {{ m.originalBalance | currency }}</span>
              <span>{{ m.percentagePaid | number:'1.1-1' }}% paid</span>
            </div>
            <mat-progress-bar [value]="m.percentagePaid" color="primary"></mat-progress-bar>
            <div class="details">
              <div><strong>APR:</strong> {{ m.apr }}%</div>
              <div><strong>Monthly Payment:</strong> {{ m.monthlyPayment | currency }}</div>
              <div><strong>Monthly Interest:</strong> {{ m.monthlyInterest | currency }}</div>
              <div><strong>Months Remaining:</strong> {{ m.monthsRemaining }} mo</div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button (click)="viewMetrics(m.debtId)">
              <mat-icon>analytics</mat-icon> Details
            </button>
            <button mat-button (click)="logPayment(m)">
              <mat-icon>payment</mat-icon> Pay
            </button>
            <button mat-button (click)="viewPayoff(m.debtId)">
              <mat-icon>trending_down</mat-icon> Payoff
            </button>
            <button mat-button (click)="editDebt(m)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-button color="warn" (click)="deleteDebt(m.debtId, m.name)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    .balance-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin-top: 12px; font-size: 13px; }
    .empty { color: #999; font-style: italic; }
    .personal-loan { background-color: #fff3e0 !important; color: #e65100 !important; }
    .student-loan { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .auto-loan { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .medical { background-color: #f3e5f5 !important; color: #7b1fa2 !important; }
    .other { background-color: #eeeeee !important; color: #616161 !important; }
  `],
})
export class DebtListComponent implements OnInit {
  private readonly svc = inject(DebtService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  metrics: DebtMetrics[] = [];

  ngOnInit() {
    this.loadMetrics();
  }

  loadMetrics() {
    this.svc.getAllMetrics().subscribe(m => this.metrics = m);
  }

  getTypeClass(type: DebtType): string {
    const map: Record<DebtType, string> = {
      PersonalLoan: 'personal-loan',
      StudentLoan: 'student-loan',
      AutoLoan: 'auto-loan',
      Medical: 'medical',
      Other: 'other',
    };
    return map[type] || 'other';
  }

  getTypeLabel(type: DebtType): string {
    const map: Record<DebtType, string> = {
      PersonalLoan: 'Personal Loan',
      StudentLoan: 'Student Loan',
      AutoLoan: 'Auto Loan',
      Medical: 'Medical',
      Other: 'Other',
    };
    return map[type] || type;
  }

  addDebt() {
    const ref = this.dialog.open(DebtFormComponent, { width: '500px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.svc.createDebt(result).subscribe(() => {
          this.snackBar.open('Debt added!', 'OK', { duration: 3000 });
          this.loadMetrics();
        });
      }
    });
  }

  editDebt(m: DebtMetrics) {
    this.svc.getDebt(m.debtId).subscribe(debt => {
      const ref = this.dialog.open(DebtFormComponent, { width: '500px', data: debt });
      ref.afterClosed().subscribe(result => {
        if (result) {
          this.svc.updateDebt(m.debtId, result).subscribe(() => {
            this.snackBar.open('Debt updated!', 'OK', { duration: 3000 });
            this.loadMetrics();
          });
        }
      });
    });
  }

  deleteDebt(id: string, name: string) {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      this.svc.deleteDebt(id).subscribe(() => {
        this.snackBar.open('Debt deleted', 'OK', { duration: 3000 });
        this.loadMetrics();
      });
    }
  }

  logPayment(m: DebtMetrics) {
    const ref = this.dialog.open(DebtPaymentLoggerComponent, {
      width: '450px',
      data: { debtName: m.name, monthlyInterest: m.monthlyInterest },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.svc.logPayment(m.debtId, result).subscribe(() => {
          this.snackBar.open('Payment logged!', 'OK', { duration: 3000 });
          this.loadMetrics();
        });
      }
    });
  }

  viewMetrics(id: string) {
    this.router.navigate(['/debts', id, 'metrics']);
  }

  viewPayoff(id: string) {
    this.router.navigate(['/debts', id, 'payoff']);
  }
}
