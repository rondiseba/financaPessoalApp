const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas CRUD de categorias
router.get('/', categoryController.getAll);
router.get('/stats', categoryController.getStats);
router.get('/:id', categoryController.getById);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;