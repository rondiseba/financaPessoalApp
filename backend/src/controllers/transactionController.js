const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const moment = require('moment');

const prisma = new PrismaClient();

// Schemas de validação
const transactionSchema = Joi.object({
  description: Joi.string().min(1).max(255).required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  date: Joi.date().required(),
  categoryId: Joi.string().required()
});

const updateTransactionSchema = Joi.object({
  description: Joi.string().min(1).max(255).optional(),
  amount: Joi.number().positive().optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  date: Joi.date().optional(),
  categoryId: Joi.string().optional()
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

      // Filtros
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
          contains: search,
          mode: 'insensitive'
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
      // Validar dados de entrada
      const { error, value } = transactionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details[0].message 
        });
      }

      const { description, amount, type, date, categoryId } = value;

      // Verificar se categoria existe e pertence ao usuário
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: req.userId
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Verificar se o tipo da transação é compatível com a categoria
      if (category.type !== type) {
        return res.status(400).json({ 
          error: `Categoria selecionada é para ${category.type === 'income' ? 'receitas' : 'despesas'}, mas a transação é do tipo ${type === 'income' ? 'receita' : 'despesa'}` 
        });
      }

      const transaction = await prisma.transaction.create({
        data: {
          description: description.trim(),
          amount,
          type,
          date: new Date(date),
          categoryId,
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

      // Validar dados de entrada
      const { error, value } = updateTransactionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details[0].message 
        });
      }

      // Verificar se transação existe e pertence ao usuário
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: req.userId
        }
      });

      if (!existingTransaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      // Se está alterando a categoria, verificar se existe e é compatível
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

      // Verificar se transação existe e pertence ao usuário
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
        startDate = moment(`${year}-${month}-01`).startOf('month').toDate();
        endDate = moment(startDate).endOf('month').toDate();
      } else {
        // Último mês se não especificado
        startDate = moment().startOf('month').toDate();
        endDate = moment().endOf('month').toDate();
      }

      const [
        totalIncome,
        totalExpense,
        transactionCount,
        expensesByCategory,
        incomesByCategory,
        recentTransactions
      ] = await Promise.all([
        // Total de receitas
        prisma.transaction.aggregate({
          where: {
            userId: req.userId,
            type: 'income',
            date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        }),
        // Total de despesas
        prisma.transaction.aggregate({
          where: {
            userId: req.userId,
            type: 'expense',
            date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        }),
        // Contagem de transações
        prisma.transaction.count({
          where: {
            userId: req.userId,
            date: { gte: startDate, lte: endDate }
          }
        }),
        // Despesas por categoria
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
        // Receitas por categoria
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
        // Transações recentes
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

      // Buscar nomes das categorias
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
          month: moment(startDate).format('MM'),
          year: moment(startDate).format('YYYY')
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
      
      const endDate = moment().endOf('month').toDate();
      const startDate = moment().subtract(parseInt(months) - 1, 'months').startOf('month').toDate();

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

      // Agrupar por mês
      const monthlyData = {};
      
      for (let i = 0; i < parseInt(months); i++) {
        const month = moment().subtract(i, 'months');
        const key = month.format('YYYY-MM');
        monthlyData[key] = {
          month: month.format('MMMM YYYY'),
          income: 0,
          expense: 0,
          balance: 0
        };
      }

      transactions.forEach(transaction => {
        const key = moment(transaction.date).format('YYYY-MM');
        if (monthlyData[key]) {
          if (transaction.type === 'income') {
            monthlyData[key].income += transaction.amount;
          } else {
            monthlyData[key].expense += transaction.amount;
          }
        }
      });

      // Calcular saldo
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

module.exports = new TransactionController();