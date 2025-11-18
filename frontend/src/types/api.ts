import { User, Transaction, Category, DashboardStats, RecurringTransaction, ReportFile, CategoryStats, TrendData } from './models';

// ==================== AUTH API ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

// ==================== TRANSACTION API ====================

export interface CreateTransactionDTO {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date?: string | Date;
  categoryId: string;
  isRecurring?: boolean;
  recurringDay?: number;
}

export interface UpdateTransactionDTO extends Partial<CreateTransactionDTO> {
  id?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface TransactionStatsResponse {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  count: number;
  byCategory: CategoryStats[];
}

// ==================== CATEGORY API ====================

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  color: string;
  type: 'income' | 'expense';
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
  id?: string;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
}

// ==================== DASHBOARD API ====================

export interface DashboardDataResponse {
  stats: DashboardStats;
  recentTransactions: Transaction[];
  monthlyTrend: TrendData[];
  categoryBreakdown: CategoryStats[];
}

export interface DashboardPeriodParams {
  period?: 'current' | 'last30' | 'last90' | 'year';
  startDate?: string;
  endDate?: string;
}

// ==================== REPORT API ====================

export interface GenerateReportParams {
  month: number;
  year: number;
  format: 'pdf' | 'excel';
}

export interface GenerateReportResponse {
  fileName: string;
  url: string;
  size: number;
  createdAt: string;
}

export interface ReportListResponse {
  reports: ReportFile[];
  total: number;
}

// ==================== RECURRING API ====================

export interface CreateRecurringDTO {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  recurringDay: number;
}

export interface UpdateRecurringDTO extends Partial<CreateRecurringDTO> {
  id?: string;
}

export interface RegisterPaymentDTO {
  date?: string | Date;
  amount?: number;
}

export interface GenerateReportResponse {
  message: string;
  filename: string;
  path: string;
  downloadUrl: string;
}

export interface PendingRecurringResponse {
  pending: RecurringTransaction[];
  month: number;
  year: number;
}

// ==================== COMMON API ====================

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
  statusCode?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== AXIOS CONFIG ====================

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestConfig {
  params?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}
