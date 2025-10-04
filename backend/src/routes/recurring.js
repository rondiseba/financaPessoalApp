const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurringController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar gastos fixos
router.get('/', recurringController.list);

// Buscar pendentes do mês
router.get('/pending', recurringController.getPending);

// Criar gasto fixo
router.post('/', recurringController.create);

// Registrar pagamento mensal
router.post('/:id/payment', recurringController.registerPayment);

// Atualizar gasto fixo
router.put('/:id', recurringController.update);

// Deletar gasto fixo
router.delete('/:id', recurringController.delete);

module.exports = router;
