import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import Transactions from '../pages/Transactions';
import { transactionService, categoryService } from '../services';

// Mock dos serviços
jest.mock('../services', () => ({
  transactionService: {
    getAll: jest.fn(),
    delete: jest.fn()
  },
  categoryService: {
    getAll: jest.fn()
  }
}));

// Mock do TransactionForm
jest.mock('../components/TransactionForm', () => {
  return function MockTransactionForm({ onSave, onCancel }) {
    return (
      <div data-testid="transaction-form">
        <button onClick={onSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

const mockCategories = [
  {
    id: 'cat1',
    name: 'Alimentação',
    type: 'expense',
    color: '#FF5722'
  },
  {
    id: 'cat2',
    name: 'Transporte',
    type: 'expense',
    color: '#FF9800'
  },
  {
    id: 'cat3',
    name: 'Salário',
    type: 'income',
    color: '#4CAF50'
  }
];

const mockTransactionsWithCategory = [
  {
    id: '1',
    description: 'Supermercado - Alimentação',
    amount: 150.50,
    type: 'expense',
    date: '2025-09-30T10:00:00.000Z',
    categoryId: 'cat1',
    category: {
      id: 'cat1',
      name: 'Alimentação',
      color: '#FF5722'
    }
  },
  {
    id: '2',
    description: 'Combustível - Transporte', 
    amount: 80.00,
    type: 'expense',
    date: '2025-09-29T15:00:00.000Z',
    categoryId: 'cat2',
    category: {
      id: 'cat2',
      name: 'Transporte',
      color: '#FF9800'
    }
  }
];

const mockTransactionsOnlyAlimentacao = [
  {
    id: '1',
    description: 'Supermercado - Alimentação',
    amount: 150.50,
    type: 'expense',
    date: '2025-09-30T10:00:00.000Z',
    categoryId: 'cat1',
    category: {
      id: 'cat1',
      name: 'Alimentação',
      color: '#FF5722'
    }
  }
];

const renderTransactions = () => {
  return render(
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Transactions />
      </LocalizationProvider>
    </BrowserRouter>
  );
};

describe('Category Filter Test - Diagnóstico do Problema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    categoryService.getAll.mockResolvedValue({
      categories: mockCategories
    });
  });

  it('deve carregar categorias corretamente', async () => {
    transactionService.getAll.mockResolvedValue({
      transactions: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false
      }
    });

    renderTransactions();

    // Aguardar carregamento das categorias
    await waitFor(() => {
      expect(categoryService.getAll).toHaveBeenCalled();
    });

    // Verificar se o select de categoria está presente
    const categorySelect = screen.getByLabelText(/categoria/i);
    expect(categorySelect).toBeInTheDocument();
  });

  it('deve mostrar todas as categorias no filtro', async () => {
    const user = userEvent.setup();
    
    transactionService.getAll.mockResolvedValue({
      transactions: mockTransactionsWithCategory,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false
      }
    });

    renderTransactions();

    // Aguardar carregamento
    await waitFor(() => {
      expect(screen.getByText('Supermercado - Alimentação')).toBeInTheDocument();
    });

    // Abrir select de categoria
    const categorySelect = screen.getByLabelText(/categoria/i);
    await user.click(categorySelect);

    // Verificar se todas as categorias estão listadas
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /todas/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /alimentação/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /transporte/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /salário/i })).toBeInTheDocument();
    });
  });

  it('deve aplicar filtro por categoria corretamente', async () => {
    const user = userEvent.setup();
    
    // Primeiro carregamento - todas as transações
    transactionService.getAll.mockResolvedValueOnce({
      transactions: mockTransactionsWithCategory,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false
      }
    });

    // Segunda chamada - após filtro
    transactionService.getAll.mockResolvedValueOnce({
      transactions: mockTransactionsOnlyAlimentacao,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false
      }
    });

    renderTransactions();

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByText('Supermercado - Alimentação')).toBeInTheDocument();
      expect(screen.getByText('Combustível - Transporte')).toBeInTheDocument();
    });

    // Verificar primeira chamada da API
    expect(transactionService.getAll).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 10,
      search: '',
      type: '',
      categoryId: '',
      startDate: null,
      endDate: null
    });

    // Selecionar categoria Alimentação
    const categorySelect = screen.getByLabelText(/categoria/i);
    await user.click(categorySelect);
    
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /alimentação/i })).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('option', { name: /alimentação/i }));

    // Verificar segunda chamada da API com filtro
    await waitFor(() => {
      expect(transactionService.getAll).toHaveBeenNthCalledWith(2, {
        page: 1,
        limit: 10,
        search: '',
        type: '',
        categoryId: 'cat1',
        startDate: null,
        endDate: null
      });
    });
  });

  it('deve resetar página ao aplicar filtro', async () => {
    const user = userEvent.setup();
    
    transactionService.getAll.mockResolvedValue({
      transactions: mockTransactionsWithCategory,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false
      }
    });

    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Supermercado - Alimentação')).toBeInTheDocument();
    });

    // Aplicar filtro de categoria
    const categorySelect = screen.getByLabelText(/categoria/i);
    await user.click(categorySelect);
    await user.click(screen.getByRole('option', { name: /alimentação/i }));

    // Verificar se a página foi resetada para 1
    await waitFor(() => {
      expect(transactionService.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          categoryId: 'cat1'
        })
      );
    });
  });

  it('deve preservar outros filtros ao alterar categoria', async () => {
    const user = userEvent.setup();
    
    transactionService.getAll.mockResolvedValue({
      transactions: mockTransactionsWithCategory,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false
      }
    });

    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Supermercado - Alimentação')).toBeInTheDocument();
    });

    // Aplicar filtro de busca primeiro
    const searchInput = screen.getByLabelText(/buscar/i);
    await user.type(searchInput, 'supermercado');

    // Aguardar chamada da API com busca
    await waitFor(() => {
      expect(transactionService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'supermercado'
        })
      );
    });

    // Aplicar filtro de categoria
    const categorySelect = screen.getByLabelText(/categoria/i);
    await user.click(categorySelect);
    await user.click(screen.getByRole('option', { name: /alimentação/i }));

    // Verificar se ambos os filtros estão presentes
    await waitFor(() => {
      expect(transactionService.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: 'supermercado',
          categoryId: 'cat1'
        })
      );
    });
  });

  it('deve limpar filtro de categoria corretamente', async () => {
    const user = userEvent.setup();
    
    transactionService.getAll.mockResolvedValue({
      transactions: mockTransactionsWithCategory,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false
      }
    });

    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Supermercado - Alimentação')).toBeInTheDocument();
    });

    // Aplicar filtro de categoria
    const categorySelect = screen.getByLabelText(/categoria/i);
    await user.click(categorySelect);
    await user.click(screen.getByRole('option', { name: /alimentação/i }));

    // Aguardar aplicação do filtro
    await waitFor(() => {
      expect(transactionService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: 'cat1'
        })
      );
    });

    // Limpar filtros
    await user.click(screen.getByRole('button', { name: /limpar/i }));

    // Verificar se filtro foi limpo
    await waitFor(() => {
      expect(transactionService.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          categoryId: ''
        })
      );
    });
  });
});