import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateSettingsSchema } from '../validators/settings.validator';

const router = Router();
// Branding only: needed on the login screen before anyone is authenticated.
router.get('/public', settingsController.getPublic);
router.get('/', authenticate, requirePermission('settings.read'), settingsController.get);
router.put('/', authenticate, requirePermission('settings.update'), validate(updateSettingsSchema), settingsController.update);
export default router;
