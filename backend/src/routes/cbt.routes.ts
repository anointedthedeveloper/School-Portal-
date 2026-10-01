import { Router } from 'express';
import { cbtController } from '../controllers/cbt.controller';
import { authenticateCbtClient, requireCbtOperation } from '../middleware/cbtAuth.middleware';
import { cbtLimiter } from '../middleware/rateLimit.middleware';
import { AppError } from '../utils/AppError';
import type { CBTOperation } from '../models/CBTIntegration';
import type { RequestHandler } from 'express';

const router = Router();
// Client auth runs first so the rate limiter can key on the verified client.
router.use(authenticateCbtClient, cbtLimiter);

router.post('/authenticate', cbtController.authenticate);

const later = (operation: CBTOperation): RequestHandler[] => [
  requireCbtOperation(operation),
  (_req, _res, next) => next(AppError.notImplemented('CBT Exam Box integration is planned for Phase 6')),
];
router.get('/exams', ...later('exams.list'));
router.get('/exams/:examId', ...later('exams.read'));
router.post('/exams/:examId/start', ...later('exams.start'));
router.post('/exams/:examId/submit', ...later('exams.submit'));
router.get('/results/:studentId', ...later('results.read'));
export default router;
