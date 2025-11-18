// ==================== MODELS ====================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  type: 'income' | 'expense';
  userId: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string | Date;
  categoryId: string;
  userId: string;
  isRecurring: boolean;
  recurringDay?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  category?: Category;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  userId: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface RecurringTransaction extends Transaction {
  isRecurring: true;
  recurringDay: number;
}

export interface ReportFile {
  id: string;
  filename: string;
  path: string;
  type: 'PDF' | 'EXCEL';
  downloadUrl: string;
  month: number;
  year: number;
  userId: string;
  createdAt: string | Date;
}

// ==================== CHART DATA ====================

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  tension?: number;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// ==================== FILTER & PAGINATION ====================

export interface TransactionFilters {
  type?: 'income' | 'expense' | 'all';
  categoryId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  search?: string;
  isRecurring?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== STATISTICS ====================

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  categoryCount?: number;
  recurringCount?: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  color: string;
}

export interface TrendData {
  period: string;
  income: number;
  expense: number;
  balance: number;
}

// ==================== GOALS ====================

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | Date;
  categoryId?: string;
  userId: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string | Date;
}

export interface GoalProgress {
  goal: Goal;
  percentage: number;
  remaining: number;
  daysRemaining: number;
}

// ==================== REPORT ====================

export interface ReportFile {
  fileName: string;
  displayName: string;
  size: number;
  format: 'pdf' | 'excel';
  createdAt: string | Date;
  month: number;
  year: number;
}

export interface ReportParams {
  month: number;
  year: number;
  type?: 'income' | 'expense' | 'all';
  categoryId?: string;
}
