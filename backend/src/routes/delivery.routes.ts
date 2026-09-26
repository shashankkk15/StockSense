import { Router } from 'express';
import * as delController from '../controllers/delivery.controller';
import { protect } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.use(protect);

router.get('/', delController.getDeliveries);
router.post('/', delController.createDelivery);
router.get('/:id', delController.getDelivery);
router.put('/:id', delController.updateDelivery);
router.post('/:id/validate', requireRole('inventory_manager'), delController.validateDeliveryController);
router.post('/:id/cancel', requireRole('inventory_manager'), delController.cancelDelivery);

export default router;
