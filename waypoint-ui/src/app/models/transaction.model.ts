export interface Transaction {
  id: string;
  date: string;
  description: string;
  originalCategory: string;
  category: string;
  amount: number;
  isDebit: boolean;
}
