export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Attempt {
  id: string;
  problemId: string;
  date: string; // Format 'YYYY-MM-DD'
  timestamp: number;
  feltDifficulty: Difficulty;
  confidence: number; // 1 to 5
  timeTakenMinutes?: number;
  notes: string;
}

export interface Problem {
  id: string;
  title: string;
  tags: string[];
  createdAt: number;
  leetcodeUrl?: string;
  favorite?: boolean;
}

export interface ProblemWithStats {
  problem: Problem;
  attempts: Attempt[];
  repetitionCount: number;
  lastSolvedDate: string | null;
  lastSolvedTimestamp: number | null;
  latestDifficulty: Difficulty | null;
  latestConfidence: number | null;
  firstSolvedDate: string | null;
}

export interface BackupData {
  version: number;
  exportDate: string;
  exportTimestamp: number;
  appName: string;
  problems: Problem[];
  attempts: Attempt[];
  tags: string[];
}
