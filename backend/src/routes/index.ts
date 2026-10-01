import { Router } from 'express';
import { isDatabaseReady } from '../config/database';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import settingsRoutes from './settings.routes';
import dashboardRoutes from './dashboard.routes';
import auditRoutes from './audit.routes';
import cbtRoutes from './cbt.routes';
import { placeholderRouter } from './placeholder';

const router = Router();

router.get('/health', (_req, res) => {
  const db = isDatabaseReady();
  res.status(db ? 200 : 503).json({ success: db, message: db ? 'OK' : 'Database not ready', data: { database: db ? 'up' : 'down' } });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/settings', settingsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit', auditRoutes);
router.use('/integration/cbt', cbtRoutes);

// Reserved namespaces for later phases (auth + permission enforced already).
router.use('/students', placeholderRouter('Students', 'students.read'));
router.use('/teachers', placeholderRouter('Teachers', 'teachers.read'));
router.use('/classes', placeholderRouter('Classes', 'classes.read'));
router.use('/subjects', placeholderRouter('Subjects', 'subjects.read'));
router.use('/assignments', placeholderRouter('Teacher assignments', 'assignments.read'));
router.use('/exams', placeholderRouter('Exams', 'exams.read'));
router.use('/questions', placeholderRouter('Questions', 'questions.read'));
router.use('/assessments', placeholderRouter('Assessments', 'assessments.read'));
router.use('/ca', placeholderRouter('Continuous assessment', 'ca.read'));
router.use('/results', placeholderRouter('Results', 'results.read'));
router.use('/reports', placeholderRouter('Reports', 'reports.read'));
router.use('/sessions', placeholderRouter('Academic sessions', 'sessions.read'));

export default router;
