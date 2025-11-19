import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

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
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query;
      
      const where: any = {
        userId: req.userId
      };

      if (type && ['income', 'expense'].includes(type as string)) {
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

  async getById(req: Request, res: Response): Promise<void> {
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
        res.status(404).json({ error: 'Categoria não encontrada' });
        return;
      }

      res.json({ category });

    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = categorySchema.validate(req.body);
      if (error) {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details[0].message 
        });
        return;
      }

      const { name, description, color, type } = value;

      const existingCategory = await prisma.category.findFirst({
        where: {
          name: name.trim(),
          userId: req.userId,
          type
        }
      });

      if (existingCategory) {
        res.status(409).json({ 
          error: `Já existe uma categoria ${type === 'income' ? 'de receita' : 'de despesa'} com este nome` 
        });
        return;
      }

      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          description: description?.trim(),
          color,
          type,
          userId: req.userId!
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

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { error, value } = updateCategorySchema.validate(req.body);
      if (error) {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details[0].message 
        });
        return;
      }

      const existingCategory = await prisma.category.findFirst({
        where: {
          id,
          userId: req.userId
        }
      });

      if (!existingCategory) {
        res.status(404).json({ error: 'Categoria não encontrada' });
        return;
      }

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
          res.status(409).json({ 
            error: 'Já existe uma categoria com este nome' 
          });
          return;
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

  async delete(req: Request, res: Response): Promise<void> {
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
        res.status(404).json({ error: 'Categoria não encontrada' });
        return;
      }

      if (category._count.transactions > 0) {
        res.status(409).json({ 
          error: 'Não é possível excluir categoria que possui transações associadas',
          transactionsCount: category._count.transactions
        });
        return;
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

  async getStats(req: Request, res: Response): Promise<void> {
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

      const categoryStats: Record<string, number> = stats.reduce((acc, stat) => {
        acc[stat.type] = stat._count.id;
        return acc;
      }, {} as Record<string, number>);

      const transactionsByCategory: Record<string, number> = totalTransactions.reduce((acc, category) => {
        acc[category.type] = (acc[category.type] || 0) + category._count.transactions;
        return acc;
      }, {} as Record<string, number>);

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

export default new CategoryController();
