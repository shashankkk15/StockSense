import { Router } from 'express';
import * as smController from '../controllers/stockMovement.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/', smController.getStockMovements);
router.get('/levels', smController.getStockLevels);
router.get('/product/:productId', smController.getProductStock);

export default router;
