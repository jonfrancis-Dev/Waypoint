import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Debt, CreateDebtDto, UpdateDebtDto, DebtMetrics,
  DebtPayment, LogDebtPaymentDto, DebtSummary, DebtPayoffProjection,
} from '../../../models/debt.model';

@Injectable({
  providedIn: 'root',
})
export class DebtService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/debts';

  getDebts(): Observable<Debt[]> {
    return this.http.get<Debt[]>(this.baseUrl);
  }

  getDebt(id: string): Observable<Debt> {
    return this.http.get<Debt>(`${this.baseUrl}/${id}`);
  }

  createDebt(dto: CreateDebtDto): Observable<Debt> {
    return this.http.post<Debt>(this.baseUrl, dto);
  }

  updateDebt(id: string, dto: UpdateDebtDto): Observable<Debt> {
    return this.http.put<Debt>(`${this.baseUrl}/${id}`, dto);
  }

  deleteDebt(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getDebtMetrics(id: string): Observable<DebtMetrics> {
    return this.http.get<DebtMetrics>(`${this.baseUrl}/${id}/metrics`);
  }

  getAllMetrics(): Observable<DebtMetrics[]> {
    return this.http.get<DebtMetrics[]>(`${this.baseUrl}/metrics/all`);
  }

  getSummary(): Observable<DebtSummary> {
    return this.http.get<DebtSummary>(`${this.baseUrl}/summary`);
  }

  logPayment(debtId: string, dto: LogDebtPaymentDto): Observable<DebtPayment> {
    return this.http.post<DebtPayment>(`${this.baseUrl}/${debtId}/payments`, dto);
  }

  getPaymentHistory(debtId: string): Observable<DebtPayment[]> {
    return this.http.get<DebtPayment[]>(`${this.baseUrl}/${debtId}/payments`);
  }

  getPayoffProjection(debtId: string, monthlyPayment: number): Observable<DebtPayoffProjection> {
    return this.http.get<DebtPayoffProjection>(`${this.baseUrl}/${debtId}/payoff`, {
      params: { monthlyPayment: monthlyPayment.toString() },
    });
  }
}
