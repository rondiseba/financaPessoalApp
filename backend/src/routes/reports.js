const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas de relatórios
router.get('/excel', reportController.generateMonthlyExcel);
router.get('/pdf', reportController.generateMonthlyPDF);
router.get('/list', reportController.listReports);
router.get('/download/:fileName', reportController.downloadReport);
router.delete('/:fileName', reportController.deleteReport);

module.exports = router;