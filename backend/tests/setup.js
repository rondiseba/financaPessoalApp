// Configuração global para testes
const { PrismaClient } = require('@prisma/client');

// Mock do console para reduzir ruído nos testes
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.DATABASE_URL = 'file:./test.db';

// Configurar timeout para operações assíncronas
jest.setTimeout(30000);