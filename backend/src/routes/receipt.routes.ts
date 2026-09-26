import { Router } from 'express';
import * as recController from '../controllers/receipt.controller';
import { protect } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.use(protect);

router.get('/', recController.getReceipts);
router.post('/', recController.createReceipt);
router.get('/:id', recController.getReceipt);
router.put('/:id', recController.updateReceipt);
router.post('/:id/validate', requireRole('inventory_manager'), recController.validateReceiptController);
router.post('/:id/cancel', requireRole('inventory_manager'), recController.cancelReceipt);

export default router;
