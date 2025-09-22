const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');

const prisma = new PrismaClient();

// Schemas de validação
const categorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(255).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#2196F3'),
  type: Joi.string().valid('income', 'expense').required()
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(255).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  type: Joi.string().valid('income', 'expense').optional()
});

class CategoryController {
  async getAll(req, res) {
    try {
      const { type } = req.query;
      
      const where = {
        userId: req.userId
      };

      if (type && ['income', 'expense'].includes(type)) {
        where.type = type;
      }

      const categories = await prisma.category.findMany({
        where,
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ],
        include: {
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });

      res.json({
        categories,
        total: categories.length
      });

    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const category = await prisma.category.findFirst({
        where: {
          id,
          userId: req.userId
        },
        include: {
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json({ category });

    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req, res) {
    try {
      // Validar dados de entrada
      const { error, value } = categorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details[0].message 
        });
      }

      const { name, description, color, type } = value;

      // Verificar se já existe categoria com mesmo nome para o usuário
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: name.trim(),
          userId: req.userId,
          type
        }
      });

      if (existingCategory) {
        return res.status(409).json({ 
          error: `Já existe uma categoria ${type === 'income' ? 'de receita' : 'de despesa'} com este nome` 
        });
      }

      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          description: description?.trim(),
          color,
          type,
          userId: req.userId
        }
      });

      res.status(201).json({
        message: 'Categoria criada com sucesso',
        category
      });

    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

      // Validar dados de entrada
      const { error, value } = updateCategorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details[0].message 
        });
      }

      // Verificar se categoria existe e pertence ao usuário
      const existingCategory = await prisma.category.findFirst({
        where: {
          id,
          userId: req.userId
        }
      });

      if (!existingCategory) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Se está alterando o nome, verificar duplicatas
      if (value.name && value.name !== existingCategory.name) {
        const duplicateCategory = await prisma.category.findFirst({
          where: {
            name: value.name.trim(),
            userId: req.userId,
            type: value.type || existingCategory.type,
            id: { not: id }
          }
        });

        if (duplicateCategory) {
          return res.status(409).json({ 
            error: 'Já existe uma categoria com este nome' 
          });
        }
      }

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          ...value,
          name: value.name?.trim(),
          description: value.description?.trim()
        }
      });

      res.json({
        message: 'Categoria atualizada com sucesso',
        category: updatedCategory
      });

    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se categoria existe e pertence ao usuário
      const category = await prisma.category.findFirst({
        where: {
          id,
          userId: req.userId
        },
        include: {
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Verificar se categoria tem transações associadas
      if (category._count.transactions > 0) {
        return res.status(409).json({ 
          error: 'Não é possível excluir categoria que possui transações associadas',
          transactionsCount: category._count.transactions
        });
      }

      await prisma.category.delete({
        where: { id }
      });

      res.json({
        message: 'Categoria excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await prisma.category.groupBy({
        by: ['type'],
        where: {
          userId: req.userId
        },
        _count: {
          id: true
        }
      });

      const totalTransactions = await prisma.category.findMany({
        where: {
          userId: req.userId
        },
        include: {
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });

      const categoryStats = stats.reduce((acc, stat) => {
        acc[stat.type] = stat._count.id;
        return acc;
      }, {});

      const transactionsByCategory = totalTransactions.reduce((acc, category) => {
        acc[category.type] = (acc[category.type] || 0) + category._count.transactions;
        return acc;
      }, {});

      res.json({
        categoriesCount: categoryStats,
        transactionsCount: transactionsByCategory,
        totalCategories: totalTransactions.length,
        totalTransactions: totalTransactions.reduce((sum, cat) => sum + cat._count.transactions, 0)
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas das categorias:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

const categoryController = new CategoryController();
module.exports = categoryController;