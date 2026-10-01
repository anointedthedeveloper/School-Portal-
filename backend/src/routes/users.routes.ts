import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, listUsersSchema, userIdSchema } from '../validators/user.validator';

const router = Router();
router.use(authenticate);
router.get('/', requirePermission('users.read'), validate(listUsersSchema), usersController.list);
router.post('/', requirePermission('users.create'), validate(createUserSchema), usersController.create);
router.get('/:id', requirePermission('users.read'), validate(userIdSchema), usersController.getById);
export default router;
