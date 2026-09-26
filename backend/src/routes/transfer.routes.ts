import { Router } from 'express';
import * as trnController from '../controllers/transfer.controller';
import { protect } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.use(protect);

router.get('/', trnController.getTransfers);
router.post('/', trnController.createTransfer);
router.get('/:id', trnController.getTransfer);
router.put('/:id', trnController.updateTransfer);
router.post('/:id/validate', requireRole('inventory_manager'), trnController.validateTransferController);
router.post('/:id/cancel', requireRole('inventory_manager'), trnController.cancelTransfer);

export default router;
