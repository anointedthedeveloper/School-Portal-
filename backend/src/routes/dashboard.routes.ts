import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/role.middleware';

const router = Router();
router.use(authenticate);
router.get('/admin', requirePermission('dashboard.admin'), dashboardController.admin);
router.get('/teacher', requirePermission('dashboard.teacher'), dashboardController.teacher);
router.get('/student', requirePermission('dashboard.student'), dashboardController.student);
export default router;
