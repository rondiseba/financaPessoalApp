const { PrismaClient } = require('@prisma/client');
const moment = require('moment');

const prisma = new PrismaClient();

class RecurringController {
  // Listar gastos fixos
  async list(req, res) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId,
          isRecurring: true
        },
        include: {
          category: true
        },
        orderBy: [
          { recurringDay: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      res.json({ transactions });
    } catch (error) {
      console.error('Erro ao listar gastos fixos:', error);
      res.status(500).json({ error: 'Erro ao listar gastos fixos' });
    }
  }

  // Criar gasto fixo
  async create(req, res) {
    try {
      const { description, amount, categoryId, recurringDay, type } = req.body;

      // Validações
      if (!description || !amount || !categoryId || !recurringDay) {
        return res.status(400).json({ 
          error: 'Descrição, valor, categoria e dia são obrigatórios' 
        });
      }

      if (recurringDay < 1 || recurringDay > 31) {
        return res.status(400).json({ 
          error: 'Dia deve ser entre 1 e 31' 
        });
      }

      // Verificar se a categoria existe
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Criar a primeira transação com data atual
      const currentDate = moment().date(recurringDay).toDate();

      const transaction = await prisma.transaction.create({
        data: {
          description,
          amount: parseFloat(amount),
          type: type || 'expense',
          date: currentDate,
          categoryId,
          userId: req.userId,
          isRecurring: true,
          recurringDay: parseInt(recurringDay)
        },
        include: {
          category: true
        }
      });

      res.status(201).json(transaction);
    } catch (error) {
      console.error('Erro ao criar gasto fixo:', error);
      res.status(500).json({ error: 'Erro ao criar gasto fixo' });
    }
  }

  // Atualizar gasto fixo
  async update(req, res) {
    try {
      const { id } = req.params;
      const { description, amount, categoryId, recurringDay } = req.body;

      // Verificar se o gasto fixo existe e pertence ao usuário
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: req.userId,
          isRecurring: true
        }
      });

      if (!existingTransaction) {
        return res.status(404).json({ error: 'Gasto fixo não encontrado' });
      }

      // Atualizar
      const transaction = await prisma.transaction.update({
        where: { id },
        data: {
          description,
          amount: amount ? parseFloat(amount) : undefined,
          categoryId,
          recurringDay: recurringDay ? parseInt(recurringDay) : undefined
        },
        include: {
          category: true
        }
      });

      res.json(transaction);
    } catch (error) {
      console.error('Erro ao atualizar gasto fixo:', error);
      res.status(500).json({ error: 'Erro ao atualizar gasto fixo' });
    }
  }

  // Deletar gasto fixo
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o gasto fixo existe e pertence ao usuário
      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: req.userId,
          isRecurring: true
        }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Gasto fixo não encontrado' });
      }

      await prisma.transaction.delete({
        where: { id }
      });

      res.json({ message: 'Gasto fixo excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir gasto fixo:', error);
      res.status(500).json({ error: 'Erro ao excluir gasto fixo' });
    }
  }

  // Registrar pagamento mensal de um gasto fixo
  async registerPayment(req, res) {
    try {
      const { id } = req.params;
      const { amount, date } = req.body;

      // Buscar gasto fixo
      const recurringTransaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: req.userId,
          isRecurring: true
        },
        include: {
          category: true
        }
      });

      if (!recurringTransaction) {
        return res.status(404).json({ error: 'Gasto fixo não encontrado' });
      }

      // Criar nova transação para o mês atual
      const paymentDate = date ? moment(date).toDate() : moment().toDate();

      const payment = await prisma.transaction.create({
        data: {
          description: `${recurringTransaction.description} - ${moment(paymentDate).format('MM/YYYY')}`,
          amount: amount ? parseFloat(amount) : recurringTransaction.amount,
          type: recurringTransaction.type,
          date: paymentDate,
          categoryId: recurringTransaction.categoryId,
          userId: req.userId,
          isRecurring: false // Pagamento não é recorrente
        },
        include: {
          category: true
        }
      });

      res.status(201).json(payment);
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      res.status(500).json({ error: 'Erro ao registrar pagamento' });
    }
  }

  // Verificar pagamentos pendentes do mês
  async getPending(req, res) {
    try {
      const { month, year } = req.query;
      
      const currentMonth = month ? parseInt(month) : moment().month() + 1;
      const currentYear = year ? parseInt(year) : moment().year();

      // Buscar todos os gastos fixos do usuário
      const recurringTransactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId,
          isRecurring: true
        },
        include: {
          category: true
        }
      });

      // Verificar quais já foram pagos no mês
      const startDate = moment().year(currentYear).month(currentMonth - 1).startOf('month').toDate();
      const endDate = moment().year(currentYear).month(currentMonth - 1).endOf('month').toDate();

      const pending = [];

      for (const recurring of recurringTransactions) {
        // Buscar se existe pagamento no mês
        const payment = await prisma.transaction.findFirst({
          where: {
            userId: req.userId,
            categoryId: recurring.categoryId,
            description: {
              contains: recurring.description
            },
            date: {
              gte: startDate,
              lte: endDate
            },
            isRecurring: false
          }
        });

        if (!payment) {
          pending.push({
            ...recurring,
            dueDate: moment().year(currentYear).month(currentMonth - 1).date(recurring.recurringDay).toDate()
          });
        }
      }

      res.json({ pending });
    } catch (error) {
      console.error('Erro ao buscar pendentes:', error);
      res.status(500).json({ error: 'Erro ao buscar pendentes' });
    }
  }
}

module.exports = new RecurringController();
