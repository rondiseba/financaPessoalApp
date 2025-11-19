import express from 'express';
import recurringController from '../controllers/recurringController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar gastos fixos
router.get('/', recurringController.list.bind(recurringController));

// Buscar pendentes do mês
router.get('/pending', recurringController.getPending.bind(recurringController));

// Criar gasto fixo
router.post('/', recurringController.create.bind(recurringController));

// Registrar pagamento mensal
router.post('/:id/payment', recurringController.registerPayment.bind(recurringController));

// Atualizar gasto fixo
router.put('/:id', recurringController.update.bind(recurringController));

// Deletar gasto fixo
router.delete('/:id', recurringController.delete.bind(recurringController));

export default router;
