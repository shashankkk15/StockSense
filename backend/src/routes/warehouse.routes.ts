import { Router } from 'express';
import * as whController from '../controllers/warehouse.controller';
import { protect } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.use(protect);

// Warehouses
router.get('/', whController.getWarehouses);
router.get('/:id', whController.getWarehouse);
router.post('/', requireRole('inventory_manager'), whController.createWarehouse);
router.put('/:id', requireRole('inventory_manager'), whController.updateWarehouse);
router.delete('/:id', requireRole('inventory_manager'), whController.deleteWarehouse);

export default router;
