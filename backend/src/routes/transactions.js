const express = require('express');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas CRUD de transações
router.get('/', transactionController.getAll);
router.get('/stats', transactionController.getStats);
router.get('/trend', transactionController.getMonthlyTrend);
router.get('/:id', transactionController.getById);
router.post('/', transactionController.create);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.delete);

module.exports = router;