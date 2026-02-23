import { Component, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-savings-contribution-logger',
  imports: [
    CurrencyPipe, DecimalPipe, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>Add Contribution — {{ data.goalName }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-col">
        <mat-form-field>
          <mat-label>Contribution Amount</mat-label>
          <input matInput type="number" formControlName="amount" min="0">
          <span matTextPrefix>$&nbsp;</span>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="contributedOn">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Note (optional)</mat-label>
          <textarea matInput formControlName="note" rows="2"></textarea>
        </mat-form-field>

        @if (form.value.amount && form.value.amount > 0) {
          <div class="preview">
            <div>Before: {{ data.currentAmount | currency }}</div>
            <div>After: {{ (data.currentAmount + form.value.amount) | currency }}</div>
            <div>Progress: {{ ((data.currentAmount + form.value.amount) / data.targetAmount * 100) | number:'1.1-1' }}%</div>
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">
        Add Contribution
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-col { display: flex; flex-direction: column; gap: 4px; min-width: 380px; }
    .preview { background: #e8f5e9; padding: 12px; border-radius: 8px; font-size: 14px; display: flex; flex-direction: column; gap: 4px; }
  `],
})
export class SavingsContributionLoggerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SavingsContributionLoggerComponent>);
  readonly data: { goalName: string; currentAmount: number; targetAmount: number } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    amount: [0 as number, [Validators.required, Validators.min(0.01)]],
    contributedOn: [new Date(), Validators.required],
    note: [''],
  });

  submit() {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.dialogRef.close({
      amount: val.amount,
      contributedOn: new Date(val.contributedOn!).toISOString(),
      note: val.note || undefined,
    });
  }
}
