import { Attempt, BackupData, Problem, ProblemWithStats } from '../types/journal';

const STORAGE_KEYS = {
  PROBLEMS: 'dsajournal_offline_problems_v1',
  ATTEMPTS: 'dsajournal_offline_attempts_v1',
  TAGS: 'dsajournal_offline_tags_v1',
  INITIALIZED: 'dsajournal_offline_initialized_v1',
};

export const DEFAULT_TAGS: string[] = [
  'Array',
  'Hash Table',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Tree',
  'Trie',
  'Heap / Priority Queue',
  'Backtracking',
  'Graph',
  'Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math',
  'Bit Manipulation',
  'Recursion',
  'Matrix',
];

// Seed realistic sample problems if user starts fresh
export const SAMPLE_PROBLEMS: Problem[] = [
  {
    id: 'sample-p1',
    title: 'Two Sum',
    tags: ['Array', 'Hash Table'],
    createdAt: Date.now() - 14 * 86400000,
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    favorite: true,
  },
  {
    id: 'sample-p2',
    title: 'Valid Anagram',
    tags: ['Hash Table', 'Array'],
    createdAt: Date.now() - 10 * 86400000,
    leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/',
    favorite: false,
  },
  {
    id: 'sample-p3',
    title: 'Trapping Rain Water',
    tags: ['Two Pointers', 'Stack', 'Array'],
    createdAt: Date.now() - 7 * 86400000,
    leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    favorite: true,
  },
  {
    id: 'sample-p4',
    title: 'Coin Change',
    tags: ['Dynamic Programming', 'Array'],
    createdAt: Date.now() - 4 * 86400000,
    leetcodeUrl: 'https://leetcode.com/problems/coin-change/',
    favorite: false,
  },
  {
    id: 'sample-p5',
    title: 'Invert Binary Tree',
    tags: ['Tree', 'Recursion'],
    createdAt: Date.now() - 2 * 86400000,
    leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/',
    favorite: false,
  },
];

// Helper to format date YYYY-MM-DD in local time
export function formatDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatDateKey(d);
}

export const SAMPLE_ATTEMPTS: Attempt[] = [
  // Two Sum - solved 3 times
  {
    id: 'sample-a1',
    problemId: 'sample-p1',
    date: getDateOffset(14),
    timestamp: Date.now() - 14 * 86400000,
    feltDifficulty: 'Medium',
    confidence: 3,
    timeTakenMinutes: 25,
    notes: 'Used nested loops first (O(N^2)). Then learned single-pass hash map for complement lookup in O(N) time and O(N) space.',
  },
  {
    id: 'sample-a2',
    problemId: 'sample-p1',
    date: getDateOffset(6),
    timestamp: Date.now() - 6 * 86400000,
    feltDifficulty: 'Easy',
    confidence: 4,
    timeTakenMinutes: 8,
    notes: 'Recalled hash map complement immediately. Clean code with Map<number, number>.',
  },
  {
    id: 'sample-a3',
    problemId: 'sample-p1',
    date: getDateOffset(0), // Today
    timestamp: Date.now(),
    feltDifficulty: 'Easy',
    confidence: 5,
    timeTakenMinutes: 5,
    notes: 'Revision session. Flawless syntax. Handled duplicate elements check effortlessly.',
  },

  // Valid Anagram - solved 2 times
  {
    id: 'sample-a4',
    problemId: 'sample-p2',
    date: getDateOffset(10),
    timestamp: Date.now() - 10 * 86400000,
    feltDifficulty: 'Easy',
    confidence: 4,
    timeTakenMinutes: 10,
    notes: 'Count character frequencies with an integer array of size 26 or a hash map. O(N) time, O(1) auxiliary space.',
  },
  {
    id: 'sample-a5',
    problemId: 'sample-p2',
    date: getDateOffset(3),
    timestamp: Date.now() - 3 * 86400000,
    feltDifficulty: 'Easy',
    confidence: 5,
    timeTakenMinutes: 6,
    notes: 'Used fixed size 26 array count. Increment for s, decrement for t. Early return if lengths differ.',
  },

  // Trapping Rain Water - solved 2 times
  {
    id: 'sample-a6',
    problemId: 'sample-p3',
    date: getDateOffset(7),
    timestamp: Date.now() - 7 * 86400000,
    feltDifficulty: 'Hard',
    confidence: 2,
    timeTakenMinutes: 45,
    notes: 'Felt very tricky. Initially tried prefix max and suffix max arrays (O(N) space). Need to master the two-pointer O(1) space variant.',
  },
  {
    id: 'sample-a7',
    problemId: 'sample-p3',
    date: getDateOffset(1), // Yesterday
    timestamp: Date.now() - 1 * 86400000,
    feltDifficulty: 'Medium',
    confidence: 4,
    timeTakenMinutes: 18,
    notes: 'Used two pointers left=0, right=n-1, tracking leftMax and rightMax. Water trapped is determined by the shorter boundary.',
  },

  // Coin Change - solved 1 time
  {
    id: 'sample-a8',
    problemId: 'sample-p4',
    date: getDateOffset(4),
    timestamp: Date.now() - 4 * 86400000,
    feltDifficulty: 'Medium',
    confidence: 3,
    timeTakenMinutes: 30,
    notes: 'Bottom-up 1D DP: dp[i] = min(dp[i], dp[i - coin] + 1). Initialized dp with amount + 1. Base case dp[0] = 0.',
  },

  // Invert Binary Tree - solved 1 time
  {
    id: 'sample-a9',
    problemId: 'sample-p5',
    date: getDateOffset(2),
    timestamp: Date.now() - 2 * 86400000,
    feltDifficulty: 'Easy',
    confidence: 5,
    timeTakenMinutes: 7,
    notes: 'Classic recursive swap: swap(root.left, root.right), then invert(root.left) and invert(root.right).',
  },
];

export class StorageService {
  static isInitialized(): boolean {
    return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
  }

  static initializeDefaults(): void {
    if (!this.isInitialized()) {
      localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(SAMPLE_PROBLEMS));
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(SAMPLE_ATTEMPTS));
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(DEFAULT_TAGS));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  static getProblems(): Problem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROBLEMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveProblems(problems: Problem[]): void {
    localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(problems));
  }

  static getAttempts(): Attempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveAttempts(attempts: Attempt[]): void {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  }

  static getTags(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TAGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_TAGS;
    } catch {
      return DEFAULT_TAGS;
    }
  }

  static saveTags(tags: string[]): void {
    const unique = Array.from(new Set(tags.map(t => t.trim()).filter(Boolean)));
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(unique));
  }

  static addTag(tag: string): string[] {
    const clean = tag.trim();
    if (!clean) return this.getTags();
    const current = this.getTags();
    if (!current.includes(clean)) {
      const updated = [...current, clean];
      this.saveTags(updated);
      return updated;
    }
    return current;
  }

  static deleteTag(tagToDelete: string): string[] {
    const current = this.getTags();
    const updated = current.filter(t => t.toLowerCase() !== tagToDelete.toLowerCase());
    this.saveTags(updated);
    return updated;
  }

  static renameTag(oldTag: string, newTag: string): string[] {
    const cleanNew = newTag.trim();
    if (!cleanNew) return this.getTags();
    const current = this.getTags();
    const updated = current.map(t => (t.toLowerCase() === oldTag.toLowerCase() ? cleanNew : t));
    this.saveTags(updated);

    // Also update in all problems
    const problems = this.getProblems();
    const updatedProblems = problems.map(p => ({
      ...p,
      tags: p.tags.map(t => (t.toLowerCase() === oldTag.toLowerCase() ? cleanNew : t)),
    }));
    this.saveProblems(updatedProblems);
    return updated;
  }

  // Add new problem or find existing matching problem
  static addProblem(title: string, tags: string[], leetcodeUrl?: string): Problem {
    const problems = this.getProblems();
    const existing = problems.find(p => p.title.trim().toLowerCase() === title.trim().toLowerCase());
    if (existing) {
      // Merge new tags
      const mergedTags = Array.from(new Set([...existing.tags, ...tags]));
      const updated: Problem = {
        ...existing,
        tags: mergedTags,
        leetcodeUrl: leetcodeUrl || existing.leetcodeUrl,
      };
      this.saveProblems(problems.map(p => (p.id === existing.id ? updated : p)));
      return updated;
    }

    const newProblem: Problem = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: title.trim(),
      tags: Array.from(new Set(tags.map(t => t.trim()).filter(Boolean))),
      createdAt: Date.now(),
      leetcodeUrl: leetcodeUrl?.trim(),
      favorite: false,
    };

    problems.unshift(newProblem);
    this.saveProblems(problems);

    // Ensure all tags exist in master tag list
    newProblem.tags.forEach(t => this.addTag(t));

    return newProblem;
  }

  static updateProblem(id: string, updates: Partial<Problem>): Problem | null {
    const problems = this.getProblems();
    const index = problems.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updated = { ...problems[index], ...updates };
    problems[index] = updated;
    this.saveProblems(problems);

    if (updated.tags) {
      updated.tags.forEach(t => this.addTag(t));
    }
    return updated;
  }

  static deleteProblem(id: string): void {
    const problems = this.getProblems().filter(p => p.id !== id);
    this.saveProblems(problems);

    // Cascade delete attempts
    const attempts = this.getAttempts().filter(a => a.problemId !== id);
    this.saveAttempts(attempts);
  }

  static addAttempt(attemptData: Omit<Attempt, 'id' | 'timestamp'> & { timestamp?: number }): Attempt {
    const attempts = this.getAttempts();
    const newAttempt: Attempt = {
      id: 'a_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: attemptData.timestamp || Date.now(),
      ...attemptData,
    };

    attempts.unshift(newAttempt);
    this.saveAttempts(attempts);
    return newAttempt;
  }

  static deleteAttempt(attemptId: string): void {
    const attempts = this.getAttempts().filter(a => a.id !== attemptId);
    this.saveAttempts(attempts);
  }

  // Combined relational getter
  static getAllProblemsWithStats(): ProblemWithStats[] {
    const problems = this.getProblems();
    const attempts = this.getAttempts();

    return problems.map(problem => {
      const problemAttempts = attempts
        .filter(a => a.problemId === problem.id)
        .sort((a, b) => b.timestamp - a.timestamp);

      const repetitionCount = problemAttempts.length;
      const lastAttempt = problemAttempts[0] || null;
      const firstAttempt = problemAttempts[problemAttempts.length - 1] || null;

      return {
        problem,
        attempts: problemAttempts,
        repetitionCount,
        lastSolvedDate: lastAttempt ? lastAttempt.date : null,
        lastSolvedTimestamp: lastAttempt ? lastAttempt.timestamp : null,
        latestDifficulty: lastAttempt ? lastAttempt.feltDifficulty : null,
        latestConfidence: lastAttempt ? lastAttempt.confidence : null,
        firstSolvedDate: firstAttempt ? firstAttempt.date : null,
      };
    });
  }

  // Export JSON backup file
  static exportBackup(): void {
    const problems = this.getProblems();
    const attempts = this.getAttempts();
    const tags = this.getTags();

    const backupData: BackupData = {
      version: 1,
      appName: 'DSA Journal',
      exportDate: new Date().toISOString(),
      exportTimestamp: Date.now(),
      problems,
      attempts,
      tags,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = formatDateKey();
    a.href = url;
    a.download = `dsa_journal_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import JSON backup
  static async importBackup(file: File, mode: 'merge' | 'replace' = 'merge'): Promise<{ problemsCount: number; attemptsCount: number }> {
    const text = await file.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON format.');
    }

    if (!parsed || !Array.isArray(parsed.problems) || !Array.isArray(parsed.attempts)) {
      throw new Error('JSON missing problems or attempts arrays.');
    }

    const importedProblems: Problem[] = parsed.problems;
    const importedAttempts: Attempt[] = parsed.attempts;
    const importedTags: string[] = Array.isArray(parsed.tags) ? parsed.tags : [];

    if (mode === 'replace') {
      this.saveProblems(importedProblems);
      this.saveAttempts(importedAttempts);
      if (importedTags.length > 0) {
        this.saveTags(importedTags);
      }
      return { problemsCount: importedProblems.length, attemptsCount: importedAttempts.length };
    } else {
      // Merge logic: problem by ID or Title
      const currentProblems = this.getProblems();
      const currentAttempts = this.getAttempts();
      const currentTags = this.getTags();

      const problemIdMap = new Map<string, string>(); // importedId -> actualId

      importedProblems.forEach(imp => {
        const match = currentProblems.find(
          cp => cp.id === imp.id || cp.title.trim().toLowerCase() === imp.title.trim().toLowerCase()
        );
        if (match) {
          problemIdMap.set(imp.id, match.id);
          // merge tags
          match.tags = Array.from(new Set([...match.tags, ...imp.tags]));
        } else {
          currentProblems.push(imp);
          problemIdMap.set(imp.id, imp.id);
        }
      });

      // Merge attempts
      importedAttempts.forEach(impAtt => {
        const targetProblemId = problemIdMap.get(impAtt.problemId) || impAtt.problemId;
        const exists = currentAttempts.some(
          ca => ca.id === impAtt.id || (ca.problemId === targetProblemId && ca.date === impAtt.date && ca.notes === impAtt.notes)
        );
        if (!exists) {
          currentAttempts.push({
            ...impAtt,
            problemId: targetProblemId,
          });
        }
      });

      // Merge tags
      const mergedTags = Array.from(new Set([...currentTags, ...importedTags]));

      this.saveProblems(currentProblems);
      this.saveAttempts(currentAttempts);
      this.saveTags(mergedTags);

      return { problemsCount: currentProblems.length, attemptsCount: currentAttempts.length };
    }
  }

  static resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(SAMPLE_PROBLEMS));
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(SAMPLE_ATTEMPTS));
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(DEFAULT_TAGS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PROBLEMS);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(DEFAULT_TAGS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}
