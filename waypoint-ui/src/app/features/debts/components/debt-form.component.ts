import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Debt, DebtType } from '../../../models/debt.model';

@Component({
  selector: 'app-debt-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit' : 'Add' }} Debt</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field>
          <mat-label>Debt Name</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>

        <mat-form-field>
          <mat-label>Debt Type</mat-label>
          <mat-select formControlName="debtType">
            @for (t of debtTypes; track t.value) {
              <mat-option [value]="t.value">{{ t.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Original Balance</mat-label>
          <input matInput type="number" formControlName="originalBalance" min="0">
          <span matTextPrefix>$&nbsp;</span>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Current Balance</mat-label>
          <input matInput type="number" formControlName="currentBalance" min="0">
          <span matTextPrefix>$&nbsp;</span>
        </mat-form-field>

        <mat-form-field>
          <mat-label>APR (%)</mat-label>
          <input matInput type="number" formControlName="apr" min="0" step="0.1">
        </mat-form-field>

        <mat-form-field>
          <mat-label>Monthly Payment</mat-label>
          <input matInput type="number" formControlName="minimumPayment" min="0">
          <span matTextPrefix>$&nbsp;</span>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Start Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="startDate">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">
        {{ data ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display: flex; flex-direction: column; gap: 4px; min-width: 400px; }
  `],
})
export class DebtFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DebtFormComponent>);
  readonly data: Debt | null = inject(MAT_DIALOG_DATA, { optional: true });

  debtTypes: { value: DebtType; label: string }[] = [
    { value: 'PersonalLoan', label: 'Personal Loan' },
    { value: 'StudentLoan', label: 'Student Loan' },
    { value: 'AutoLoan', label: 'Auto Loan' },
    { value: 'Medical', label: 'Medical' },
    { value: 'Other', label: 'Other' },
  ];

  form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required],
    debtType: [this.data?.debtType ?? 'PersonalLoan' as DebtType, Validators.required],
    originalBalance: [this.data?.originalBalance ?? 0, [Validators.required, Validators.min(0)]],
    currentBalance: [this.data?.currentBalance ?? 0, [Validators.required, Validators.min(0)]],
    apr: [this.data?.apr ?? 0, [Validators.required, Validators.min(0)]],
    minimumPayment: [this.data?.minimumPayment ?? 0, [Validators.required, Validators.min(0)]],
    startDate: [this.data?.startDate ? new Date(this.data.startDate) : new Date(), Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.dialogRef.close({
      ...val,
      startDate: new Date(val.startDate!).toISOString(),
    });
  }
}
