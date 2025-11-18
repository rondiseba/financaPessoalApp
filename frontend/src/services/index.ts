import api from './api';
import {
  LoginResponse,
  RegisterResponse,
  User,
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryStats,
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
  TransactionStatsResponse,
  TrendData,
  GenerateReportResponse,
  ReportFile,
  DashboardDataResponse,
  DashboardPeriodParams,
  RecurringTransaction,
  CreateRecurringDTO,
  UpdateRecurringDTO,
  RegisterPaymentDTO,
  PendingRecurringResponse,
  GoalProgress
} from '../types';
import { AxiosResponse } from 'axios';

// ==================== AUTH SERVICE ====================

export const authService = {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register new user
   */
  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    const response: AxiosResponse<RegisterResponse> = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Logout user and redirect to login
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  /**
   * Get user data from localStorage
   */
  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// ==================== CATEGORY SERVICE ====================

export const categoryService = {
  /**
   * Get all categories, optionally filtered by type
   */
  async getAll(type?: 'income' | 'expense'): Promise<Category[]> {
    const params = type ? { type } : {};
    const response: AxiosResponse<Category[]> = await api.get('/categories', { params });
    return response.data;
  },

  /**
   * Get category by ID
   */
  async getById(id: string): Promise<Category> {
    const response: AxiosResponse<Category> = await api.get(`/categories/${id}`);
    return response.data;
  },

  /**
   * Create new category
   */
  async create(categoryData: CreateCategoryDTO): Promise<Category> {
    const response: AxiosResponse<Category> = await api.post('/categories', categoryData);
    return response.data;
  },

  /**
   * Update existing category
   */
  async update(id: string, categoryData: UpdateCategoryDTO): Promise<Category> {
    const response: AxiosResponse<Category> = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  /**
   * Delete category
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },

  /**
   * Get category statistics
   */
  async getStats(): Promise<CategoryStats[]> {
    const response: AxiosResponse<CategoryStats[]> = await api.get('/categories/stats');
    return response.data;
  }
};

// ==================== TRANSACTION SERVICE ====================

export const transactionService = {
  /**
   * Get all transactions with optional filters
   */
  async getAll(params: TransactionFilters = {}): Promise<Transaction[]> {
    const response: AxiosResponse<Transaction[]> = await api.get('/transactions', { params });
    return response.data;
  },

  /**
   * Get transaction by ID
   */
  async getById(id: string): Promise<Transaction> {
    const response: AxiosResponse<Transaction> = await api.get(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Create new transaction
   */
  async create(transactionData: CreateTransactionDTO): Promise<Transaction> {
    const response: AxiosResponse<Transaction> = await api.post('/transactions', transactionData);
    return response.data;
  },

  /**
   * Update existing transaction
   */
  async update(id: string, transactionData: UpdateTransactionDTO): Promise<Transaction> {
    const response: AxiosResponse<Transaction> = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  /**
   * Delete transaction
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  /**
   * Get transaction statistics
   */
  async getStats(params: TransactionFilters = {}): Promise<TransactionStatsResponse> {
    const response: AxiosResponse<TransactionStatsResponse> = await api.get('/transactions/stats', { params });
    return response.data;
  },

  /**
   * Get monthly trend data
   */
  async getMonthlyTrend(params: TransactionFilters = {}): Promise<TrendData[]> {
    const response: AxiosResponse<TrendData[]> = await api.get('/transactions/trend', { params });
    return response.data;
  }
};

// ==================== REPORT SERVICE ====================

export const reportService = {
  /**
   * Generate Excel report for specified month/year
   */
  async generateExcel(month: number, year: number): Promise<GenerateReportResponse> {
    const response: AxiosResponse<GenerateReportResponse> = await api.get('/reports/excel', {
      params: { month, year }
    });
    return response.data;
  },

  /**
   * Generate PDF report for specified month/year
   */
  async generatePDF(month: number, year: number): Promise<GenerateReportResponse> {
    const response: AxiosResponse<GenerateReportResponse> = await api.get('/reports/pdf', {
      params: { month, year }
    });
    return response.data;
  },

  /**
   * List all generated reports
   */
  async list(): Promise<ReportFile[]> {
    const response: AxiosResponse<ReportFile[]> = await api.get('/reports/list');
    return response.data;
  },

  /**
   * Delete report file
   */
  async delete(fileName: string): Promise<void> {
    await api.delete(`/reports/${fileName}`);
  }
};

// ==================== DASHBOARD SERVICE ====================

export const dashboardService = {
  /**
   * Get dashboard data for specified period
   */
  async getData(period: DashboardPeriodParams['period'] = 'current'): Promise<DashboardDataResponse> {
    const response: AxiosResponse<DashboardDataResponse> = await api.get('/dashboard', {
      params: { period }
    });
    return response.data;
  },

  /**
   * Get goals progress
   */
  async getGoalsProgress(): Promise<GoalProgress[]> {
    const response: AxiosResponse<GoalProgress[]> = await api.get('/dashboard/goals');
    return response.data;
  }
};

// ==================== RECURRING SERVICE ====================

export const recurringService = {
  /**
   * List all recurring transactions
   */
  async list(): Promise<RecurringTransaction[]> {
    const response: AxiosResponse<RecurringTransaction[]> = await api.get('/recurring');
    return response.data;
  },

  /**
   * Create new recurring transaction
   */
  async create(data: CreateRecurringDTO): Promise<RecurringTransaction> {
    const response: AxiosResponse<RecurringTransaction> = await api.post('/recurring', data);
    return response.data;
  },

  /**
   * Update recurring transaction
   */
  async update(id: string, data: UpdateRecurringDTO): Promise<RecurringTransaction> {
    const response: AxiosResponse<RecurringTransaction> = await api.put(`/recurring/${id}`, data);
    return response.data;
  },

  /**
   * Delete recurring transaction
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/recurring/${id}`);
  },

  /**
   * Register payment for recurring transaction
   */
  async registerPayment(id: string, data: RegisterPaymentDTO): Promise<Transaction> {
    const response: AxiosResponse<Transaction> = await api.post(`/recurring/${id}/payment`, data);
    return response.data;
  },

  /**
   * Get pending recurring transactions for month/year
   */
  async getPending(month: number, year: number): Promise<PendingRecurringResponse> {
    const response: AxiosResponse<PendingRecurringResponse> = await api.get('/recurring/pending', {
      params: { month, year }
    });
    return response.data;
  }
};
