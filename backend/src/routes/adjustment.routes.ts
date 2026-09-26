import { Router } from 'express';
import * as adjController from '../controllers/adjustment.controller';
import { protect } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.use(protect);

router.get('/', adjController.getAdjustments);
router.post('/', requireRole('inventory_manager'), adjController.createAdjustment);
router.get('/:id', adjController.getAdjustment);
router.post('/:id/validate', requireRole('inventory_manager'), adjController.validateAdjustmentController);

export default router;
