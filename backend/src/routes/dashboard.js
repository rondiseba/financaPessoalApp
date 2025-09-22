const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas do dashboard
router.get('/', dashboardController.getDashboardData);
router.get('/goals', dashboardController.getGoalsProgress);

module.exports = router;