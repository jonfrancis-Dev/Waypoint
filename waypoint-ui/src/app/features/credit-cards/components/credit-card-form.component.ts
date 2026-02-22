import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CreditCard } from '../../../models/credit-card.model';

@Component({
  selector: 'app-credit-card-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit' : 'Add' }} Credit Card</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field>
          <mat-label>Card Name</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
        <mat-form-field>
          <mat-label>Credit Limit</mat-label>
          <input matInput type="number" formControlName="creditLimit" min="0">
          <span matTextPrefix>$&nbsp;</span>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Current Balance</mat-label>
          <input matInput type="number" formControlName="currentBalance" min="0">
          <span matTextPrefix>$&nbsp;</span>
        </mat-form-field>
        <mat-form-field>
          <mat-label>APR (%)</mat-label>
          <input matInput type="number" formControlName="apr" min="0" step="0.01">
        </mat-form-field>
        <mat-form-field>
          <mat-label>Statement Closing Day</mat-label>
          <input matInput type="number" formControlName="statementClosingDay" min="1" max="31">
        </mat-form-field>
        <mat-form-field>
          <mat-label>Payment Due Day</mat-label>
          <input matInput type="number" formControlName="dueDay" min="1" max="31">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!form.valid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    mat-form-field { width: 100%; }
  `],
})
export class CreditCardFormComponent {
  readonly data = inject<CreditCard | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject(MatDialogRef<CreditCardFormComponent>);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required],
    creditLimit: [this.data?.creditLimit ?? 0, [Validators.required, Validators.min(0)]],
    currentBalance: [this.data?.currentBalance ?? 0, [Validators.required, Validators.min(0)]],
    apr: [this.data?.apr ?? 0, [Validators.required, Validators.min(0)]],
    statementClosingDay: [this.data?.statementClosingDay ?? 15, [Validators.required, Validators.min(1), Validators.max(31)]],
    dueDay: [this.data?.dueDay ?? 1, [Validators.required, Validators.min(1), Validators.max(31)]],
  });

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
