import React, { useState } from 'react';
import {
  Plus,
  Search,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Attempt, Difficulty, ProblemWithStats } from '../types/journal';

interface HomeTabProps {
  problemsWithStats: ProblemWithStats[];
  allAttempts: Attempt[];
  onOpenAddModal: () => void;
  onSelectProblem: (problemId: string) => void;
  onGoToDatabase: () => void;
  onGoToCalendar: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  problemsWithStats,
  onOpenAddModal,
  onSelectProblem,
  onGoToDatabase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sort by lastSolvedTimestamp descending
  const recentProblems = [...problemsWithStats]
    .filter(p => p.attempts.length > 0)
    .sort((a, b) => (b.lastSolvedTimestamp || 0) - (a.lastSolvedTimestamp || 0));

  const filteredProblems = searchQuery.trim()
    ? recentProblems.filter(
        p =>
          p.problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.problem.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : recentProblems;

  // Relative time helper
  const getRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.round((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return dateStr;
  };

  const getDifficultyColor = (difficulty: Difficulty | null) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'Medium':
        return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'Hard':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
      default:
        return 'text-zinc-500';
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-xl mx-auto space-y-3.5 select-none font-sans">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            {filteredProblems.length} {filteredProblems.length === 1 ? 'question logged' : 'questions logged'}
          </p>
        </div>

        <button
          onClick={onGoToDatabase}
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 flex items-center gap-1 transition"
        >
          <span>All Library</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Sharp Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter recent entries or tags..."
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 transition shadow-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Feed List */}
      {filteredProblems.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-none p-8 text-center space-y-3">
          <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 mx-auto flex items-center justify-center text-zinc-400 rounded-none border border-zinc-200 dark:border-zinc-700">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
              {searchQuery ? 'No matching questions found' : 'Journal is empty'}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5 max-w-xs mx-auto">
              Tap the + button below to log your first question.
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Problem</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProblems.map(item => {
            const lastAttempt = item.attempts[0];
            const relativeTime = getRelativeTime(item.lastSolvedDate);

            return (
              <div
                key={item.problem.id}
                onClick={() => onSelectProblem(item.problem.id)}
                className="group bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-none p-3.5 transition-colors cursor-pointer"
              >
                {/* Header row: Title + Repetitions + Relative Time */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100 group-hover:underline transition-colors truncate">
                      {item.problem.title}
                    </h3>

                    {/* Metadata & Tag row with high-contrast muted accents */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                      <span className={getDifficultyColor(item.latestDifficulty)}>
                        {item.latestDifficulty || 'Unrated'}
                      </span>
                      <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        {item.repetitionCount}x solved
                      </span>
                      <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span className="text-[11px] flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {relativeTime}
                      </span>
                    </div>
                  </div>

                  {/* Confidence Rating (1-5 sharp ticks) */}
                  <div className="shrink-0 flex items-center gap-0.5 pt-1" title={`Confidence: ${item.latestConfidence}/5`}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <div
                        key={star}
                        className={`w-1.5 h-1.5 rounded-none ${
                          star <= (item.latestConfidence || 0)
                            ? 'bg-amber-500'
                            : 'bg-zinc-200 dark:bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sharp Floating Action Button (FAB) at Bottom Right */}
      <div className="fixed bottom-20 right-4 z-40 max-w-xl mx-auto">
        <button
          onClick={onOpenAddModal}
          className="w-11 h-11 rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all group"
          title="Log DSA Question"
          aria-label="Add new question"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
