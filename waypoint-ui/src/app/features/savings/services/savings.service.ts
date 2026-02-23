import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SavingsGoal, CreateSavingsGoalDto, UpdateSavingsGoalDto,
  SavingsGoalProgress, SavingsContribution, LogContributionDto,
  SavingsSummary, SavingsProjection, SavingsRecommendation,
} from '../../../models/savings.model';

@Injectable({
  providedIn: 'root',
})
export class SavingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/savings';

  getGoals(): Observable<SavingsGoal[]> {
    return this.http.get<SavingsGoal[]>(this.baseUrl);
  }

  getGoal(id: string): Observable<SavingsGoal> {
    return this.http.get<SavingsGoal>(`${this.baseUrl}/${id}`);
  }

  createGoal(dto: CreateSavingsGoalDto): Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(this.baseUrl, dto);
  }

  updateGoal(id: string, dto: UpdateSavingsGoalDto): Observable<SavingsGoal> {
    return this.http.put<SavingsGoal>(`${this.baseUrl}/${id}`, dto);
  }

  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getGoalProgress(id: string): Observable<SavingsGoalProgress> {
    return this.http.get<SavingsGoalProgress>(`${this.baseUrl}/${id}/progress`);
  }

  getAllProgress(): Observable<SavingsGoalProgress[]> {
    return this.http.get<SavingsGoalProgress[]>(`${this.baseUrl}/progress/all`);
  }

  getSummary(): Observable<SavingsSummary> {
    return this.http.get<SavingsSummary>(`${this.baseUrl}/summary`);
  }

  logContribution(goalId: string, dto: LogContributionDto): Observable<SavingsContribution> {
    return this.http.post<SavingsContribution>(`${this.baseUrl}/${goalId}/contribute`, dto);
  }

  getContributions(goalId: string): Observable<SavingsContribution[]> {
    return this.http.get<SavingsContribution[]>(`${this.baseUrl}/${goalId}/contributions`);
  }

  getProjection(goalId: string, monthlyContribution: number): Observable<SavingsProjection> {
    return this.http.get<SavingsProjection>(`${this.baseUrl}/${goalId}/projection`, {
      params: { monthlyContribution: monthlyContribution.toString() },
    });
  }

  getRecommendations(availableIncome?: number): Observable<SavingsRecommendation[]> {
    const params: Record<string, string> = {};
    if (availableIncome !== undefined) params['availableIncome'] = availableIncome.toString();
    return this.http.get<SavingsRecommendation[]>(`${this.baseUrl}/recommendations`, { params });
  }
}
