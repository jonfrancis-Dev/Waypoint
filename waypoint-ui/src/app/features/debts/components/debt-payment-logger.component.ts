import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-debt-payment-logger',
  imports: [
    CurrencyPipe, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>Log Payment — {{ data.debtName }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-col">
        <mat-form-field>
          <mat-label>Payment Amount</mat-label>
          <input matInput type="number" formControlName="amount" min="0">
          <span matTextPrefix>$&nbsp;</span>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Payment Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="paidOn">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Note (optional)</mat-label>
          <textarea matInput formControlName="note" rows="2"></textarea>
        </mat-form-field>

        @if (form.value.amount && data.monthlyInterest !== undefined) {
          <div class="split-info">
            <div><strong>Interest portion:</strong> {{ interestPortion | currency }}</div>
            <div><strong>Principal portion:</strong> {{ principalPortion | currency }}</div>
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">
        Log Payment
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-col { display: flex; flex-direction: column; gap: 4px; min-width: 380px; }
    .split-info { background: #f5f5f5; padding: 12px; border-radius: 8px; font-size: 14px; display: flex; flex-direction: column; gap: 4px; }
  `],
})
export class DebtPaymentLoggerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DebtPaymentLoggerComponent>);
  readonly data: { debtName: string; monthlyInterest: number } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    amount: [0 as number, [Validators.required, Validators.min(0.01)]],
    paidOn: [new Date(), Validators.required],
    note: [''],
  });

  get interestPortion(): number {
    const amount = this.form.value.amount ?? 0;
    return Math.min(amount, this.data.monthlyInterest ?? 0);
  }

  get principalPortion(): number {
    const amount = this.form.value.amount ?? 0;
    return Math.max(0, amount - this.interestPortion);
  }

  submit() {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.dialogRef.close({
      amount: val.amount,
      paidOn: new Date(val.paidOn!).toISOString(),
      note: val.note || undefined,
    });
  }
}
