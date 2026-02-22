import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BudgetLineItem } from '../../../models/budget.model';

const DEFAULT_CATEGORIES = [
  'Groceries', 'Restaurants', 'Gas & Fuel', 'Utilities',
  'Entertainment', 'Shopping', 'Healthcare', 'Transportation',
];

@Component({
  selector: 'app-category-limit-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div formArrayName="lineItems">
        @for (item of lineItemsArray.controls; track item; let i = $index) {
          <div class="row" [formGroupName]="i">
            <mat-form-field class="category-field">
              <mat-label>Category</mat-label>
              <input matInput formControlName="categoryName">
            </mat-form-field>
            <mat-form-field class="amount-field">
              <mat-label>Limit</mat-label>
              <input matInput type="number" formControlName="limitAmount" min="0">
              <span matTextPrefix>$&nbsp;</span>
            </mat-form-field>
            <button mat-icon-button type="button" color="warn" (click)="removeRow(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        }
      </div>
      <div class="actions">
        <button mat-stroked-button type="button" (click)="addRow()">
          <mat-icon>add</mat-icon> Add Category
        </button>
        <button mat-flat-button color="primary" type="submit" [disabled]="!form.valid">
          Save Budget
        </button>
      </div>
    </form>
  `,
  styles: [`
    .row { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
    .category-field { flex: 2; }
    .amount-field { flex: 1; }
    .actions { display: flex; gap: 16px; margin-top: 16px; }
  `],
})
export class CategoryLimitFormComponent implements OnChanges {
  @Input() existingItems: BudgetLineItem[] | null = null;
  @Output() save = new EventEmitter<BudgetLineItem[]>();

  private readonly fb = new FormBuilder();
  form = this.fb.group({
    lineItems: this.fb.array<FormGroup>([]),
  });

  get lineItemsArray(): FormArray<FormGroup> {
    return this.form.get('lineItems') as FormArray<FormGroup>;
  }

  ngOnChanges() {
    this.lineItemsArray.clear();
    if (this.existingItems?.length) {
      this.existingItems.forEach(item => this.addRow(item.categoryName, item.limitAmount));
    } else {
      DEFAULT_CATEGORIES.forEach(cat => this.addRow(cat, 0));
    }
  }

  addRow(categoryName = '', limitAmount = 0) {
    this.lineItemsArray.push(this.fb.group({
      categoryName: [categoryName, Validators.required],
      limitAmount: [limitAmount, [Validators.required, Validators.min(0)]],
    }));
  }

  removeRow(index: number) {
    this.lineItemsArray.removeAt(index);
  }

  onSubmit() {
    if (this.form.valid) {
      this.save.emit(this.lineItemsArray.value as BudgetLineItem[]);
    }
  }
}
