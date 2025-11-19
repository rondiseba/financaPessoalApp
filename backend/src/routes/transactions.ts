import express from 'express';
import transactionController from '../controllers/transactionController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', transactionController.getAll.bind(transactionController));
router.get('/stats', transactionController.getStats.bind(transactionController));
router.get('/monthly-trend', transactionController.getMonthlyTrend.bind(transactionController));
router.get('/:id', transactionController.getById.bind(transactionController));
router.post('/', transactionController.create.bind(transactionController));
router.put('/:id', transactionController.update.bind(transactionController));
router.delete('/:id', transactionController.delete.bind(transactionController));

export default router;
