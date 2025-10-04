const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');

const prisma = new PrismaClient();
const transactionSchema = Joi.object({
  description: Joi.string().min(1).max(255).required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  date: Joi.date().optional().allow(null),
  categoryId: Joi.string().required(),
  isRecurring: Joi.boolean().optional(),
  recurringDay: Joi.number().integer().min(1).max(31).optional().allow(null)
});

const updateTransactionSchema = Joi.object({
  description: Joi.string().min(1).max(255).optional(),
  amount: Joi.number().positive().optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  date: Joi.date().optional(),
  categoryId: Joi.string().optional(),
  isRecurring: Joi.boolean().optional(),
  recurringDay: Joi.number().integer().min(1).max(31).optional().allow(null)
});

class TransactionController {
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        type, 
        categoryId, 
        startDate, 
        endDate,
        search 
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const where = {
        userId: req.userId
      };

      if (type && ['income', 'expense'].includes(type)) {
        where.type = type;
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }

      if (search) {
        where.description = {
          contains: search
        };
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true,
                type: true
              }
            }
          },
          orderBy: [
            { date: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: parseInt(limit)
        }),
        prisma.transaction.count({ where })
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      });

    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: req.userId
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              type: true
            }
          }
        }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      res.json({ transaction });

    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req, res) {
    try {
      const { error, value } = transactionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details[0].message 
        });
      }

      const { description, amount, type, date, categoryId, isRecurring, recurringDay } = value;
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: req.userId
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      if (category.type !== type) {
        return res.status(400).json({ 
          error: `Categoria selecionada é para ${category.type === 'income' ? 'receitas' : 'despesas'}, mas a transação é do tipo ${type === 'income' ? 'receita' : 'despesa'}` 
        });
      }

      // Se for transação recorrente, define a data para o próximo vencimento
      let transactionDate;
      if (isRecurring && recurringDay) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        transactionDate = new Date(year, month, recurringDay);
        
        // Se a data já passou no mês atual, agenda para o próximo mês
        if (transactionDate < now) {
          transactionDate = new Date(year, month + 1, recurringDay);
        }
      } else {
        transactionDate = date ? new Date(date) : new Date();
      }

      const transaction = await prisma.transaction.create({
        data: {
          description: description.trim(),
          amount,
          type,
          date: transactionDate,
          categoryId,
          userId: req.userId,
          isRecurring: isRecurring || false,
          recurringDay: isRecurring ? recurringDay : null
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              type: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Transação criada com sucesso',
        transaction
      });

    } catch (error) {
      console.error('Erro ao criar transação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

      const { error, value } = updateTransactionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details[0].message 
        });
      }
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: req.userId
        }
      });

      if (!existingTransaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      if (value.categoryId) {
        const category = await prisma.category.findFirst({
          where: {
            id: value.categoryId,
            userId: req.userId
          }
        });

        if (!category) {
          return res.status(404).json({ error: 'Categoria não encontrada' });
        }

        const transactionType = value.type || existingTransaction.type;
        if (category.type !== transactionType) {
          return res.status(400).json({ 
            error: `Categoria selecionada é para ${category.type === 'income' ? 'receitas' : 'despesas'}, mas a transação é do tipo ${transactionType === 'income' ? 'receita' : 'despesa'}` 
          });
        }
      }

      const updateData = {
        ...value
      };

      if (value.description) {
        updateData.description = value.description.trim();
      }

      if (value.date) {
        updateData.date = new Date(value.date);
      }

      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: updateData,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              type: true
            }
          }
        }
      });

      res.json({
        message: 'Transação atualizada com sucesso',
        transaction: updatedTransaction
      });

    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: req.userId
        }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      await prisma.transaction.delete({
        where: { id }
      });

      res.json({
        message: 'Transação excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getStats(req, res) {
    try {
      const { month, year } = req.query;
      
      let startDate, endDate;
      
      if (month && year) {
        const date = new Date(year, month - 1, 1);
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      } else {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      }

      const [
        totalIncome,
        totalExpense,
        transactionCount,
        expensesByCategory,
        incomesByCategory,
        recentTransactions
      ] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId: req.userId,
            type: 'income',
            date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: {
            userId: req.userId,
            type: 'expense',
            date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        }),
        prisma.transaction.count({
          where: {
            userId: req.userId,
            date: { gte: startDate, lte: endDate }
          }
        }),
        prisma.transaction.groupBy({
          by: ['categoryId'],
          where: {
            userId: req.userId,
            type: 'expense',
            date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true },
          _count: { id: true }
        }),
        prisma.transaction.groupBy({
          by: ['categoryId'],
          where: {
            userId: req.userId,
            type: 'income',
            date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true },
          _count: { id: true }
        }),
        prisma.transaction.findMany({
          where: {
            userId: req.userId,
            date: { gte: startDate, lte: endDate }
          },
          include: {
            category: {
              select: {
                name: true,
                color: true
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 5
        })
      ]);

      const categoryIds = [
        ...expensesByCategory.map(e => e.categoryId),
        ...incomesByCategory.map(i => i.categoryId)
      ];

      const categories = await prisma.category.findMany({
        where: {
          id: { in: categoryIds }
        },
        select: {
          id: true,
          name: true,
          color: true
        }
      });

      const categoryMap = categories.reduce((acc, cat) => {
        acc[cat.id] = cat;
        return acc;
      }, {});

      const enrichedExpenses = expensesByCategory.map(expense => ({
        ...expense,
        category: categoryMap[expense.categoryId]
      }));

      const enrichedIncomes = incomesByCategory.map(income => ({
        ...income,
        category: categoryMap[income.categoryId]
      }));

      const balance = (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0);

      res.json({
        period: {
          startDate,
          endDate,
          month: String(startDate.getMonth() + 1).padStart(2, '0'),
          year: String(startDate.getFullYear())
        },
        summary: {
          totalIncome: totalIncome._sum.amount || 0,
          totalExpense: totalExpense._sum.amount || 0,
          balance,
          transactionCount
        },
        expensesByCategory: enrichedExpenses,
        incomesByCategory: enrichedIncomes,
        recentTransactions
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas das transações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getMonthlyTrend(req, res) {
    try {
      const { months = 12 } = req.query;
      
      const now = new Date();
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const startDate = new Date(now.getFullYear(), now.getMonth() - parseInt(months) + 1, 1);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId,
          date: { gte: startDate, lte: endDate }
        },
        select: {
          amount: true,
          type: true,
          date: true
        }
      });

      const monthlyData = {};
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      
      for (let i = 0; i < parseInt(months); i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        monthlyData[key] = {
          month: `${monthNames[month]} ${year}`,
          income: 0,
          expense: 0,
          balance: 0
        };
      }

      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const key = `${year}-${month}`;
        if (monthlyData[key]) {
          if (transaction.type === 'income') {
            monthlyData[key].income += transaction.amount;
          } else {
            monthlyData[key].expense += transaction.amount;
          }
        }
      });

      Object.keys(monthlyData).forEach(key => {
        monthlyData[key].balance = monthlyData[key].income - monthlyData[key].expense;
      });

      const trend = Object.keys(monthlyData)
        .sort()
        .map(key => monthlyData[key]);

      res.json({ trend });

    } catch (error) {
      console.error('Erro ao buscar tendência mensal:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

const transactionController = new TransactionController();
module.exports = transactionController;