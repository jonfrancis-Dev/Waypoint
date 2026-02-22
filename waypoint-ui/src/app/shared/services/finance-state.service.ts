import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MonthYear {
  month: number;
  year: number;
}

@Injectable({
  providedIn: 'root',
})
export class FinanceStateService {
  private readonly selectedMonthYear$ = new BehaviorSubject<MonthYear>(this.getCurrentMonthYear());

  getSelectedMonthYear() {
    return this.selectedMonthYear$.asObservable();
  }

  setSelectedMonthYear(month: number, year: number) {
    this.selectedMonthYear$.next({ month, year });
  }

  getCurrentMonthYear(): MonthYear {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  }

  getValue(): MonthYear {
    return this.selectedMonthYear$.getValue();
  }
}
