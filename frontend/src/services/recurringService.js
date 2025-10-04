import api from './api';

export const recurringService = {
  // Listar gastos fixos
  list: async () => {
    const response = await api.get('/recurring');
    return response.data;
  },

  // Criar gasto fixo
  create: async (data) => {
    const response = await api.post('/recurring', data);
    return response.data;
  },

  // Atualizar gasto fixo
  update: async (id, data) => {
    const response = await api.put(`/recurring/${id}`, data);
    return response.data;
  },

  // Deletar gasto fixo
  delete: async (id) => {
    const response = await api.delete(`/recurring/${id}`);
    return response.data;
  },

  // Registrar pagamento mensal
  registerPayment: async (id, data) => {
    const response = await api.post(`/recurring/${id}/payment`, data);
    return response.data;
  },

  // Buscar pendentes do mês
  getPending: async (month, year) => {
    const response = await api.get('/recurring/pending', {
      params: { month, year }
    });
    return response.data;
  }
};
