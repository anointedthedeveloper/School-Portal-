import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { listAuditSchema } from '../validators/audit.validator';

const router = Router();
router.use(authenticate);
router.get('/', requirePermission('audit.read'), validate(listAuditSchema), auditController.list);
export default router;
