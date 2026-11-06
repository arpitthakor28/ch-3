// REST API Client & Local Synchronizer (PRD Section 7 & 8)

export interface StudentProgress {
  studentId: string;
  chapterId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  prediction?: { answer: string; savedAt: string };
  explanation?: { text: string; savedAt: string };
  quiz?: { score: number; max: number; attempts: number };
  secondsActive: number;
  lastAccessedAt: string;
  interactionsCompleted: string[];
}

export interface ObservationRecord {
  id: string;
  studentId: string;
  moduleId: string;
  kind: 'table' | 'text';
  data: any;
  savedAt: string;
}

export interface AnalyticsEvent {
  studentId: string;
  moduleId: string;
  type: string;
  payload?: any;
  ts: string;
}

export interface ClassAssignment {
  id: string;
  classId: string;
  moduleId: string;
  dueAt: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  STUDENT_PSEUDO_ID: 'vls_student_pseudo_id',
  CLASS_ID: 'vls_class_id',
  PROGRESS_PREFIX: 'vls_prog_',
  OBSERVATIONS: 'vls_observations',
  EVENTS_QUEUE: 'vls_events_queue',
  ASSIGNMENTS: 'vls_assignments',
};

// Generate an anonymous pseudonymous ID (e.g., student-7x9q)
export function getOrCreatePseudoId(): string {
  let id = localStorage.getItem(STORAGE_KEYS.STUDENT_PSEUDO_ID);
  if (!id) {
    const rand = Math.random().toString(36).substring(2, 7);
    id = `learner-${rand}`;
    localStorage.setItem(STORAGE_KEYS.STUDENT_PSEUDO_ID, id);
  }
  return id;
}

export function setStudentPseudoId(newId: string): void {
  localStorage.setItem(STORAGE_KEYS.STUDENT_PSEUDO_ID, newId);
}

export function getClassId(): string {
  return localStorage.getItem(STORAGE_KEYS.CLASS_ID) || 'Class9-A';
}

export function setClassId(newClassId: string): void {
  localStorage.setItem(STORAGE_KEYS.CLASS_ID, newClassId);
}

class ApiService {
  private pseudoId: string;

  constructor() {
    this.pseudoId = getOrCreatePseudoId();
  }

  // GET /api/chapters/C9-03/modules
  async getModulesSummary(): Promise<Record<string, StudentProgress>> {
    const result: Record<string, StudentProgress> = {};
    for (let i = 1; i <= 11; i++) {
      const modId = `M${String(i).padStart(2, '0')}`;
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS_PREFIX + modId);
      if (saved) {
        try {
          result[modId] = JSON.parse(saved);
        } catch {
          // ignore corrupted data
        }
      } else {
        result[modId] = {
          studentId: this.pseudoId,
          chapterId: 'C9-03',
          moduleId: modId,
          status: 'not_started',
          secondsActive: 0,
          lastAccessedAt: new Date().toISOString(),
          interactionsCompleted: [],
        };
      }
    }
    return result;
  }

  // GET /api/progress/:moduleId
  async getModuleProgress(moduleId: string): Promise<StudentProgress> {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS_PREFIX + moduleId);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      studentId: this.pseudoId,
      chapterId: 'C9-03',
      moduleId,
      status: 'not_started',
      secondsActive: 0,
      lastAccessedAt: new Date().toISOString(),
      interactionsCompleted: [],
    };
  }

  // PUT /api/progress/:moduleId
  async saveProgress(moduleId: string, updates: Partial<StudentProgress>): Promise<StudentProgress> {
    const current = await this.getModuleProgress(moduleId);
    const updated: StudentProgress = {
      ...current,
      ...updates,
      lastAccessedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.PROGRESS_PREFIX + moduleId, JSON.stringify(updated));
    return updated;
  }

  // POST /api/observations
  async saveObservation(moduleId: string, kind: 'table' | 'text', data: any): Promise<ObservationRecord> {
    const allObs: ObservationRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.OBSERVATIONS) || '[]');
    const record: ObservationRecord = {
      id: `obs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: this.pseudoId,
      moduleId,
      kind,
      data,
      savedAt: new Date().toISOString(),
    };
    // Replace or add
    const existingIndex = allObs.findIndex((o) => o.studentId === this.pseudoId && o.moduleId === moduleId);
    if (existingIndex >= 0) {
      allObs[existingIndex] = record;
    } else {
      allObs.push(record);
    }
    localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(allObs));
    return record;
  }

  async getObservation(moduleId: string): Promise<ObservationRecord | null> {
    const allObs: ObservationRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.OBSERVATIONS) || '[]');
    return allObs.find((o) => o.studentId === this.pseudoId && o.moduleId === moduleId) || null;
  }

  // POST /api/events (batch analytics events)
  async logEvent(moduleId: string, type: string, payload?: any): Promise<void> {
    const event: AnalyticsEvent = {
      studentId: this.pseudoId,
      moduleId,
      type,
      payload,
      ts: new Date().toISOString(),
    };
    const queue: AnalyticsEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS_QUEUE) || '[]');
    queue.push(event);
    if (queue.length > 500) queue.shift();
    localStorage.setItem(STORAGE_KEYS.EVENTS_QUEUE, JSON.stringify(queue));
  }

  // GET /api/teacher/classes/:id/progress (V4 Feature)
  async getTeacherClassProgress(classId: string): Promise<{
    students: { pseudoId: string; completedCount: number; avgScore: number; activeMinutes: number }[];
    moduleCompletionRates: Record<string, number>;
  }> {
    // Generate realistic class cohort based on saved data + peer student data for demo
    const myProgress = await this.getModulesSummary();
    const myCompleted = Object.values(myProgress).filter((p) => p.status === 'completed').length;
    const myScoreSum = Object.values(myProgress).reduce((acc, p) => acc + (p.quiz?.score || 0), 0);
    const myScoreMax = Object.values(myProgress).reduce((acc, p) => acc + (p.quiz?.max || 0), 0);
    const myActiveSec = Object.values(myProgress).reduce((acc, p) => acc + (p.secondsActive || 0), 0);

    const students = [
      {
        pseudoId: this.pseudoId + ' (You)',
        completedCount: myCompleted,
        avgScore: myScoreMax > 0 ? Math.round((myScoreSum / myScoreMax) * 100) : 0,
        activeMinutes: Math.round(myActiveSec / 60),
      },
      { pseudoId: 'student-9a01', completedCount: 11, avgScore: 92, activeMinutes: 48 },
      { pseudoId: 'student-9a02', completedCount: 9, avgScore: 84, activeMinutes: 41 },
      { pseudoId: 'student-9a03', completedCount: 7, avgScore: 78, activeMinutes: 34 },
      { pseudoId: 'student-9a04', completedCount: 10, avgScore: 88, activeMinutes: 45 },
      { pseudoId: 'student-9a05', completedCount: 4, avgScore: 72, activeMinutes: 20 },
    ];

    const moduleCompletionRates: Record<string, number> = {};
    for (let i = 1; i <= 11; i++) {
      const modId = `M${String(i).padStart(2, '0')}`;
      const isMineComplete = myProgress[modId]?.status === 'completed' ? 1 : 0;
      // Class base completion rates
      const cohortComplete = [1, 1, 1, 1, 1, 0][i % 6];
      moduleCompletionRates[modId] = Math.round(((isMineComplete + cohortComplete * 4) / 5) * 100);
    }

    return { students, moduleCompletionRates };
  }

  // POST /api/teacher/assignments
  async getAssignments(): Promise<ClassAssignment[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || '[]');
  }

  async createAssignment(moduleId: string, dueAt: string): Promise<ClassAssignment> {
    const assignments = await this.getAssignments();
    const newAss: ClassAssignment = {
      id: `asg_${Date.now()}`,
      classId: getClassId(),
      moduleId,
      dueAt,
      createdAt: new Date().toISOString(),
    };
    assignments.push(newAss);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    return newAss;
  }
}

export const api = new ApiService();
