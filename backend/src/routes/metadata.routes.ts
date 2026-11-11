import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { getDepartments, getCategories, reorderCategories, createCategory, updateCategory, deleteCategory } from '../controllers/metadataController';

const router = Router();

router.use(requireAuth);

router.get('/departments', getDepartments);
router.get('/categories', getCategories);
router.post('/categories', requireRole(['admin']), createCategory);
router.put('/categories/reorder', requireRole(['admin']), reorderCategories);
router.put('/categories/:id', requireRole(['admin']), updateCategory);
router.delete('/categories/:id', requireRole(['admin']), deleteCategory);

export default router;
