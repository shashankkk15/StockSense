import { Router } from 'express';
import * as whController from '../controllers/warehouse.controller';
import { protect } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.use(protect);

router.get('/', whController.getLocations);
router.post('/', requireRole('inventory_manager'), whController.createLocation);
router.put('/:id', requireRole('inventory_manager'), whController.updateLocation);
router.delete('/:id', requireRole('inventory_manager'), whController.deleteLocation);

export default router;
