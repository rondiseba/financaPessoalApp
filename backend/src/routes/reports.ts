import express from 'express';
import reportController from '../controllers/reportController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/excel', reportController.generateMonthlyExcel.bind(reportController));
router.get('/pdf', reportController.generateMonthlyPDF.bind(reportController));
router.get('/list', reportController.listReports.bind(reportController));
router.get('/download/:fileName', reportController.downloadReport.bind(reportController));
router.delete('/:fileName', reportController.deleteReport.bind(reportController));

export default router;
