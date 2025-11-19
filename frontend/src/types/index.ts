// Re-export all types for easier imports
export * from './models';
export * from './api';

// ==================== COMPONENT PROPS ====================

import { ReactNode } from 'react';
import { SvgIconComponent } from '@mui/icons-material';

export interface LayoutProps {
  children: ReactNode;
}

export interface PrivateRouteProps {
  children: ReactNode;
}

export interface GlassStatCardProps {
  title: string;
  value: string | number;
  icon: SvgIconComponent;
  gradient: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface EmptyStateProps {
  icon: SvgIconComponent;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface CustomLoaderProps {
  message?: string;
  size?: number;
}

export interface TransactionFormProps {
  transaction?: any;
  onSubmit: (data: any) => void | Promise<void>;
  onCancel: () => void;
  categories: any[];
  loading?: boolean;
}

// ==================== FORM TYPES ====================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface TransactionFormData {
  description: string;
  amount: string | number;
  type: 'income' | 'expense';
  date: string | Date;
  categoryId: string;
  isRecurring: boolean;
  recurringDay: string | number;
}

export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  type: 'income' | 'expense';
}

export interface FormErrors {
  [key: string]: string;
}

// ==================== COLOR MODE ====================

export type ColorMode = 'light' | 'dark';

export interface ColorModeContextType {
  mode: ColorMode;
  toggleColorMode: () => void;
}

// ==================== THEME ====================

export interface ThemeGradient {
  primary: string;
  income: string;
  expense: string;
  balance: string;
  transaction: string;
}

export interface CustomTheme {
  gradients: ThemeGradient;
}

// ==================== MENU ITEMS ====================

export interface MenuItem {
  text: string;
  icon: SvgIconComponent;
  path: string;
  badge?: number;
}

// ==================== TABLE ====================

export interface TableColumn<T = any> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string | ReactNode;
}

export interface TablePagination {
  page: number;
  rowsPerPage: number;
  total: number;
}

// ==================== CHART ====================

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio?: boolean;
  plugins?: any;
  scales?: any;
}

// ==================== VALIDATION ====================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}
