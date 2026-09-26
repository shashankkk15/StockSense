import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { protect } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.use(protect);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', requireRole('inventory_manager'), productController.createProduct);
router.put('/:id', requireRole('inventory_manager'), productController.updateProduct);
router.delete('/:id', requireRole('inventory_manager'), productController.deleteProduct);

export default router;
