import { Router } from 'express';
import * as catController from '../controllers/category.controller';
import { protect } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.use(protect);

router.get('/', catController.getCategories);
router.post('/', requireRole('inventory_manager'), catController.createCategory);
router.put('/:id', requireRole('inventory_manager'), catController.updateCategory);
router.delete('/:id', requireRole('inventory_manager'), catController.deleteCategory);

export default router;
