import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Clock,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react';
import { Difficulty, ProblemWithStats } from '../types/journal';
import { getTagClasses } from '../utils/tagColors';

interface DatabaseTabProps {
  problemsWithStats: ProblemWithStats[];
  allTags: string[];
  onSelectProblem: (problemId: string) => void;
  onOpenAddModal: () => void;
  onSolveAgain: (problemId: string) => void;
}

type SortOption = 'recent' | 'reps_desc' | 'reps_asc' | 'title' | 'confidence_asc';

export const DatabaseTab: React.FC<DatabaseTabProps> = ({
  problemsWithStats,
  allTags,
  onSelectProblem,
  onOpenAddModal,
  onSolveAgain,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const filteredProblems = useMemo(() => {
    let result = [...problemsWithStats];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const titleMatch = p.problem.title.toLowerCase().includes(q);
        const tagMatch = p.problem.tags.some(t => t.toLowerCase().includes(q));
        const noteMatch = p.attempts.some(a => a.notes.toLowerCase().includes(q));
        return titleMatch || tagMatch || noteMatch;
      });
    }

    if (selectedTag !== 'All') {
      result = result.filter(p => p.problem.tags.includes(selectedTag));
    }

    if (selectedDifficulty !== 'All') {
      result = result.filter(p => p.latestDifficulty === selectedDifficulty);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return (b.lastSolvedTimestamp || 0) - (a.lastSolvedTimestamp || 0);
        case 'reps_desc':
          return b.repetitionCount - a.repetitionCount;
        case 'reps_asc':
          return a.repetitionCount - b.repetitionCount;
        case 'title':
          return a.problem.title.localeCompare(b.problem.title);
        case 'confidence_asc':
          return (a.latestConfidence || 0) - (b.latestConfidence || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [problemsWithStats, searchQuery, selectedTag, selectedDifficulty, sortBy]);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <span>Problem Catalog</span>
            <span className="font-mono text-[11px] text-zinc-400">({filteredProblems.length})</span>
          </h2>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Master database of all questions</p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold shadow-none transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Sharp Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by title, tag, or notes..."
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 transition"
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

      {/* Filter and Sort Segment */}
      <div className="space-y-2">
        {/* Tag Filters Carousel with Sharp Borders */}
        <div className="overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none flex gap-1">
          <button
            onClick={() => setSelectedTag('All')}
            className={`px-2 py-0.5 rounded-none text-xs font-mono transition border ${
              selectedTag === 'All'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
            }`}
          >
            All Tags
          </button>
          {allTags.map(tag => {
            const count = problemsWithStats.filter(p => p.problem.tags.includes(tag)).length;
            if (count === 0 && selectedTag !== tag) return null;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2 py-0.5 rounded-none text-xs font-mono whitespace-nowrap transition border ${
                  selectedTag === tag
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                    : `${getTagClasses(tag)} hover:opacity-90`
                }`}
              >
                {tag} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: Difficulty & Sort Order */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2 py-0.5 rounded-none border text-[11px] font-mono transition ${
                  selectedDifficulty === diff
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
            <ArrowUpDown className="w-3 h-3" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-[11px] text-zinc-700 dark:text-zinc-300 focus:outline-none border-b border-zinc-200 dark:border-zinc-800 pb-0.5"
            >
              <option value="recent">Recent</option>
              <option value="reps_desc">Most Repetitions</option>
              <option value="reps_asc">Least Repetitions</option>
              <option value="title">A-Z</option>
              <option value="confidence_asc">Lowest Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problem Cards List */}
      {filteredProblems.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-none p-8 text-center space-y-2">
          <p className="text-xs text-zinc-500">No matching questions in library.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProblems.map(item => {
            const relativeTime = getRelativeTime(item.lastSolvedDate);
            const latestAttempt = item.attempts[0];

            return (
              <div
                key={item.problem.id}
                className="bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-none p-3.5 space-y-2 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => onSelectProblem(item.problem.id)}
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100 hover:underline transition-colors">
                      {item.problem.title}
                    </h3>

                    {/* Metadata */}
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

                    {/* Muted Accent Tags */}
                    {item.problem.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        {item.problem.tags.map(tag => (
                          <span
                            key={tag}
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded-none border ${getTagClasses(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => onSolveAgain(item.problem.id)}
                      className="px-2 py-0.5 rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900/5 dark:bg-zinc-100/10 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-medium hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-950 transition active:scale-95"
                    >
                      Solve
                    </button>
                    <button
                      onClick={() => onSelectProblem(item.problem.id)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
