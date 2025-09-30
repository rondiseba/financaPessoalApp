const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/server');

const prisma = new PrismaClient();

describe('Transaction Controller', () => {
  let userToken;
  let userId;
  let categoryId;

  beforeAll(async () => {
    // Criar usuário de teste
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    userToken = userResponse.body.token;
    userId = userResponse.body.user.id;

    // Criar categoria de teste
    const categoryResponse = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Test Category',
        type: 'expense',
        color: '#FF5722'
      });

    categoryId = categoryResponse.body.category.id;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.transaction.deleteMany({
      where: { userId }
    });
    await prisma.category.deleteMany({
      where: { userId }
    });
    await prisma.user.delete({
      where: { id: userId }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        description: 'Test Transaction',
        amount: 100.50,
        type: 'expense',
        date: new Date().toISOString(),
        categoryId
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Transação criada com sucesso');
      expect(response.body.transaction).toMatchObject({
        description: transactionData.description,
        amount: transactionData.amount,
        type: transactionData.type,
        categoryId: transactionData.categoryId
      });
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: '',
          amount: -10,
          type: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Dados inválidos');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          description: 'Test',
          amount: 100,
          type: 'expense',
          categoryId
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/transactions', () => {
    let transactionId;

    beforeEach(async () => {
      // Criar transação para testes
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Filter Test Transaction',
          amount: 75.25,
          type: 'expense',
          date: new Date().toISOString(),
          categoryId
        });

      transactionId = response.body.transaction.id;
    });

    afterEach(async () => {
      // Limpar transação de teste
      await prisma.transaction.deleteMany({
        where: { id: transactionId }
      });
    });

    it('should get all transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.transactions).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter transactions by category', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ categoryId })
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.transactions).toBeInstanceOf(Array);
      response.body.transactions.forEach(transaction => {
        expect(transaction.categoryId).toBe(categoryId);
      });
    });

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ type: 'expense' })
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      response.body.transactions.forEach(transaction => {
        expect(transaction.type).toBe('expense');
      });
    });

    it('should filter transactions by search term', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ search: 'Filter Test' })
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      response.body.transactions.forEach(transaction => {
        expect(transaction.description.toLowerCase()).toContain('filter test');
      });
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ page: 1, limit: 5 })
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.itemsPerPage).toBe(5);
      expect(response.body.transactions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    let transactionId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Update Test',
          amount: 50,
          type: 'expense',
          date: new Date().toISOString(),
          categoryId
        });

      transactionId = response.body.transaction.id;
    });

    it('should update a transaction', async () => {
      const updateData = {
        description: 'Updated Transaction',
        amount: 75
      };

      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Transação atualizada com sucesso');
      expect(response.body.transaction.description).toBe(updateData.description);
      expect(response.body.transaction.amount).toBe(updateData.amount);
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app)
        .put('/api/transactions/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ description: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    let transactionId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Delete Test',
          amount: 25,
          type: 'expense',
          date: new Date().toISOString(),
          categoryId
        });

      transactionId = response.body.transaction.id;
    });

    it('should delete a transaction', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Transação excluída com sucesso');

      // Verificar se foi realmente deletada
      const checkResponse = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(checkResponse.status).toBe(404);
    });
  });

  describe('GET /api/transactions/stats', () => {
    beforeEach(async () => {
      // Criar algumas transações para estatísticas
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Stats Test 1',
          amount: 100,
          type: 'expense',
          date: new Date().toISOString(),
          categoryId
        });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Stats Test 2',
          amount: 200,
          type: 'expense',
          date: new Date().toISOString(),
          categoryId
        });
    });

    it('should get transaction statistics', async () => {
      const response = await request(app)
        .get('/api/transactions/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.summary).toBeDefined();
      expect(response.body.expensesByCategory).toBeInstanceOf(Array);
      expect(response.body.incomesByCategory).toBeInstanceOf(Array);
      expect(response.body.recentTransactions).toBeInstanceOf(Array);
    });
  });
});