import { Router } from 'express';
import categoryController from '../controllers/categoryController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', categoryController.getAll.bind(categoryController));
router.get('/stats', categoryController.getStats.bind(categoryController));
router.get('/:id', categoryController.getById.bind(categoryController));
router.post('/', categoryController.create.bind(categoryController));
router.put('/:id', categoryController.update.bind(categoryController));
router.delete('/:id', categoryController.delete.bind(categoryController));

export default router;
