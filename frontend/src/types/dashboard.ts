export interface AdminDashboard {
  totals: { students: number; teachers: number; classes: number; subjects: number; activeExams: number };
  currentSession: string;
  currentTerm: string;
}

export interface NamedRef {
  id: string;
  name: string;
}

export interface TeacherDashboard {
  currentSession: string;
  currentTerm: string;
  profileLinked: boolean;
  assignedClasses: NamedRef[];
  assignedSubjects: NamedRef[];
  examCount: number;
  recentActivity: { action: string; entity: string; at: string }[];
}

export interface StudentDashboard {
  currentSession: string;
  currentTerm: string;
  profileLinked: boolean;
  currentClass: NamedRef | null;
  availableExams: number;
  recentResults: { id: string; exam: string; score: number; totalMarks: number; percentage: number }[];
}
