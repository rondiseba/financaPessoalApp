import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import TransactionForm from '../components/TransactionForm';
import { transactionService } from '../services';

// Mock do serviço de transações
jest.mock('../services', () => ({
  transactionService: {
    create: jest.fn(),
    update: jest.fn()
  }
}));

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

const renderTransactionForm = (props = {}) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <TransactionForm
        categories={mockCategories}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        {...props}
      />
    </LocalizationProvider>
  );
};

describe('TransactionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar todos os campos obrigatórios', () => {
      renderTransactionForm();

      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data/i)).toBeInTheDocument();
      expect(screen.getByText(/receita/i)).toBeInTheDocument();
      expect(screen.getByText(/despesa/i)).toBeInTheDocument();
    });

    it('deve renderizar botões de ação', () => {
      renderTransactionForm();

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument();
    });

    it('deve filtrar categorias por tipo', async () => {
      const user = userEvent.setup();
      renderTransactionForm();

      // Por padrão, tipo é "expense"
      const categorySelect = screen.getByLabelText(/categoria/i);
      await user.click(categorySelect);

      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.getByText('Transporte')).toBeInTheDocument();
      expect(screen.queryByText('Salário')).not.toBeInTheDocument();

      // Mudar para "income"
      await user.click(screen.getByLabelText(/receita/i));
      await user.click(categorySelect);

      expect(screen.getByText('Salário')).toBeInTheDocument();
      expect(screen.queryByText('Alimentação')).not.toBeInTheDocument();
    });
  });

  describe('Validação', () => {
    it('deve mostrar erro para campos obrigatórios vazios', async () => {
      const user = userEvent.setup();
      renderTransactionForm();

      const submitButton = screen.getByRole('button', { name: /criar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument();
        expect(screen.getByText(/valor deve ser maior que zero/i)).toBeInTheDocument();
        expect(screen.getByText(/categoria é obrigatória/i)).toBeInTheDocument();
      });
    });

    it('deve validar valor positivo', async () => {
      const user = userEvent.setup();
      renderTransactionForm();

      const amountInput = screen.getByLabelText(/valor/i);
      await user.type(amountInput, '-10');

      const submitButton = screen.getByRole('button', { name: /criar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/valor deve ser maior que zero/i)).toBeInTheDocument();
      });
    });

    it('deve limpar erros quando campo é corrigido', async () => {
      const user = userEvent.setup();
      renderTransactionForm();

      // Submeter formulário vazio para gerar erros
      const submitButton = screen.getByRole('button', { name: /criar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument();
      });

      // Corrigir o campo
      const descriptionInput = screen.getByLabelText(/descrição/i);
      await user.type(descriptionInput, 'Teste');

      await waitFor(() => {
        expect(screen.queryByText(/descrição é obrigatória/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Criação de Transação', () => {
    it('deve criar transação com dados válidos', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn();
      
      transactionService.create.mockResolvedValue({
        transaction: { id: '1', description: 'Teste' }
      });

      renderTransactionForm({ onSave: mockOnSave });

      // Preencher formulário
      await user.type(screen.getByLabelText(/descrição/i), 'Supermercado');
      await user.type(screen.getByLabelText(/valor/i), '150.50');
      
      // Selecionar categoria
      await user.click(screen.getByLabelText(/categoria/i));
      await user.click(screen.getByText('Alimentação'));

      // Submeter
      await user.click(screen.getByRole('button', { name: /criar/i }));

      await waitFor(() => {
        expect(transactionService.create).toHaveBeenCalledWith({
          description: 'Supermercado',
          amount: 150.50,
          type: 'expense',
          date: expect.any(String),
          categoryId: '1'
        });
      });

      // Verificar se callback foi chamado após sucesso
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('deve mostrar erro se criação falhar', async () => {
      const user = userEvent.setup();
      
      transactionService.create.mockRejectedValue({
        response: { data: { error: 'Erro no servidor' } }
      });

      renderTransactionForm();

      // Preencher formulário válido
      await user.type(screen.getByLabelText(/descrição/i), 'Teste');
      await user.type(screen.getByLabelText(/valor/i), '100');
      await user.click(screen.getByLabelText(/categoria/i));
      await user.click(screen.getByText('Alimentação'));

      await user.click(screen.getByRole('button', { name: /criar/i }));

      await waitFor(() => {
        expect(screen.getByText(/erro no servidor/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edição de Transação', () => {
    const mockTransaction = {
      id: '1',
      description: 'Transação Existente',
      amount: 75.25,
      type: 'expense',
      date: '2025-09-30T10:00:00.000Z',
      categoryId: '1'
    };

    it('deve carregar dados da transação para edição', () => {
      renderTransactionForm({ transaction: mockTransaction });

      expect(screen.getByDisplayValue('Transação Existente')).toBeInTheDocument();
      expect(screen.getByDisplayValue('75.25')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument();
    });

    it('deve atualizar transação existente', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn();
      
      transactionService.update.mockResolvedValue({
        transaction: { ...mockTransaction, description: 'Atualizada' }
      });

      renderTransactionForm({ 
        transaction: mockTransaction, 
        onSave: mockOnSave 
      });

      // Modificar descrição
      const descriptionInput = screen.getByDisplayValue('Transação Existente');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Transação Atualizada');

      await user.click(screen.getByRole('button', { name: /atualizar/i }));

      await waitFor(() => {
        expect(transactionService.update).toHaveBeenCalledWith('1', {
          description: 'Transação Atualizada',
          amount: 75.25,
          type: 'expense',
          date: expect.any(String),
          categoryId: '1'
        });
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Interações de UI', () => {
    it('deve limpar categoria ao mudar tipo', async () => {
      const user = userEvent.setup();
      renderTransactionForm();

      // Selecionar categoria de despesa
      await user.click(screen.getByLabelText(/categoria/i));
      await user.click(screen.getByText('Alimentação'));

      // Mudar para receita
      await user.click(screen.getByLabelText(/receita/i));

      // Categoria deve estar limpa
      expect(screen.getByLabelText(/categoria/i)).toHaveValue('');
    });

    it('deve chamar onCancel ao clicar em cancelar', async () => {
      const user = userEvent.setup();
      const mockOnCancel = jest.fn();
      
      renderTransactionForm({ onCancel: mockOnCancel });

      await user.click(screen.getByRole('button', { name: /cancelar/i }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('deve desabilitar campos durante carregamento', async () => {
      const user = userEvent.setup();
      
      // Mock para retardar resposta
      transactionService.create.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderTransactionForm();

      // Preencher e submeter
      await user.type(screen.getByLabelText(/descrição/i), 'Teste');
      await user.type(screen.getByLabelText(/valor/i), '100');
      await user.click(screen.getByLabelText(/categoria/i));
      await user.click(screen.getByText('Alimentação'));

      await user.click(screen.getByRole('button', { name: /criar/i }));

      // Verificar se botão está em estado de carregamento
      expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
    });
  });
});