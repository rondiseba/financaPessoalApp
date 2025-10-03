const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');

const prisma = new PrismaClient();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

class AuthController {
  async register(req, res) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details[0].message 
        });
      }

      const { name, email, password } = value;

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Usuário já existe com este email' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      });

      await authController.createDefaultCategories(user.id);

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user,
        token
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async login(req, res) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details[0].message 
        });
      }

      const { email, password } = value;

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      });

      res.json({ user });

    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async createDefaultCategories(userId) {
    const defaultCategories = [
      { name: 'Salário', type: 'income', color: '#4CAF50' },
      { name: 'Freelance', type: 'income', color: '#8BC34A' },
      { name: 'Investimentos', type: 'income', color: '#CDDC39' },
      { name: 'Alimentação', type: 'expense', color: '#FF5722' },
      { name: 'Transporte', type: 'expense', color: '#FF9800' },
      { name: 'Moradia', type: 'expense', color: '#F44336' },
      { name: 'Saúde', type: 'expense', color: '#E91E63' },
      { name: 'Educação', type: 'expense', color: '#9C27B0' },
      { name: 'Lazer', type: 'expense', color: '#673AB7' },
      { name: 'Compras', type: 'expense', color: '#3F51B5' },
      { name: 'Contas', type: 'expense', color: '#2196F3' }
    ];

    await prisma.category.createMany({
      data: defaultCategories.map(cat => ({
        ...cat,
        userId
      }))
    });
  }
}

const authController = new AuthController();
module.exports = authController;