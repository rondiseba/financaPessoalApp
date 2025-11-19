/**
 * Format a number as Brazilian Real currency
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Format a date to Brazilian short format (DD/MM/YY)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string (e.g., "13/11/25")
 */
export const formatDate = (date: string | Date | number): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

/**
 * Format a date to Brazilian long format with time
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date and time string (e.g., "13/11/2025, 14:30:00")
 */
export const formatDateTime = (date: string | Date | number): string => {
  return new Date(date).toLocaleString('pt-BR');
};

/**
 * Get month name in Portuguese from month number
 * @param month - Month number (1-12)
 * @returns Month name in Portuguese
 */
export const getMonthName = (month: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  if (month < 1 || month > 12) {
    console.warn(`Invalid month number: ${month}. Returning empty string.`);
    return '';
  }
  
  return months[month - 1];
};

/**
 * Get current month number (1-12)
 * @returns Current month number
 */
export const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1;
};

/**
 * Get current year
 * @returns Current year (e.g., 2025)
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength (minimum 6 characters)
 * @param password - Password string to validate
 * @returns True if password is valid, false otherwise
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Get color by transaction type
 * @param type - Transaction type ('income' or 'expense')
 * @returns Hex color string
 */
export const getColorByType = (type: 'income' | 'expense'): string => {
  return type === 'income' ? '#4CAF50' : '#F44336';
};

/**
 * Get transaction type label in Portuguese
 * @param type - Transaction type ('income' or 'expense')
 * @returns Label in Portuguese ('Receita' or 'Despesa')
 */
export const getTransactionTypeLabel = (type: 'income' | 'expense'): string => {
  return type === 'income' ? 'Receita' : 'Despesa';
};

/**
 * Calculate percentage of a value relative to total
 * @param value - The value
 * @param total - The total
 * @returns Percentage as integer (0-100)
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Parse string to number, handling Brazilian format
 * @param value - String value to parse (e.g., "1.234,56")
 * @returns Parsed number
 */
export const parseCurrencyString = (value: string): number => {
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Check if date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: string | Date | number): boolean => {
  const d = new Date(date);
  const today = new Date();
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

/**
 * Check if date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export const isPast = (date: string | Date | number): boolean => {
  const d = new Date(date);
  const now = new Date();
  return d < now;
};

/**
 * Get days difference between two dates
 * @param date1 - First date
 * @param date2 - Second date (defaults to today)
 * @returns Number of days difference
 */
export const getDaysDifference = (date1: string | Date | number, date2: string | Date | number = new Date()): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
