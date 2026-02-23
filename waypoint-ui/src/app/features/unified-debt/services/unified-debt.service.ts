import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnifiedDebtDashboard, UnifiedPayoffComparison } from '../../../models/debt.model';

@Injectable({
  providedIn: 'root',
})
export class UnifiedDebtService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/debts/unified';

  getDashboard(): Observable<UnifiedDebtDashboard> {
    return this.http.get<UnifiedDebtDashboard>(`${this.baseUrl}/dashboard`);
  }

  getPayoffComparison(extraPayment: number): Observable<UnifiedPayoffComparison> {
    return this.http.get<UnifiedPayoffComparison>(`${this.baseUrl}/payoff-comparison`, {
      params: { extraPayment: extraPayment.toString() },
    });
  }
}
