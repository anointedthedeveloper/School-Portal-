/**
 * DEVELOPMENT-ONLY seed. Creates sample data and well-known credentials.
 * Never run against a production database (the script refuses to).
 *
 *   npm run seed          # create missing sample data (idempotent)
 *   npm run seed:reset    # wipe seeded collections first
 */
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/environment';
import { connectDatabase, disconnectDatabase } from '../config/database';
import * as models from '../models';
import { CBT_OPERATIONS } from '../models/CBTIntegration';
import { schoolConfigService } from '../services/schoolConfig.service';
import { cbtIntegrationService } from '../services/cbtIntegration.service';
import type { Role } from '../types/auth';

const DEV_PASSWORD = env.SEED_PASSWORD ?? 'change-me';

const classNames = [
  { name: 'JSS 1 A', level: 'JSS 1', arm: 'A' },
  { name: 'JSS 1 B', level: 'JSS 1', arm: 'B' },
  { name: 'JSS 2 A', level: 'JSS 2', arm: 'A' },
  { name: 'SS 1 A', level: 'SS 1', arm: 'A' },
];
const subjectList = [
  { name: 'Mathematics', code: 'MTH' },
  { name: 'English Language', code: 'ENG' },
  { name: 'Basic Science', code: 'BSC' },
  { name: 'Civic Education', code: 'CVE' },
  { name: 'Computer Studies', code: 'CMP' },
];
const teacherList = [
  { first: 'Ada', last: 'Okafor', email: 'teacher1@example.com' },
  { first: 'Tunde', last: 'Bello', email: 'teacher2@example.com' },
  { first: 'Grace', last: 'Mensah', email: 'teacher3@example.com' },
];
const studentList = [
  ['Chidi', 'Eze', 'MALE'], ['Amina', 'Yusuf', 'FEMALE'], ['Kola', 'Adeyemi', 'MALE'],
  ['Ngozi', 'Obi', 'FEMALE'], ['Sam', 'Johnson', 'MALE'], ['Zainab', 'Musa', 'FEMALE'],
  ['David', 'Ibe', 'MALE'], ['Esther', 'Akin', 'FEMALE'],
] as const;

async function upsertUser(email: string, role: Role, firstName: string, lastName: string, hash: string) {
  const existing = await models.User.findOne({ email });
  if (existing) return existing;
  return models.User.create({ email, role, firstName, lastName, passwordHash: hash });
}

async function seed() {
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  await schoolConfigService.getOrCreate();

  const session = await models.AcademicSession.findOneAndUpdate(
    { name: '2025/2026' },
    { name: '2025/2026', startDate: new Date('2025-09-08'), endDate: new Date('2026-07-24'), isCurrent: true },
    { upsert: true, new: true },
  );
  await models.Term.findOneAndUpdate(
    { session: session._id, name: 'FIRST' },
    { session: session._id, name: 'FIRST', startDate: new Date('2025-09-08'), endDate: new Date('2025-12-12'), isCurrent: true },
    { upsert: true },
  );
  await models.SchoolSettings.updateOne({ key: 'default' }, { currentSession: '2025/2026', currentTerm: 'First Term' });

  await upsertUser('admin@example.com', 'ADMIN', 'System', 'Administrator', hash);

  const classes = [];
  for (const c of classNames) {
    classes.push(await models.SchoolClass.findOneAndUpdate({ name: c.name }, c, { upsert: true, new: true }));
  }
  const subjects = [];
  for (const s of subjectList) {
    subjects.push(await models.Subject.findOneAndUpdate({ code: s.code }, s, { upsert: true, new: true }));
  }

  const teachers = [];
  for (const [i, t] of teacherList.entries()) {
    const user = await upsertUser(t.email, 'TEACHER', t.first, t.last, hash);
    teachers.push(
      await models.Teacher.findOneAndUpdate({ user: user._id }, { user: user._id, staffId: `TCH-${String(i + 1).padStart(3, '0')}` }, { upsert: true, new: true }),
    );
  }

  // Each teacher gets two classes x one subject (+ a shared subject for the first).
  const assignmentPlan: Array<[number, number, number]> = [
    [0, 0, 0], [0, 1, 0], [0, 2, 0],
    [1, 0, 1], [1, 1, 1], [1, 3, 1],
    [2, 0, 4], [2, 2, 4], [2, 3, 2],
  ];
  for (const [t, c, s] of assignmentPlan) {
    const key = { teacher: teachers[t]!._id, class: classes[c]!._id, subject: subjects[s]!._id, session: session._id };
    await models.TeacherAssignment.updateOne(key, key, { upsert: true });
  }

  for (const [i, [first, last, gender]] of studentList.entries()) {
    const user = await upsertUser(`student${i + 1}@example.com`, 'STUDENT', first, last, hash);
    await models.Student.findOneAndUpdate(
      { user: user._id },
      { user: user._id, admissionNumber: `ADM-2025-${String(i + 1).padStart(3, '0')}`, class: classes[i % 2]!._id, gender },
      { upsert: true },
    );
  }

  // CBT Exam Box integration client.
  let cbtSecretNote = 'unchanged (already exists)';
  if (!(await models.CBTIntegration.findOne({ clientId: 'cbt-exam-box' }))) {
    const secret = env.CBT_API_KEY ?? crypto.randomBytes(24).toString('hex');
    await cbtIntegrationService.createClient({
      name: 'CBT Exam Box (development)', clientId: 'cbt-exam-box', secret, allowedOperations: [...CBT_OPERATIONS],
    });
    cbtSecretNote = env.CBT_API_KEY ? 'taken from CBT_API_KEY' : `generated, shown once: ${secret}`;
  }

  const counts = await Promise.all([
    models.User.countDocuments(), models.Teacher.countDocuments(), models.Student.countDocuments(),
    models.SchoolClass.countDocuments(), models.Subject.countDocuments(), models.TeacherAssignment.countDocuments(),
  ]);
  console.log('\nSeed complete (users %d, teachers %d, students %d, classes %d, subjects %d, assignments %d)', ...counts);
  console.log('\n=== DEVELOPMENT-ONLY CREDENTIALS - never use in production ===');
  console.log(`  Admin:    admin@example.com     / ${DEV_PASSWORD}`);
  console.log(`  Teachers: teacher1..3@example.com / ${DEV_PASSWORD}`);
  console.log(`  Students: student1..${studentList.length}@example.com / ${DEV_PASSWORD}`);
  console.log(`  CBT client: cbt-exam-box (secret ${cbtSecretNote})`);
  console.log('==============================================================\n');
}

async function reset() {
  for (const m of Object.values(models)) {
    if (typeof m === 'function' && 'deleteMany' in m) await (m as mongoose.Model<unknown>).deleteMany({});
  }
  console.log('Existing data cleared.');
}

async function main() {
  if (env.isProduction) {
    console.error('Refusing to seed: NODE_ENV=production. The seed creates well-known development credentials.');
    process.exit(1);
  }
  await connectDatabase();
  if (process.argv.includes('--reset')) await reset();
  await seed();
  await disconnectDatabase();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
