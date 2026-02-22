export interface UploadBatch {
  id: string;
  fileName: string;
  statementMonth: number;
  statementYear: number;
  transactionCount: number;
  uploadedAt: string;
}
