import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-payment-logger',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>Log Payment — {{ data.cardName }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-stack">
        <mat-form-field>
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" min="0">
          <span matTextPrefix>$&nbsp;</span>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Payment Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="paidOn">
          <mat-datepicker-toggle matIconSuffix [for]="picker" />
          <mat-datepicker #picker />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Note (optional)</mat-label>
          <textarea matInput formControlName="note" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!form.valid" (click)="save()">Log Payment</button>
    </mat-dialog-actions>
  `,
  styles: [`.form-stack { display: flex; flex-direction: column; gap: 8px; min-width: 350px; }`],
})
export class PaymentLoggerComponent {
  readonly data = inject<{ cardName: string }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PaymentLoggerComponent>);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paidOn: [new Date(), Validators.required],
    note: [''],
  });

  save() {
    if (this.form.valid) {
      const val = this.form.value;
      this.dialogRef.close({
        amount: val.amount,
        paidOn: (val.paidOn as Date).toISOString(),
        note: val.note || undefined,
      });
    }
  }
}
