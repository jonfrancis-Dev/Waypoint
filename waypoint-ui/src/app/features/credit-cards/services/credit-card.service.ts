import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreditCard, CreateCreditCardDto, UpdateCreditCardDto,
  CreditCardMetrics, CreditCardPayment, LogPaymentDto,
  CreditCardStatement, PayoffProjection, MultiCardPayoffComparison,
} from '../../../models/credit-card.model';

@Injectable({
  providedIn: 'root',
})
export class CreditCardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/creditcards';

  getCards(): Observable<CreditCard[]> {
    return this.http.get<CreditCard[]>(this.baseUrl);
  }

  getCard(id: string): Observable<CreditCard> {
    return this.http.get<CreditCard>(`${this.baseUrl}/${id}`);
  }

  createCard(dto: CreateCreditCardDto): Observable<CreditCard> {
    return this.http.post<CreditCard>(this.baseUrl, dto);
  }

  updateCard(id: string, dto: UpdateCreditCardDto): Observable<CreditCard> {
    return this.http.put<CreditCard>(`${this.baseUrl}/${id}`, dto);
  }

  deleteCard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getCardMetrics(id: string): Observable<CreditCardMetrics> {
    return this.http.get<CreditCardMetrics>(`${this.baseUrl}/${id}/metrics`);
  }

  getAllMetrics(): Observable<CreditCardMetrics[]> {
    return this.http.get<CreditCardMetrics[]>(`${this.baseUrl}/metrics/all`);
  }

  logPayment(cardId: string, dto: LogPaymentDto): Observable<CreditCardPayment> {
    return this.http.post<CreditCardPayment>(`${this.baseUrl}/${cardId}/payments`, dto);
  }

  getPaymentHistory(cardId: string): Observable<CreditCardPayment[]> {
    return this.http.get<CreditCardPayment[]>(`${this.baseUrl}/${cardId}/payments`);
  }

  getPayoffProjection(cardId: string, monthlyPayment: number): Observable<PayoffProjection> {
    return this.http.get<PayoffProjection>(`${this.baseUrl}/${cardId}/payoff`, {
      params: { monthlyPayment: monthlyPayment.toString() },
    });
  }

  getPayoffComparison(extraPayment: number): Observable<MultiCardPayoffComparison> {
    return this.http.get<MultiCardPayoffComparison>(`${this.baseUrl}/payoff-comparison`, {
      params: { extraPayment: extraPayment.toString() },
    });
  }
}
