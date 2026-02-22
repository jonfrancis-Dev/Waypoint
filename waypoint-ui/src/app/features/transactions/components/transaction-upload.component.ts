import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TransactionService } from '../services/transaction.service';
import { UploadBatch } from '../../../models/upload-batch.model';

@Component({
  selector: 'app-transaction-upload',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Upload Bank Statement</mat-card-title>
        <mat-card-subtitle>Upload a First Horizon CSV file</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="upload-area">
          <input type="file" accept=".csv" (change)="onFileSelected($event)" #fileInput hidden />
          <button mat-raised-button color="primary" (click)="fileInput.click()">
            <mat-icon>upload_file</mat-icon>
            Select CSV File
          </button>
          @if (selectedFile()) {
            <span class="file-name">{{ selectedFile()?.name }}</span>
          }
        </div>

        @if (selectedFile()) {
          <button mat-raised-button color="accent" (click)="upload()" [disabled]="uploading()">
            Upload
          </button>
        }

        @if (uploading()) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        }

        @if (error()) {
          <div class="error">{{ error() }}</div>
        }

        @if (result()) {
          <div class="result">
            <h3>Upload Complete</h3>
            <p><strong>File:</strong> {{ result()!.fileName }}</p>
            <p><strong>Transactions Imported:</strong> {{ result()!.transactionCount }}</p>
            <p><strong>Statement Period:</strong> {{ result()!.statementMonth }}/{{ result()!.statementYear }}</p>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .upload-area { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .file-name { font-style: italic; color: #666; }
    .error { color: red; margin-top: 12px; }
    .result { margin-top: 16px; padding: 12px; background: #e8f5e9; border-radius: 8px; }
  `],
})
export class TransactionUploadComponent {
  private readonly transactionService = inject(TransactionService);

  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  result = signal<UploadBatch | null>(null);
  error = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.result.set(null);
      this.error.set(null);
    }
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.error.set(null);

    this.transactionService.uploadCsv(file).subscribe({
      next: (batch) => {
        this.result.set(batch);
        this.uploading.set(false);
      },
      error: (err) => {
        this.error.set('Upload failed: ' + (err.error?.message || err.message));
        this.uploading.set(false);
      },
    });
  }
}
