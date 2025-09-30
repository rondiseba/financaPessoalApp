const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/server');

const prisma = new PrismaClient();

describe('Category Controller', () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    // Criar usuário de teste
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Category Test User',
        email: 'category-test@example.com',
        password: 'password123'
      });

    userToken = userResponse.body.token;
    userId = userResponse.body.user.id;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.category.deleteMany({
      where: { userId }
    });
    await prisma.user.delete({
      where: { id: userId }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/categories', () => {
    it('should create a new expense category', async () => {
      const categoryData = {
        name: 'Test Expense Category',
        type: 'expense',
        color: '#FF5722',
        description: 'Test description'
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(categoryData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Categoria criada com sucesso');
      expect(response.body.category).toMatchObject({
        name: categoryData.name,
        type: categoryData.type,
        color: categoryData.color,
        description: categoryData.description
      });
    });

    it('should create a new income category', async () => {
      const categoryData = {
        name: 'Test Income Category',
        type: 'income',
        color: '#4CAF50'
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(categoryData);

      expect(response.status).toBe(201);
      expect(response.body.category.type).toBe('income');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '',
          type: 'invalid',
          color: 'invalid-color'
        });

      expect(response.status).toBe(400);
    });

    it('should prevent duplicate category names for same type', async () => {
      const categoryData = {
        name: 'Duplicate Test',
        type: 'expense',
        color: '#FF5722'
      };

      // Criar primeira categoria
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(categoryData);

      // Tentar criar duplicata
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(categoryData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Já existe uma categoria');
    });
  });

  describe('GET /api/categories', () => {
    beforeEach(async () => {
      // Criar categorias para teste
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Filter Test Expense',
          type: 'expense',
          color: '#FF5722'
        });

      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Filter Test Income',
          type: 'income',
          color: '#4CAF50'
        });
    });

    it('should get all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.categories).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should filter categories by type', async () => {
      const response = await request(app)
        .get('/api/categories')
        .query({ type: 'expense' })
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      response.body.categories.forEach(category => {
        expect(category.type).toBe('expense');
      });
    });

    it('should filter categories by income type', async () => {
      const response = await request(app)
        .get('/api/categories')
        .query({ type: 'income' })
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      response.body.categories.forEach(category => {
        expect(category.type).toBe('income');
      });
    });
  });

  describe('PUT /api/categories/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Update Test Category',
          type: 'expense',
          color: '#FF5722'
        });

      categoryId = response.body.category.id;
    });

    it('should update a category', async () => {
      const updateData = {
        name: 'Updated Category Name',
        color: '#2196F3',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.category.name).toBe(updateData.name);
      expect(response.body.category.color).toBe(updateData.color);
      expect(response.body.category.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .put('/api/categories/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Delete Test Category',
          type: 'expense',
          color: '#FF5722'
        });

      categoryId = response.body.category.id;
    });

    it('should delete a category without transactions', async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Categoria excluída com sucesso');
    });

    it('should not delete category with transactions', async () => {
      // Primeiro criar uma transação
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Test Transaction',
          amount: 100,
          type: 'expense',
          date: new Date().toISOString(),
          categoryId
        });

      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('transações associadas');
    });
  });
});