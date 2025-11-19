import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import transactionRoutes from './routes/transactions';
import dashboardRoutes from './routes/dashboard';
import reportRoutes from './routes/reports';
import recurringRoutes from './routes/recurring';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recurring', recurringRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Controle de Gastos API funcionando!',
    timestamp: new Date().toISOString()
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/health`);
    console.log(`🗂️  Relatórios em: http://localhost:${PORT}/reports`);
  });
}

export default app;
