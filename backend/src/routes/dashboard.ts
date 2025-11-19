import express from 'express';
import dashboardController from '../controllers/dashboardController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', dashboardController.getDashboardData.bind(dashboardController));
router.get('/goals', dashboardController.getGoalsProgress.bind(dashboardController));

export default router;
