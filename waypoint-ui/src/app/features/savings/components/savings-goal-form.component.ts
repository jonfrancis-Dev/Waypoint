import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SavingsGoal } from '../../../models/savings.model';

@Component({
  selector: 'app-savings-goal-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit' : 'Create' }} Savings Goal</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-col">
        <mat-form-field>
          <mat-label>Goal Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Emergency Fund">
        </mat-form-field>

        <mat-form-field>
          <mat-label>Target Amount</mat-label>
          <input matInput type="number" formControlName="targetAmount" min="0">
          <span matTextPrefix>$&nbsp;</span>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Current Amount</mat-label>
          <input matInput type="number" formControlName="currentAmount" min="0">
          <span matTextPrefix>$&nbsp;</span>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Target Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="targetDate">
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
    .form-col { display: flex; flex-direction: column; gap: 4px; min-width: 400px; }
  `],
})
export class SavingsGoalFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SavingsGoalFormComponent>);
  readonly data: SavingsGoal | null = inject(MAT_DIALOG_DATA, { optional: true });

  private defaultDate = new Date();

  form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required],
    targetAmount: [this.data?.targetAmount ?? 0, [Validators.required, Validators.min(1)]],
    currentAmount: [this.data?.currentAmount ?? 0, [Validators.required, Validators.min(0)]],
    targetDate: [this.data?.targetDate ? new Date(this.data.targetDate) : new Date(this.defaultDate.setFullYear(this.defaultDate.getFullYear() + 1)), Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.dialogRef.close({
      ...val,
      targetDate: new Date(val.targetDate!).toISOString(),
    });
  }
}
