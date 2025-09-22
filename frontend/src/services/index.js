import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export const categoryService = {
  async getAll(type) {
    const params = type ? { type } : {};
    const response = await api.get('/categories', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async create(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  async update(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/categories/stats');
    return response.data;
  }
};

export const transactionService = {
  async getAll(params = {}) {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async create(transactionData) {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  async update(id, transactionData) {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  async getStats(params = {}) {
    const response = await api.get('/transactions/stats', { params });
    return response.data;
  },

  async getMonthlyTrend(params = {}) {
    const response = await api.get('/transactions/trend', { params });
    return response.data;
  }
};

export const reportService = {
  async generateExcel(month, year) {
    const response = await api.get('/reports/excel', {
      params: { month, year }
    });
    return response.data;
  },

  async generatePDF(month, year) {
    const response = await api.get('/reports/pdf', {
      params: { month, year }
    });
    return response.data;
  },

  async list() {
    const response = await api.get('/reports/list');
    return response.data;
  },

  async delete(fileName) {
    const response = await api.delete(`/reports/${fileName}`);
    return response.data;
  }
};

export const dashboardService = {
  async getData(period = 'current') {
    const response = await api.get('/dashboard', {
      params: { period }
    });
    return response.data;
  },

  async getGoalsProgress() {
    const response = await api.get('/dashboard/goals');
    return response.data;
  }
};