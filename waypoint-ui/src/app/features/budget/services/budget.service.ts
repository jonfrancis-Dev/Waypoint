import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BudgetLineItem, BudgetPlan, BudgetSummary } from '../../../models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/budget';

  createOrUpdateBudget(month: number, year: number, lineItems: BudgetLineItem[]): Observable<BudgetPlan> {
    return this.http.post<BudgetPlan>(this.baseUrl, { month, year, lineItems });
  }

  getBudget(month: number, year: number): Observable<BudgetPlan> {
    return this.http.get<BudgetPlan>(this.baseUrl, {
      params: { month: month.toString(), year: year.toString() },
    });
  }

  getBudgetSummary(month: number, year: number): Observable<BudgetSummary> {
    return this.http.get<BudgetSummary>(`${this.baseUrl}/summary`, {
      params: { month: month.toString(), year: year.toString() },
    });
  }

  deleteBudget(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
