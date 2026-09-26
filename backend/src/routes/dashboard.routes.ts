import { Router } from 'express';
import * as dashController from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/', dashController.getDashboard);
router.get('/overview', dashController.getDashboardOverview);

export default router;
