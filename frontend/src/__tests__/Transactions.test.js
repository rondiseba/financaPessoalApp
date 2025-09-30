import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    id: '1',
    name: 'Alimentação',
    type: 'expense',
    color: '#FF5722'
  },
  {
    id: '2',
    name: 'Transporte',
    type: 'expense',
    color: '#FF9800'
  },
  {
    id: '3',
    name: 'Salário',
    type: 'income',
    color: '#4CAF50'
  }
];

const mockTransactions = [
  {
    id: '1',
    description: 'Supermercado',
    amount: 150.50,
    type: 'expense',
    date: '2025-09-30T10:00:00.000Z',
    categoryId: '1',
    category: {
      id: '1',
      name: 'Alimentação',
      color: '#FF5722'
    }
  },
  {
    id: '2',
    description: 'Combustível',
    amount: 80.00,
    type: 'expense',
    date: '2025-09-29T15:00:00.000Z',
    categoryId: '2',
    category: {
      id: '2',
      name: 'Transporte',
      color: '#FF9800'
    }
  },
  {
    id: '3',
    description: 'Salário',
    amount: 3000.00,
    type: 'income',
    date: '2025-09-01T08:00:00.000Z',
    categoryId: '3',
    category: {
      id: '3',
      name: 'Salário',
      color: '#4CAF50'
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

describe('Transactions Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    categoryService.getAll.mockResolvedValue({
      categories: mockCategories
    });
    
    transactionService.getAll.mockResolvedValue({
      transactions: mockTransactions,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 3,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false
      }
    });
  });

  describe('Renderização', () => {
    it('deve renderizar título e botão de nova transação', async () => {
      renderTransactions();

      expect(screen.getByText('Transações')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /nova transação/i })).toBeInTheDocument();
    });

    it('deve renderizar filtros', async () => {
      renderTransactions();

      await waitFor(() => {
        expect(screen.getByLabelText(/buscar/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      });
    });

    it('deve renderizar tabela com transações', async () => {
      renderTransactions();

      await waitFor(() => {
        expect(screen.getByText('Supermercado')).toBeInTheDocument();
        expect(screen.getByText('Combustível')).toBeInTheDocument();
        expect(screen.getByText('Salário')).toBeInTheDocument();
      });
    });
  });

  describe('Filtros', () => {
    it('deve filtrar por categoria', async () => {
      const user = userEvent.setup();
      renderTransactions();

      await waitFor(() => {
        expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      });

      // Selecionar categoria Alimentação
      const categorySelect = screen.getByLabelText(/categoria/i);
      await user.click(categorySelect);
      await user.click(screen.getByRole('option', { name: /alimentação/i }));

      await waitFor(() => {
        expect(transactionService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({
            categoryId: '1'
          })
        );
      });
    });

    it('deve filtrar por tipo', async () => {
      const user = userEvent.setup();
      renderTransactions();

      await waitFor(() => {
        expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
      });

      // Selecionar tipo Receitas
      const typeSelect = screen.getByLabelText(/tipo/i);
      await user.click(typeSelect);
      await user.click(screen.getByRole('option', { name: /receitas/i }));

      await waitFor(() => {
        expect(transactionService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'income'
          })
        );
      });
    });

    it('deve filtrar por busca', async () => {
      const user = userEvent.setup();
      renderTransactions();

      await waitFor(() => {
        expect(screen.getByLabelText(/buscar/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'supermercado');

      await waitFor(() => {
        expect(transactionService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'supermercado'
          })
        );
      });
    });

    it('deve limpar filtros', async () => {
      const user = userEvent.setup();
      renderTransactions();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument();
      });

      // Aplicar alguns filtros primeiro
      const searchInput = screen.getByLabelText(/buscar/i);
      await user.type(searchInput, 'teste');

      // Limpar filtros
      await user.click(screen.getByRole('button', { name: /limpar/i }));

      expect(searchInput).toHaveValue('');
      
      await waitFor(() => {
        expect(transactionService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({
            search: '',
            type: '',
            categoryId: ''
          })
        );
      });
    });
  });

  describe('Ações da Tabela', () => {
    it('deve abrir modal para nova transação', async () => {
      const user = userEvent.setup();
      renderTransactions();

      await user.click(screen.getByRole('button', { name: /nova transação/i }));

      await waitFor(() => {
        expect(screen.getByText('Nova Transação')).toBeInTheDocument();
        expect(screen.getByTestId('transaction-form')).toBeInTheDocument();
      });
    });

    it('deve abrir modal para editar transação', async () => {
      const user = userEvent.setup();
      renderTransactions();

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: '' })).toHaveLength(6); // 3 edit + 3 delete
      });

      // Clicar no primeiro botão de editar
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(button => button.querySelector('svg'));
      
      if (editButton) {
        await user.click(editButton);

        await waitFor(() => {
          expect(screen.getByText('Editar Transação')).toBeInTheDocument();
        });
      }
    });

    it('deve abrir dialog de confirmação para exclusão', async () => {
      const user = userEvent.setup();
      renderTransactions();

      await waitFor(() => {
        expect(screen.getByText('Supermercado')).toBeInTheDocument();
      });

      // Clicar no último botão (delete) da primeira linha
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons[deleteButtons.length - 1];
      
      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
        });
      }
    });

    it('deve deletar transação após confirmação', async () => {
      const user = userEvent.setup();
      transactionService.delete.mockResolvedValue({});
      
      renderTransactions();

      await waitFor(() => {
        expect(screen.getByText('Supermercado')).toBeInTheDocument();
      });

      // Simular clique no botão de delete e confirmar
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons[deleteButtons.length - 1];
      
      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /excluir/i });
        await user.click(confirmButton);

        await waitFor(() => {
          expect(transactionService.delete).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Paginação', () => {
    it('deve mostrar controles de paginação', async () => {
      renderTransactions();

      await waitFor(() => {
        expect(screen.getByText('Itens por página:')).toBeInTheDocument();
        expect(screen.getByText('1–3 of 3')).toBeInTheDocument();
      });
    });

    it('deve mudar número de itens por página', async () => {
      const user = userEvent.setup();
      renderTransactions();

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument(); // valor padrão
      });

      // Clicar no select de itens por página
      await user.click(screen.getByText('10'));
      await user.click(screen.getByText('25'));

      await waitFor(() => {
        expect(transactionService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({
            limit: 25
          })
        );
      });
    });
  });

  describe('Estados de Loading e Erro', () => {
    it('deve mostrar loading enquanto carrega dados', () => {
      transactionService.getAll.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderTransactions();

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });

    it('deve mostrar mensagem quando não há transações', async () => {
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

      await waitFor(() => {
        expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro quando carregamento falha', async () => {
      transactionService.getAll.mockRejectedValue(new Error('Erro no servidor'));

      renderTransactions();

      await waitFor(() => {
        expect(screen.getByText('Erro ao carregar transações')).toBeInTheDocument();
      });
    });
  });
});