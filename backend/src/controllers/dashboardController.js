const { PrismaClient } = require('@prisma/client');
const moment = require('moment');

const prisma = new PrismaClient();

class DashboardController {
  async getDashboardData(req, res) {
    try {
      const { period = 'current' } = req.query;
      
      let startDate, endDate;
      
      switch (period) {
        case 'current':
          startDate = moment().startOf('month').toDate();
          endDate = moment().endOf('month').toDate();
          break;
        case 'last':
          startDate = moment().subtract(1, 'month').startOf('month').toDate();
          endDate = moment().subtract(1, 'month').endOf('month').toDate();
          break;
        case 'year':
          startDate = moment().startOf('year').toDate();
          endDate = moment().endOf('year').toDate();
          break;
        default:
          startDate = moment().startOf('month').toDate();
          endDate = moment().endOf('month').toDate();
      }

      const [
        totalStats,
        categoryStats,
        monthlyTrend,
        recentTransactions,
        topCategories
      ] = await Promise.all([
        dashboardController.getTotalStats(req.userId, startDate, endDate),
        dashboardController.getCategoryStats(req.userId, startDate, endDate),
        dashboardController.getMonthlyTrend(req.userId),
        dashboardController.getRecentTransactions(req.userId),
        dashboardController.getTopCategories(req.userId, startDate, endDate)
      ]);

      // Estrutura de resposta conforme esperado pelo frontend
      res.json({
        stats: totalStats,
        recentTransactions,
        monthlyTrend,
        categoryBreakdown: [
          ...categoryStats.expenses.map(exp => ({
            categoryId: exp.categoryId,
            categoryName: exp.category?.name || 'Sem categoria',
            color: exp.category?.color || '#999',
            totalAmount: exp._sum.amount || 0,
            transactionCount: exp._count.id || 0,
            type: 'expense'
          })),
          ...categoryStats.incomes.map(inc => ({
            categoryId: inc.categoryId,
            categoryName: inc.category?.name || 'Sem categoria',
            color: inc.category?.color || '#999',
            totalAmount: inc._sum.amount || 0,
            transactionCount: inc._count.id || 0,
            type: 'income'
          }))
        ]
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getTotalStats(userId, startDate, endDate) {
    const [income, expense, transactionCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'income',
          date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'expense',
          date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.count({
        where: {
          userId,
          date: { gte: startDate, lte: endDate }
        }
      })
    ]);

    const totalIncome = income._sum.amount || 0;
    const totalExpense = expense._sum.amount || 0;
    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount,
      savingsRate: totalIncome > 0 ? ((balance / totalIncome) * 100) : 0
    };
  }

  async getCategoryStats(userId, startDate, endDate) {
    const [expensesByCategory, incomesByCategory] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'expense',
          date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'income',
          date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true },
        _count: { id: true }
      })
    ]);

    // Buscar informações das categorias
    const categoryIds = [
      ...expensesByCategory.map(e => e.categoryId),
      ...incomesByCategory.map(i => i.categoryId)
    ];

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, type: true }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {});

    return {
      expenses: expensesByCategory.map(exp => ({
        ...exp,
        category: categoryMap[exp.categoryId]
      })),
      incomes: incomesByCategory.map(inc => ({
        ...inc,
        category: categoryMap[inc.categoryId]
      }))
    };
  }

  async getMonthlyTrend(userId, months = 6) {
    const endDate = moment().endOf('month').toDate();
    const startDate = moment().subtract(months - 1, 'months').startOf('month').toDate();

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      },
      select: {
        amount: true,
        type: true,
        date: true
      }
    });

    const monthlyData = {};
    
    for (let i = 0; i < months; i++) {
      const month = moment().subtract(i, 'months');
      const key = month.format('YYYY-MM');
      monthlyData[key] = {
        month: month.format('MMM/YY'),
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

    Object.keys(monthlyData).forEach(key => {
      monthlyData[key].balance = monthlyData[key].income - monthlyData[key].expense;
    });

    return Object.keys(monthlyData)
      .sort()
      .map(key => monthlyData[key]);
  }

  async getRecentTransactions(userId, limit = 10) {
    return await prisma.transaction.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });
  }

  async getTopCategories(userId, startDate, endDate, limit = 5) {
    const topExpenseCategories = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'expense',
        date: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: limit
    });

    const categoryIds = topExpenseCategories.map(cat => cat.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {});

    return topExpenseCategories.map(cat => ({
      ...cat,
      category: categoryMap[cat.categoryId]
    }));
  }

  getPeriodLabel(period) {
    switch (period) {
      case 'current':
        return 'Mês Atual';
      case 'last':
        return 'Mês Passado';
      case 'year':
        return 'Ano Atual';
      default:
        return 'Período';
    }
  }

  async getGoalsProgress(req, res) {
    try {
      const currentMonth = moment().month() + 1;
      const currentYear = moment().year();

      const budgets = await prisma.budget.findMany({
        where: {
          userId: req.userId,
          month: currentMonth,
          year: currentYear
        }
      });

      const categoryIds = budgets.map(b => b.categoryId);
      
      const [categories, actualSpending] = await Promise.all([
        prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, color: true }
        }),
        prisma.transaction.groupBy({
          by: ['categoryId'],
          where: {
            userId: req.userId,
            type: 'expense',
            categoryId: { in: categoryIds },
            date: {
              gte: moment().startOf('month').toDate(),
              lte: moment().endOf('month').toDate()
            }
          },
          _sum: { amount: true }
        })
      ]);

      const categoryMap = categories.reduce((acc, cat) => {
        acc[cat.id] = cat;
        return acc;
      }, {});

      const spendingMap = actualSpending.reduce((acc, spending) => {
        acc[spending.categoryId] = spending._sum.amount;
        return acc;
      }, {});

      const goalsProgress = budgets.map(budget => {
        const category = categoryMap[budget.categoryId];
        const spent = spendingMap[budget.categoryId] || 0;
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
          categoryId: budget.categoryId,
          category,
          budgetAmount: budget.amount,
          spentAmount: spent,
          remainingAmount: budget.amount - spent,
          percentage: Math.round(percentage),
          status: percentage > 100 ? 'exceeded' : percentage > 80 ? 'warning' : 'on_track'
        };
      });

      res.json({ goalsProgress });

    } catch (error) {
      console.error('Erro ao buscar progresso das metas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

const dashboardController = new DashboardController();
module.exports = dashboardController;