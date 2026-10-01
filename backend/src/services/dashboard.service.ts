import { Types, trusted } from 'mongoose';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { SchoolClass } from '../models/Class';
import { Subject } from '../models/Subject';
import { Exam } from '../models/Exam';
import { ExamResult } from '../models/ExamResult';
import { TeacherAssignment } from '../models/TeacherAssignment';
import { AuditLog } from '../models/AuditLog';
import { schoolConfigService } from './schoolConfig.service';

export const dashboardService = {
  async admin() {
    const [students, teachers, classes, subjects, activeExams, settings] = await Promise.all([
      Student.countDocuments({ status: 'ACTIVE' }),
      Teacher.countDocuments({ status: 'ACTIVE' }),
      SchoolClass.countDocuments({ isActive: true }),
      Subject.countDocuments({ isActive: true }),
      Exam.countDocuments({ status: 'ACTIVE' }),
      schoolConfigService.getOrCreate(),
    ]);
    return {
      totals: { students, teachers, classes, subjects, activeExams },
      currentSession: settings.currentSession,
      currentTerm: settings.currentTerm,
    };
  },

  async teacher(userId: string) {
    const settings = await schoolConfigService.getOrCreate();
    const teacher = await Teacher.findOne({ user: userId });
    const base = { currentSession: settings.currentSession, currentTerm: settings.currentTerm };
    if (!teacher) {
      return { ...base, profileLinked: false, assignedClasses: [], assignedSubjects: [], examCount: 0, recentActivity: [] };
    }

    const [assignments, examCount, recentActivity] = await Promise.all([
      TeacherAssignment.find({ teacher: teacher._id }).populate('class', 'name').populate('subject', 'name code'),
      Exam.countDocuments({ teacher: teacher._id }),
      AuditLog.find({ user: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const classes = new Map<string, string>();
    const subjects = new Map<string, string>();
    for (const a of assignments) {
      const cls = a.class as unknown as { _id: Types.ObjectId; name: string } | null;
      const sub = a.subject as unknown as { _id: Types.ObjectId; name: string } | null;
      if (cls) classes.set(String(cls._id), cls.name);
      if (sub) subjects.set(String(sub._id), sub.name);
    }
    return {
      ...base,
      profileLinked: true,
      assignedClasses: [...classes].map(([id, name]) => ({ id, name })),
      assignedSubjects: [...subjects].map(([id, name]) => ({ id, name })),
      examCount,
      recentActivity: recentActivity.map((a) => ({ action: a.action, entity: a.entity, at: a.createdAt })),
    };
  },

  async student(userId: string) {
    const settings = await schoolConfigService.getOrCreate();
    const student = await Student.findOne({ user: userId }).populate('class', 'name');
    const base = { currentSession: settings.currentSession, currentTerm: settings.currentTerm };
    if (!student) {
      return { ...base, profileLinked: false, currentClass: null, availableExams: 0, recentResults: [] };
    }
    const cls = student.class as unknown as { _id: Types.ObjectId; name: string } | null;
    const [availableExams, results] = await Promise.all([
      cls ? Exam.countDocuments({ class: cls._id, status: trusted({ $in: ['PUBLISHED', 'ACTIVE'] }) }) : 0,
      ExamResult.find({ student: student._id, published: true })
        .sort({ publishedAt: -1 })
        .limit(5)
        .populate('exam', 'title'),
    ]);
    return {
      ...base,
      profileLinked: true,
      currentClass: cls ? { id: String(cls._id), name: cls.name } : null,
      availableExams,
      recentResults: results.map((r) => ({
        id: String(r._id),
        exam: (r.exam as unknown as { title?: string } | null)?.title ?? 'Exam',
        score: r.score,
        totalMarks: r.totalMarks,
        percentage: r.percentage,
      })),
    };
  },
};
