import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../../../models/transaction.model';
import { UploadBatch } from '../../../models/upload-batch.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/transactions';

  uploadCsv(file: File): Observable<UploadBatch> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<UploadBatch>(`${this.baseUrl}/upload`, formData);
  }

  getTransactions(month: number, year: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.baseUrl, {
      params: { month: month.toString(), year: year.toString() },
    });
  }
}
